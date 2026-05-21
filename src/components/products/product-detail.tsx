import { OptimizedImage } from "@/components/ui/optimized-image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { formatSpecValue, localize } from "@/lib/data";
import type { CaseStudy, Product } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=80";

function isEmbeddableVideo(url: string): boolean {
  return /youtube\.com|youtu\.be|\/embed\//i.test(url);
}

function productImageSrc(url: string | undefined): string {
  const trimmed = url?.trim();
  return trimmed || PLACEHOLDER_IMAGE;
}

export type ProductDetailProps = {
  product: Product;
  locale: Locale;
  relatedCaseStudies?: CaseStudy[];
};

export function ProductDetail({
  product,
  locale,
  relatedCaseStudies = [],
}: ProductDetailProps) {
  const t = useTranslations("products");
  const mainImage = productImageSrc(product.mainImage);
  const gallery = product.gallery?.filter((src) => src?.trim()).length
    ? product.gallery!.filter((src) => src?.trim())
    : [mainImage];

  return (
    <div className="space-y-12">
      <section className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-4">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl border bg-muted">
            <OptimizedImage
              src={mainImage}
              alt={localize(product.name, locale)}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          {gallery.length > 1 ? (
            <div className="grid grid-cols-3 gap-3">
              {gallery.slice(0, 3).map((src, index) => (
                <div
                  key={`${src}-${index}`}
                  className="relative aspect-video overflow-hidden rounded-lg border bg-muted"
                >
                  <OptimizedImage
                    src={src}
                    alt=""
                    fill
                    loading="lazy"
                    className="object-cover"
                    sizes="200px"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <header>
          <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            {localize(product.name, locale)}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            {localize(product.description, locale)}
          </p>
          <Link
            href="/#contact"
            className={cn(
              buttonVariants({ size: "lg" }),
              "mt-8 bg-accent text-accent-foreground hover:bg-accent/90",
            )}
          >
            {t("requestQuote")}
          </Link>
        </header>
      </section>

      {product.videoUrl ? (
        <section aria-labelledby="product-video-heading">
          <h2
            id="product-video-heading"
            className="text-2xl font-bold text-primary"
          >
            {t("video")}
          </h2>
          <div className="relative mt-6 aspect-video overflow-hidden rounded-xl border bg-muted">
            {isEmbeddableVideo(product.videoUrl) ? (
              <iframe
                src={product.videoUrl}
                title={localize(product.name, locale)}
                className="absolute inset-0 size-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={product.videoUrl}
                controls
                playsInline
                className="absolute inset-0 size-full object-cover"
                title={localize(product.name, locale)}
              />
            )}
          </div>
        </section>
      ) : null}

      <section aria-labelledby="product-specs-heading">
        <h2
          id="product-specs-heading"
          className="text-2xl font-bold text-primary"
        >
          {t("specifications")}
        </h2>
        <div className="mt-6 overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <tbody>
              {(product.specifications ?? []).map((spec, index) => (
                <tr
                  key={`${localize(spec.label, locale)}-${index}`}
                  className="border-b last:border-b-0 odd:bg-muted/30"
                >
                  <th
                    scope="row"
                    className="w-2/5 px-4 py-3 text-left font-medium text-primary"
                  >
                    {localize(spec.label, locale)}
                  </th>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatSpecValue(spec, locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {relatedCaseStudies.length > 0 ? (
        <section aria-labelledby="related-cases-heading">
          <h2
            id="related-cases-heading"
            className="text-2xl font-bold text-primary"
          >
            {t("relatedCases")}
          </h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2">
            {relatedCaseStudies.map((caseStudy) => (
              <li
                key={caseStudy.id}
                className="overflow-hidden rounded-xl border bg-card"
              >
                <div className="relative aspect-[16/9] bg-muted">
                  <OptimizedImage
                    src={caseStudy.images[0]}
                    alt={localize(caseStudy.clientName, locale)}
                    fill
                    loading="lazy"
                    className="object-cover"
                    sizes="400px"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-primary">
                    {localize(caseStudy.clientName, locale)}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                    {localize(caseStudy.projectDescription, locale)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

