import { OptimizedImage } from "@/components/ui/optimized-image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { localize } from "@/lib/data";
import type { Product } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

export type ProductCardProps = {
  product: Product;
  locale: Locale;
  className?: string;
  variant?: "default" | "display";
};

export function ProductCard({
  product,
  locale,
  className,
  variant = "default",
}: ProductCardProps) {
  const t = useTranslations("products");
  const isDisplay = variant === "display";

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden bg-card transition-all duration-500 ease-out",
        isDisplay
          ? "rounded-sm border border-border/80 shadow-sm hover:-translate-y-2 hover:border-accent/30 hover:shadow-2xl hover:shadow-primary/10"
          : "rounded-xl border shadow-sm hover:shadow-md",
        className,
      )}
    >
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-muted"
      >
        <OptimizedImage
          src={product.mainImage}
          alt={localize(product.name, locale)}
          fill
          loading="lazy"
          className={cn(
            "object-cover transition-transform duration-700 ease-out",
            isDisplay ? "group-hover:scale-110" : "group-hover:scale-[1.02]",
          )}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent opacity-60 transition-opacity duration-500",
            isDisplay && "group-hover:opacity-80",
          )}
          aria-hidden
        />
        {product.featured ? (
          <span className="absolute left-4 top-4 rounded-sm bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-accent-foreground">
            {t("featured")}
          </span>
        ) : null}
        {isDisplay ? (
          <span className="absolute bottom-4 right-4 flex size-10 items-center justify-center rounded-sm bg-white/10 text-white opacity-0 backdrop-blur-sm transition-all duration-500 group-hover:opacity-100">
            <ArrowUpRight className="size-5" aria-hidden />
          </span>
        ) : null}
      </Link>

      <div className={cn("flex flex-1 flex-col", isDisplay ? "p-6" : "p-5")}>
        <h3
          className={cn(
            "font-semibold text-primary",
            isDisplay ? "text-xl tracking-tight" : "text-lg",
          )}
        >
          <Link
            href={`/products/${product.slug}`}
            className="transition-colors hover:text-accent"
          >
            {localize(product.name, locale)}
          </Link>
        </h3>
        <p
          className={cn(
            "mt-3 flex-1 leading-relaxed text-muted-foreground",
            isDisplay ? "line-clamp-2 text-sm" : "line-clamp-3 text-sm",
          )}
        >
          {localize(product.shortDescription, locale)}
        </p>
        <Link
          href={`/products/${product.slug}`}
          className={cn(
            buttonVariants({ variant: isDisplay ? "ghost" : "outline", size: "sm" }),
            "mt-5 w-fit rounded-sm uppercase tracking-wider",
            isDisplay && "px-0 text-primary hover:bg-transparent hover:text-accent",
          )}
        >
          {t("viewDetail")}
          {isDisplay ? (
            <ArrowUpRight className="ml-1 size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          ) : null}
        </Link>
      </div>
    </article>
  );
}
