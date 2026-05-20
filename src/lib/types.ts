import type { Locale } from "@/i18n/routing";

/** CMS 多语言字段：与路由 locale（cn | en）一一对应 */
export type LocalizedString = Record<Locale, string>;

export type TechSpec = {
  label: LocalizedString;
  value: LocalizedString;
  unit?: LocalizedString;
};

/** 客户评价（用于 SEO JSON-LD Review / AggregateRating） */
export type ProductReview = {
  author: LocalizedString;
  reviewBody: LocalizedString;
  ratingValue: number;
  datePublished: string;
};

export type Product = {
  id: string;
  slug: string;
  name: LocalizedString;
  shortDescription: LocalizedString;
  description: LocalizedString;
  specifications: TechSpec[];
  mainImage: string;
  gallery?: string[];
  videoUrl?: string;
  featured?: boolean;
  /** 覆盖自动生成的 SEO keywords，逗号分隔 */
  metaKeywords?: LocalizedString;
  reviews?: ProductReview[];
  publishedAt: string;
  updatedAt: string;
};

export type CaseStudy = {
  id: string;
  slug: string;
  clientName: LocalizedString;
  projectDescription: LocalizedString;
  images: string[];
  industry?: LocalizedString;
  location?: LocalizedString;
  relatedProductIds?: string[];
  publishedAt: string;
};
