import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ProductNotFoundProps = {
  locale: Locale;
  slug?: string;
};

const copy = {
  cn: {
    title: "未找到该产品",
    description: "该产品可能已下架，或链接地址有误。请返回产品列表查看其它机型。",
    back: "返回产品列表",
  },
  en: {
    title: "Product not found",
    description:
      "This product may have been removed or the link is incorrect. Please return to the product list.",
    back: "Back to products",
  },
} as const;

export function ProductNotFound({ locale, slug }: ProductNotFoundProps) {
  const t = copy[locale] ?? copy.cn;

  return (
    <article className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-lg rounded-xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
        <h1 className="text-2xl font-bold text-primary">{t.title}</h1>
        <p className="mt-3 text-muted-foreground">{t.description}</p>
        {slug ? (
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            slug: {slug}
          </p>
        ) : null}
        <Link
          href="/products"
          className={cn(buttonVariants({ variant: "outline" }), "mt-8")}
        >
          {t.back}
        </Link>
      </div>
    </article>
  );
}
