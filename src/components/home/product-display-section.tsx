import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/products/product-card";
import type { Locale } from "@/i18n/routing";
import { getProducts } from "@/lib/data";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProductDisplaySectionProps = {
  locale: Locale;
};

export async function ProductDisplaySection({
  locale,
}: ProductDisplaySectionProps) {
  const t = await getTranslations("home.products");
  const products = await getProducts();

  return (
    <section
      id="products"
      className="scroll-mt-20 border-t border-border/60 bg-background py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-accent">
              {t("eyebrow")}
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-4 text-muted-foreground">{t("description")}</p>
          </div>
          <Link
            href="/products"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "shrink-0 rounded-sm border-primary/20 uppercase tracking-wider",
            )}
          >
            {t("viewAll")}
          </Link>
        </div>

        <ul className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <li key={product.id} className="min-w-0">
              <ProductCard
                product={product}
                locale={locale}
                variant="display"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
