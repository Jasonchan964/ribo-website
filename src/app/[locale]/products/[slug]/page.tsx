import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProductDetail } from "@/components/products/product-detail";
import {
  BreadcrumbJsonLd,
  ProductJsonLd,
} from "@/components/seo/json-ld";
import type { Locale } from "@/i18n/routing";
import {
  getCaseStudiesForProduct,
  getProductBySlug,
  getProductSlugs,
  localize,
} from "@/lib/data";
import { createProductMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/config/site";

type PageProps = {
  params: Promise<{ locale: Locale; slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getProductSlugs();
  return slugs.flatMap((slug) =>
    siteConfig.locales.map((locale) => ({ locale, slug })),
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return createProductMetadata(product, locale);
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [relatedCaseStudies, tNav, tProducts] = await Promise.all([
    getCaseStudiesForProduct(product.id),
    getTranslations("nav"),
    getTranslations("products"),
  ]);

  const breadcrumbItems = [
    { name: tNav("home"), path: "" },
    { name: tProducts("title"), path: "/products" },
    { name: localize(product.name, locale), path: `/products/${slug}` },
  ];

  return (
    <article className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <ProductJsonLd
        product={product}
        locale={locale}
        caseStudies={relatedCaseStudies}
      />
      <BreadcrumbJsonLd locale={locale} items={breadcrumbItems} />
      <ProductDetail
        product={product}
        locale={locale}
        relatedCaseStudies={relatedCaseStudies}
      />
    </article>
  );
}
