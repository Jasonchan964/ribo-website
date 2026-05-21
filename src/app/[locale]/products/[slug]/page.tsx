import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProductDetail } from "@/components/products/product-detail";
import { ProductNotFound } from "@/components/products/product-not-found";
import {
  BreadcrumbJsonLd,
  ProductJsonLd,
} from "@/components/seo/json-ld";
import { routing, type Locale } from "@/i18n/routing";
import {
  getCaseStudiesForProduct,
  getProductBySlug,
  getProductSlugs,
  localize,
  normalizeProductSlug,
} from "@/lib/data";
import { createProductMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

/** 允许 CMS 中新建、未在构建时预渲染的 slug 按需生成页面 */
export const dynamicParams = true;

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

function resolveLocale(value: string): Locale | null {
  return routing.locales.includes(value as Locale)
    ? (value as Locale)
    : null;
}

export async function generateStaticParams() {
  const slugs = await getProductSlugs();
  return slugs.flatMap((slug) =>
    siteConfig.locales.map((locale) => ({ locale, slug })),
  );
}

export async function generateMetadata({ params }: PageProps) {
  try {
    const { locale: localeParam, slug: slugParam } = await params;
    const locale = resolveLocale(localeParam);
    if (!locale) return {};

    const slug = normalizeProductSlug(slugParam);
    const product = await getProductBySlug(slug);
    if (!product) return {};

    return createProductMetadata(product, locale);
  } catch {
    return {};
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { locale: localeParam, slug: slugParam } = await params;
  const locale = resolveLocale(localeParam);

  if (!locale) {
    return <ProductNotFound locale={routing.defaultLocale} />;
  }

  setRequestLocale(locale);

  const slug = normalizeProductSlug(slugParam);
  if (!slug) {
    return <ProductNotFound locale={locale} />;
  }

  let product;
  try {
    // slug 用于 Payload where 查询；locale 仅用于前台文案（name.cn / name.en），不参与 CMS 查询
    product = await getProductBySlug(slug);
  } catch (error) {
    console.error("[products/detail] failed to load product:", {
      locale,
      slug,
      error,
    });
    return <ProductNotFound locale={locale} slug={slug} />;
  }

  if (!product) {
    return <ProductNotFound locale={locale} slug={slug} />;
  }

  const [relatedCaseStudies, tNav, tProducts] = await Promise.all([
    getCaseStudiesForProduct(product.id).catch(() => []),
    getTranslations("nav"),
    getTranslations("products"),
  ]);

  const breadcrumbItems = [
    { name: tNav("home"), path: "" },
    { name: tProducts("title"), path: "/products" },
    { name: localize(product.name, locale), path: `/products/${product.slug}` },
  ];

  return (
    <>
      <ProductJsonLd
        product={product}
        locale={locale}
        caseStudies={relatedCaseStudies}
      />
      <BreadcrumbJsonLd locale={locale} items={breadcrumbItems} />
      <article className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <ProductDetail
          product={product}
          locale={locale}
          relatedCaseStudies={relatedCaseStudies}
        />
      </article>
    </>
  );
}
