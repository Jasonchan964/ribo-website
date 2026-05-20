import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProductCard } from "@/components/products/product-card";
import { CaseStudyCard } from "@/components/case-studies/case-study-card";
import { ProductItemListJsonLd } from "@/components/seo/json-ld";
import type { Locale } from "@/i18n/routing";
import { getCaseStudies, getProducts } from "@/lib/data";
import { createPageMetadata } from "@/lib/seo/metadata";

/** CMS 更新后在一分钟内反映到前台（开发模式每次请求都会刷新） */
export const revalidate = 60;

type PageProps = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  return createPageMetadata({ locale, page: "products", path: "/products" });
}

export default async function ProductsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("products");

  const [products, caseStudies] = await Promise.all([
    getProducts(),
    getCaseStudies(),
  ]);

  return (
    <>
      <ProductItemListJsonLd products={products} locale={locale} />
      <section
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
        aria-labelledby="products-page-title"
      >
        <header className="max-w-2xl">
          <h1
            id="products-page-title"
            className="text-3xl font-bold tracking-tight text-primary sm:text-4xl"
          >
            {t("title")}
          </h1>
          <p className="mt-4 text-muted-foreground">{t("description")}</p>
        </header>

        <ul className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <li key={product.id} className="min-w-0">
              <ProductCard product={product} locale={locale} />
            </li>
          ))}
        </ul>
      </section>

      <section
        className="border-t border-border/60 bg-muted/20 py-16 sm:py-20"
        aria-labelledby="case-studies-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <header className="max-w-2xl">
            <h2
              id="case-studies-heading"
              className="text-2xl font-bold text-primary"
            >
              {t("caseStudies")}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t("caseStudiesDescription")}
            </p>
          </header>
          <ul className="mt-10 grid gap-8 md:grid-cols-2">
            {caseStudies.map((caseStudy) => (
              <li key={caseStudy.id}>
                <CaseStudyCard caseStudy={caseStudy} locale={locale} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
