import { OptimizedImage } from "@/components/ui/optimized-image";
import type { Locale } from "@/i18n/routing";
import { localize } from "@/lib/data";
import type { CaseStudy } from "@/lib/types";
import { cn } from "@/lib/utils";

export type CaseStudyCardProps = {
  caseStudy: CaseStudy;
  locale: Locale;
  className?: string;
};

export function CaseStudyCard({
  caseStudy,
  locale,
  className,
}: CaseStudyCardProps) {
  const cover = caseStudy.images[0];

  return (
    <article
      className={cn(
        "overflow-hidden rounded-xl border bg-card shadow-sm",
        className,
      )}
    >
      {cover ? (
        <div className="relative aspect-[16/10] bg-muted">
          <OptimizedImage
            src={cover}
            alt={localize(caseStudy.clientName, locale)}
            fill
            loading="lazy"
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      ) : null}
      <div className="p-5">
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {caseStudy.industry ? (
            <span className="rounded-md bg-accent/15 px-2 py-0.5 text-accent-foreground">
              {localize(caseStudy.industry, locale)}
            </span>
          ) : null}
          {caseStudy.location ? (
            <span>{localize(caseStudy.location, locale)}</span>
          ) : null}
        </div>
        <h3 className="mt-2 text-lg font-semibold text-primary">
          {localize(caseStudy.clientName, locale)}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {localize(caseStudy.projectDescription, locale)}
        </p>
      </div>
    </article>
  );
}

