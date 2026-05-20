"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ChevronDown, Languages } from "lucide-react";

const localeLabels: Record<Locale, "localeCn" | "localeEn"> = {
  cn: "localeCn",
  en: "localeEn",
};

type LocaleSwitcherProps = {
  variant?: "light" | "dark";
};

export function LocaleSwitcher({ variant = "light" }: LocaleSwitcherProps) {
  const t = useTranslations("common");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(nextLocale: Locale) {
    router.replace(pathname, { locale: nextLocale });
  }

  const isDark = variant === "dark";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "gap-1.5 rounded-sm font-medium",
              isDark &&
                "border-white/25 bg-white/5 text-white hover:bg-white/10 hover:text-white",
            )}
          >
            <Languages className="size-4 shrink-0" aria-hidden />
            <span className="sr-only">{t("localeLabel")}</span>
            <span>{locale === "cn" ? "CN" : "EN"}</span>
            <ChevronDown className="size-3.5 opacity-70" aria-hidden />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="min-w-[8rem]">
        {routing.locales.map((nextLocale) => (
          <DropdownMenuItem
            key={nextLocale}
            onClick={() => switchLocale(nextLocale)}
            className={cn(
              "justify-between",
              nextLocale === locale && "font-semibold text-primary",
            )}
          >
            <span>{t(localeLabels[nextLocale])}</span>
            <span className="text-xs uppercase text-muted-foreground">
              {nextLocale === "cn" ? "CN" : "EN"}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
