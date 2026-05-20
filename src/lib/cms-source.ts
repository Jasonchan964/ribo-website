import { unstable_noStore as noStore } from "next/cache";
import type { CaseStudy, Product } from "@/lib/types";
import { mapPayloadCaseStudy, mapPayloadProduct } from "@/payload/map-cms";
import { getPayloadClient, isPayloadConfigured } from "@/payload/get-payload";

type CmsContent = {
  products: Product[];
  caseStudies: CaseStudy[];
};

/**
 * 从 Payload 拉取内容。成功时始终使用 CMS 数据（即使为空数组），仅在未配置或连接失败时返回 null 以回退 Mock。
 */
async function loadFromPayload(): Promise<CmsContent | null> {
  if (!isPayloadConfigured()) return null;

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
