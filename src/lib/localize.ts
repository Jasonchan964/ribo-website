import type { Locale } from "@/i18n/routing";
import type { LocalizedString } from "@/lib/types";

export function localize(
  field: LocalizedString,
  locale: Locale,
  fallback: Locale = "cn",
): string {
  return field[locale] ?? field[fallback];
}
