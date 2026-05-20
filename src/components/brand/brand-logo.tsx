import { OptimizedImage } from "@/components/ui/optimized-image";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/** Intrinsic ratio 659×86 (transparent PNG) */
const sizes = {
  sm: { width: 120, height: 16 },
  md: { width: 168, height: 22 },
  lg: { width: 260, height: 34 },
} as const;

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
  size?: keyof typeof sizes;
};

export function BrandLogo({
  className,
  priority = false,
  size = "md",
}: BrandLogoProps) {
  const t = useTranslations("common");
  const { width, height } = sizes[size];

  return (
    <OptimizedImage
      src="/logo.png"
      alt={t("logoAlt")}
      width={width}
      height={height}
      priority={priority}
      className={cn("h-auto w-auto max-w-full object-contain object-left", className)}
    />
  );
}
