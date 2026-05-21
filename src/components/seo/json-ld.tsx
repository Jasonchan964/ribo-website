import { siteConfig } from "@/config/site";
import type { Locale } from "@/i18n/routing";
import { formatSpecValue, localize } from "@/lib/data";
import type { CaseStudy, Product } from "@/lib/types";

type JsonLdScriptProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

function JsonLdScript({ data }: JsonLdScriptProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd({ locale }: { locale: Locale }) {
  const isCn = locale === "cn";

  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: siteConfig.name,
        url: siteConfig.url,
        logo: `${siteConfig.url}/logo.png`,
        description: isCn
          ? "全自动高速直线 PET 吹瓶机研发与制造商"
          : "Manufacturer of fully automatic high-speed linear PET blow molding machines",
      }}
    />
  );
}

export function WebSiteJsonLd({ locale }: { locale: Locale }) {
  const isCn = locale === "cn";

  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: siteConfig.name,
        url: siteConfig.url,
        inLanguage: isCn ? "zh-CN" : "en",
        publisher: {
          "@type": "Organization",
          name: siteConfig.name,
        },
      }}
    />
  );
}

export function ProductItemListJsonLd({
  products,
  locale,
}: {
  products: Product[];
  locale: Locale;
}) {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name:
          locale === "cn"
            ? "RIBO PET 吹瓶机产品系列"
            : "RIBO PET Blow Molding Machine Series",
        itemListElement: products.map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: localize(product.name, locale),
          url: `${siteConfig.url}/${locale}/products/${product.slug}`,
        })),
      }}
    />
  );
}

export function BreadcrumbJsonLd({
  locale,
  items,
}: {
  locale: Locale;
  items: { name: string; path: string }[];
}) {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: `${siteConfig.url}/${locale}${item.path}`,
        })),
      }}
    />
  );
}

function buildAggregateRating(product: Product) {
  if (!product.reviews?.length) return undefined;

  const sum = product.reviews.reduce((acc, r) => acc + r.ratingValue, 0);
  const count = product.reviews.length;

  return {
    "@type": "AggregateRating",
    ratingValue: Math.round((sum / count) * 10) / 10,
    reviewCount: count,
    bestRating: 5,
    worstRating: 1,
  };
}

export function ProductJsonLd({
  product,
  locale,
  caseStudies = [],
}: {
  product: Product;
  locale: Locale;
  caseStudies?: CaseStudy[];
}) {
  const name = localize(product.name, locale);
  const description = localize(product.description, locale);
  const url = `${siteConfig.url}/${locale}/products/${product.slug}`;
  const aggregateRating = buildAggregateRating(product);

  const productReviews = (product.reviews ?? []).map((review) => ({
    "@type": "Review",
    author: {
      "@type": "Organization",
      name: localize(review.author, locale),
    },
    reviewBody: localize(review.reviewBody, locale),
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.ratingValue,
      bestRating: 5,
      worstRating: 1,
    },
    datePublished: review.datePublished,
  }));

  const caseStudyReviews = caseStudies.map((study) => ({
    "@type": "Review",
    author: {
      "@type": "Organization",
      name: localize(study.clientName, locale),
    },
    reviewBody: localize(study.projectDescription, locale),
    reviewRating: {
      "@type": "Rating",
      ratingValue: 5,
      bestRating: 5,
      worstRating: 1,
    },
    datePublished: study.publishedAt,
  }));

  const reviews = [...productReviews, ...caseStudyReviews];

  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name,
        description,
        image: [product.mainImage, ...(product.gallery ?? [])],
        url,
        sku: product.id,
        mpn: product.slug,
        brand: {
          "@type": "Brand",
          name: siteConfig.name,
        },
        manufacturer: {
          "@type": "Organization",
          name: siteConfig.name,
          url: siteConfig.url,
        },
        category: locale === "cn" ? "PET吹瓶机" : "PET Blow Molding Machine",
        mainEntityOfPage: url,
        ...(aggregateRating ? { aggregateRating } : {}),
        ...(reviews.length > 0 ? { review: reviews } : {}),
        additionalProperty: (product.specifications ?? []).map((spec) => ({
          "@type": "PropertyValue",
          name: localize(spec.label, locale),
          value: formatSpecValue(spec, locale),
        })),
        offers: {
          "@type": "Offer",
          url,
          availability: "https://schema.org/InStock",
          priceCurrency: "CNY",
          seller: {
            "@type": "Organization",
            name: siteConfig.name,
          },
        },
      }}
    />
  );
}
