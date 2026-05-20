"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/config/site";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export function HeroSection() {
  const t = useTranslations("home.hero");
  const tQuote = useTranslations("common");

  return (
    <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden">
      <video
        className="absolute inset-0 size-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster={siteConfig.hero.posterSrc}
        aria-hidden
      >
        <source src={siteConfig.hero.videoSrc} type="video/mp4" />
      </video>

      <div
        className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/70 to-primary/95"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(105deg,transparent_40%,#8CC63F12_70%,transparent_90%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-20 pt-32 sm:px-6 sm:pb-28 sm:pt-40 lg:px-8">
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-accent sm:text-sm">
          {t("eyebrow")}
        </p>
        <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
          {t("title")}
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
          {t("subtitle")}
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Link
            href="/#contact"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-14 min-w-[200px] rounded-sm bg-accent px-10 text-base font-semibold tracking-wide text-accent-foreground shadow-lg shadow-accent/25 transition-all hover:bg-accent/90 hover:shadow-xl hover:shadow-accent/30",
            )}
          >
            {tQuote("getQuote")}
          </Link>
          <Link
            href="/#products"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-14 rounded-sm border-white/25 bg-white/5 px-8 text-base text-white backdrop-blur-sm hover:bg-white/10",
            )}
          >
            {t("secondaryCta")}
          </Link>
        </div>
      </div>

      <a
        href="#products"
        className="relative z-10 mx-auto mb-8 flex flex-col items-center gap-2 text-white/50 transition-colors hover:text-accent"
        aria-label={t("scrollHint")}
      >
        <ChevronDown className="size-6 animate-bounce" aria-hidden />
      </a>
    </section>
  );
}
