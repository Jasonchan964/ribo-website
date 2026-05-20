import type { Locale } from "@/i18n/routing";
import { localize } from "@/lib/localize";
import type { Product } from "@/lib/types";

/** 行业通用 SEO 关键词（PET 吹瓶机） */
const industryKeywords: Record<Locale, string[]> = {
  cn: [
    "PET吹瓶机",
    "直线吹瓶机",
    "全自动吹瓶机",
    "高速吹瓶机",
    "PET瓶成型设备",
    "饮料瓶吹瓶机",
    "包装机械",
    "吹塑机",
  ],
  en: [
    "PET blow molding machine",
    "linear blow molder",
    "automatic PET blowing machine",
    "high-speed blow molding",
    "PET bottle forming equipment",
    "beverage bottle blower",
    "packaging machinery",
    "stretch blow molding",
  ],
};

export function getIndustryKeywords(locale: Locale): string[] {
  return industryKeywords[locale];
}

export function keywordsToMetaString(keywords: string[]): string {
  return [...new Set(keywords)].join(", ");
}

export function buildProductKeywords(
  product: Product,
  locale: Locale,
): string {
  const custom = product.metaKeywords
    ? localize(product.metaKeywords, locale)
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
    : [];

  const fromName = [localize(product.name, locale)];

  return keywordsToMetaString([
    ...getIndustryKeywords(locale),
    ...fromName,
    ...custom,
  ]);
}
