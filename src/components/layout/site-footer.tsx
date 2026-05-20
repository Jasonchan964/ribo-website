import { useTranslations } from "next-intl";
import { Separator } from "@/components/ui/separator";

export function SiteFooter() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Separator className="mb-6 bg-primary-foreground/20" />
        <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>{t("copyright", { year })}</p>
          <p className="text-primary-foreground/80">{t("address")}</p>
        </div>
      </div>
    </footer>
  );
}
