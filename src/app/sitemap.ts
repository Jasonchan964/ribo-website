import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getProductSlugs } from "@/lib/data";
import { routing } from "@/i18n/routing";

function localeToHreflang(locale: (typeof routing.locales)[number]): string {
  return locale === "cn" ? "zh-CN" : "en";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const productSlugs = await getProductSlugs();
  const staticRoutes = ["", "/products", "/contact"] as const;
  const productRoutes = productSlugs.map((slug) => `/products/${slug}` as const);
  const routes = [...staticRoutes, ...productRoutes];

  return routing.locales.flatMap((locale) =>
    routes.map((route) => {
      const path = `/${locale}${route}`;
      const languages = Object.fromEntries(
        routing.locales.map((l) => [
          localeToHreflang(l),
          `${siteConfig.url}/${l}${route}`,
        ]),
      );

      const isHome = route === "";
      const isProductDetail = route.startsWith("/products/") && route !== "/products";

      return {
        url: `${siteConfig.url}${path}`,
        lastModified: new Date(),
        changeFrequency: isHome ? "weekly" : isProductDetail ? "monthly" : "weekly",
        priority: isHome ? 1 : isProductDetail ? 0.7 : 0.8,
        alternates: { languages },
      };
    }),
  );
}
