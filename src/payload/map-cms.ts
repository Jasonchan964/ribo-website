import { siteConfig } from "@/config/site";
import {
  cloudinaryImageUrl,
  cloudinaryVideoUrl,
} from "@/lib/cloudinary/url";
import { isCloudinaryConfigured } from "@/lib/cloudinary/config";
import type { CaseStudy, LocalizedString, Product } from "@/lib/types";

type LocalizedPayload = { cn?: string | null; en?: string | null } | null | undefined;

type MediaDoc = {
  url?: string | null;
  mimeType?: string | null;
  cloudinaryPublicId?: string | null;
  filename?: string | null;
};

function siteOrigin(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? siteConfig.url;
  try {
    return new URL(url).origin;
  } catch {
    return siteConfig.url.replace(/\/$/, "");
  }
}

function toLocalized(value: LocalizedPayload): LocalizedString {
  return {
    cn: value?.cn ?? "",
    en: value?.en ?? "",
  };
}

function resolveMediaUrl(media: MediaDoc | string | number | null | undefined): string {
  if (!media || typeof media === "string" || typeof media === "number") return "";

  const doc = media as MediaDoc;
  const rawUrl = typeof doc.url === "string" ? doc.url.trim() : "";

  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
    return rawUrl;
  }

  const publicId =
    (typeof doc.cloudinaryPublicId === "string" && doc.cloudinaryPublicId) ||
    (typeof doc.filename === "string" && doc.filename) ||
    "";

  if (publicId && isCloudinaryConfigured()) {
    const isVideo = String(doc.mimeType ?? "").startsWith("video/");
    return isVideo ? cloudinaryVideoUrl(publicId) : cloudinaryImageUrl(publicId);
  }

  if (rawUrl.startsWith("/")) {
    return `${siteOrigin()}${rawUrl}`;
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
    specifications: (doc.specifications ?? []).map(
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
    reviews: (doc.reviews ?? []).map(
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
