import { resolveCloudinaryMediaUrl } from "@/lib/cloudinary/delivery";
import { isCloudinaryMediaStorageEnabled } from "@/lib/cloudinary/config";
import type { CaseStudy, LocalizedString, Product } from "@/lib/types";

type LocalizedPayload = { cn?: string | null; en?: string | null } | null | undefined;

type MediaDoc = {
  url?: string | null;
  mimeType?: string | null;
  cloudinaryPublicId?: string | null;
  filename?: string | null;
};

function toLocalized(value: LocalizedPayload): LocalizedString {
  return {
    cn: value?.cn ?? "",
    en: value?.en ?? "",
  };
}

function resolveMediaUrl(media: MediaDoc | string | number | null | undefined): string {
  if (!media || typeof media === "string" || typeof media === "number") return "";

  const doc = media as MediaDoc;

  if (isCloudinaryMediaStorageEnabled()) {
    const cloudinaryUrl = resolveCloudinaryMediaUrl(doc);
    if (cloudinaryUrl) return cloudinaryUrl;
  }

  const rawUrl = typeof doc.url === "string" ? doc.url.trim() : "";

  /** 同站资源保持相对路径，避免 NEXT_PUBLIC_SITE_URL 指向正式域时在本地把图片拼成外站 URL 导致 next/image 报错 */
  if (rawUrl.startsWith("/")) {
    return rawUrl;
  }

  return rawUrl;
}

function resolveVideoUrl(
  video: MediaDoc | string | number | null | undefined,
  externalUrl?: string | null,
): string | undefined {
  const uploaded = resolveMediaUrl(video);
  if (uploaded) return uploaded;
  const external = externalUrl?.trim();
  return external || undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapPayloadProduct(doc: Record<string, any>): Product | null {
  const slug = typeof doc.slug === "string" ? doc.slug.trim() : "";
  if (!slug) return null;

  const mainImage = resolveMediaUrl(doc.mainImage);
  const gallery =
    Array.isArray(doc.gallery) && doc.gallery.length > 0
      ? doc.gallery
          .map((row: { image?: MediaDoc | string | number }) =>
            resolveMediaUrl(row?.image),
          )
          .filter(Boolean)
      : undefined;

  return {
    id: String(doc.id),
    slug,
    featured: Boolean(doc.featured),
    name: toLocalized(doc.name),
    shortDescription: toLocalized(doc.shortDescription),
    description: toLocalized(doc.description),
    mainImage,
    gallery,
    videoUrl: resolveVideoUrl(doc.video, doc.videoUrl),
    specifications: (Array.isArray(doc.specifications)
      ? doc.specifications
      : []
    ).map(
      (spec: {
        label: LocalizedPayload;
        value: LocalizedPayload;
        unit?: LocalizedPayload;
      }) => ({
        label: toLocalized(spec.label),
        value: toLocalized(spec.value),
        ...(spec.unit?.cn || spec.unit?.en
          ? { unit: toLocalized(spec.unit) }
          : {}),
      }),
    ),
    metaKeywords: doc.metaKeywords?.cn || doc.metaKeywords?.en
      ? toLocalized(doc.metaKeywords)
      : undefined,
    reviews: (Array.isArray(doc.reviews) ? doc.reviews : []).map(
      (review: {
        author: LocalizedPayload;
        reviewBody: LocalizedPayload;
        ratingValue: number;
        datePublished: string;
      }) => ({
        author: toLocalized(review.author),
        reviewBody: toLocalized(review.reviewBody),
        ratingValue: review.ratingValue,
        datePublished: review.datePublished,
      }),
    ),
    publishedAt: doc.publishedAt ?? doc.createdAt,
    updatedAt: doc.updatedAt ?? doc.publishedAt ?? doc.createdAt,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapPayloadCaseStudy(doc: Record<string, any>): CaseStudy | null {
  const slug = typeof doc.slug === "string" ? doc.slug.trim() : "";
  if (!slug) return null;

  const related = doc.relatedProducts;
  const relatedProductIds = Array.isArray(related)
    ? related.map((item) =>
        typeof item === "object" && item !== null ? String(item.id) : String(item),
      )
    : undefined;

  return {
    id: String(doc.id),
    slug,
    clientName: toLocalized(doc.clientName),
    projectDescription: toLocalized(doc.projectDescription),
    images: (doc.images ?? [])
      .map((row: { image?: MediaDoc | string | number }) =>
        resolveMediaUrl(row?.image),
      )
      .filter(Boolean),
    industry: doc.industry?.cn || doc.industry?.en
      ? toLocalized(doc.industry)
      : undefined,
    location: doc.location?.cn || doc.location?.en
      ? toLocalized(doc.location)
      : undefined,
    relatedProductIds,
    publishedAt: doc.publishedAt ?? doc.createdAt,
  };
}
