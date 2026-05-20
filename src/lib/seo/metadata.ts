import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/config/site";
import type { Locale } from "@/i18n/routing";
import { localize } from "@/lib/localize";
import type { Product } from "@/lib/types";
import {
  buildProductKeywords,
  getIndustryKeywords,
  keywordsToMetaString,
} from "@/lib/seo/keywords";

type PageMetaNamespace = "home" | "products";

function localeToHreflang(locale: Locale): string {
  return locale === "cn" ? "zh-CN" : "en";
}

function localeToOpenGraph(locale: Locale): string {
  return locale === "cn" ? "zh_CN" : "en_US";
}

function buildAlternates(locale: Locale, path: string) {
  const canonical = `${siteConfig.url}/${locale}${path}`;
  const languages = Object.fromEntries(
    siteConfig.locales.map((l) => [
      localeToHreflang(l),
      `${siteConfig.url}/${l}${path}`,
    ]),
  );
  return { canonical, languages };
}

function mergePageKeywords(locale: Locale, pageKeywords: string): string {
  const fromTranslations = pageKeywords
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  return keywordsToMetaString([
    ...getIndustryKeywords(locale),
    ...fromTranslations,
  ]);
}

const baseRobots: Metadata["robots"] = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
  },
};

export async function createPageMetadata({
  locale,
  page,
  path = "",
}: {
  locale: Locale;
  page: PageMetaNamespace;
  path?: string;
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: `${page}.meta` });
  const { canonical, languages } = buildAlternates(locale, path);
  const keywords = mergePageKeywords(locale, t("keywords"));

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: t("title"),
      template: `%s | ${siteConfig.name}`,
    },
    description: t("description"),
    keywords,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: canonical,
      siteName: siteConfig.name,
      locale: localeToOpenGraph(locale),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
    robots: baseRobots,
    category: "technology",
  };
}

export function createProductMetadata(
  product: Product,
  locale: Locale,
): Metadata {
  const title = localize(product.name, locale);
  const description = localize(product.shortDescription, locale);
  const keywords = buildProductKeywords(product, locale);
  const path = `/products/${product.slug}`;
  const { canonical, languages } = buildAlternates(locale, path);

  return {
    metadataBase: new URL(siteConfig.url),
    title,
    description,
    keywords,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: siteConfig.name,
      locale: localeToOpenGraph(locale),
      type: "website",
      images: [
        {
          url: product.mainImage,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [product.mainImage],
    },
    robots: baseRobots,
  };
}

export function createSiteMetadata(): Metadata {
  return {
    metadataBase: new URL(siteConfig.url),
    applicationName: siteConfig.name,
    title: {
      default: siteConfig.name,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: keywordsToMetaString(getIndustryKeywords(siteConfig.defaultLocale)),
    robots: baseRobots,
    formatDetection: {
      telephone: false,
    },
  };
}
