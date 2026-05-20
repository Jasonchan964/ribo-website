import { getTranslations, setRequestLocale } from "next-intl/server";
import { BrandLogo } from "@/components/brand/brand-logo";
import { HeroSection } from "@/components/home/hero-section";
import { ProductDisplaySection } from "@/components/home/product-display-section";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { createPageMetadata } from "@/lib/seo/metadata";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Factory, Gauge, Leaf, Globe2 } from "lucide-react";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  return createPageMetadata({ locale, page: "home" });
}

const featureIcons = {
  speed: Gauge,
  precision: Factory,
  energy: Leaf,
  service: Globe2,
} as const;

const featureKeys = ["speed", "precision", "energy", "service"] as const;

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const tCommon = await getTranslations("common");

  return (
    <>
      <HeroSection />
      <ProductDisplaySection locale={locale} />

      <section
        id="technology"
        className="bg-muted/30 py-20 sm:py-28"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-accent">
            {t("features.eyebrow")}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            {t("features.title")}
          </h2>
          <ul className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featureKeys.map((key) => {
              const Icon = featureIcons[key];
              return (
                <li
                  key={key}
                  className="group border border-border/80 bg-background p-8 transition-all duration-500 hover:border-accent/40 hover:shadow-lg"
                >
                  <div className="mb-6 inline-flex rounded-sm bg-accent/10 p-3 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                    <Icon className="size-6" aria-hidden />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight text-primary">
                    {t(`features.items.${key}.title`)}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {t(`features.items.${key}.description`)}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section
        id="about"
        className="border-y border-border/60 py-20 sm:py-24"
      >
        <div className="mx-auto flex max-w-3xl flex-col items-center px-4 text-center sm:px-6">
          <BrandLogo size="lg" className="object-center" />
          <p className="mt-6 text-muted-foreground">{tCommon("tagline")}</p>
        </div>
      </section>

      <section
        id="contact"
        className="bg-primary py-20 text-primary-foreground sm:py-28"
      >
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {tCommon("ctaContact")}
          </h2>
          <p className="mt-4 text-primary-foreground/75">{t("hero.subtitle")}</p>
          <Link
            href="/#contact"
            className={cn(
              buttonVariants({ size: "lg" }),
              "mt-10 rounded-sm bg-accent px-12 text-accent-foreground hover:bg-accent/90",
            )}
          >
            {tCommon("getQuote")}
          </Link>
        </div>
      </section>
    </>
  );
}
