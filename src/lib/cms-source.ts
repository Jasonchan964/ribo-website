import { unstable_noStore as noStore } from "next/cache";
import type { CaseStudy, Product } from "@/lib/types";
import { mapPayloadCaseStudy, mapPayloadProduct } from "@/payload/map-cms";
import { getPayloadClient, isPayloadConfigured } from "@/payload/get-payload";

type CmsContent = {
  products: Product[];
  caseStudies: CaseStudy[];
};

function isProductionBuildPhase(): boolean {
  return (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.npm_lifecycle_event === "build"
  );
}

/**
 * 从 Payload 拉取内容。成功时始终使用 CMS 数据（即使为空数组），仅在未配置或连接失败时返回 null 以回退 Mock。
 */
async function loadFromPayload(): Promise<CmsContent | null> {
  if (!isPayloadConfigured() || isProductionBuildPhase()) return null;

  noStore();

  try {
    const payload = await getPayloadClient();
    const [productsResult, casesResult] = await Promise.all([
      payload.find({
        collection: "products",
        limit: 100,
        depth: 2,
        sort: "-publishedAt",
        overrideAccess: true,
      }),
      payload.find({
        collection: "case-studies",
        limit: 100,
        depth: 2,
        sort: "-publishedAt",
        overrideAccess: true,
      }),
    ]);

    return {
      products: productsResult.docs
        .map((doc) => mapPayloadProduct(doc))
        .filter((p): p is Product => p !== null),
      caseStudies: casesResult.docs
        .map((doc) => mapPayloadCaseStudy(doc))
        .filter((c): c is CaseStudy => c !== null),
    };
  } catch (error) {
    console.warn("[cms] Payload unavailable, using mock data.", error);
    return null;
  }
}

export async function resolveCmsContent(
  mock: CmsContent,
): Promise<CmsContent> {
  const fromPayload = await loadFromPayload();
  return fromPayload ?? mock;
}

/**
 * 按 URL slug 从 Payload 查询单个产品（与 locale 无关：多语言在 name.cn / name.en 字段组内）。
 */
export async function getProductFromPayloadBySlug(
  slug: string,
): Promise<Product | null> {
  if (!isPayloadConfigured() || isProductionBuildPhase() || !slug) return null;

  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug).trim();
  } catch {
    decoded = slug.trim();
  }

  const candidates = [...new Set([decoded, decoded.toLowerCase()])].filter(
    Boolean,
  );

  noStore();

  try {
    const payload = await getPayloadClient();

    for (const candidate of candidates) {
      const result = await payload.find({
        collection: "products",
        where: {
          slug: {
            equals: candidate,
          },
        },
        limit: 1,
        depth: 2,
        overrideAccess: true,
      });

      const doc = result.docs[0];
      if (!doc) continue;

      const mapped = mapPayloadProduct(doc);
      if (mapped) return mapped;
    }

    return null;
  } catch (error) {
    console.warn("[cms] getProductFromPayloadBySlug failed:", error);
    return null;
  }
}
