const SITE_URL_FALLBACK = "https://www.ribo.com";

/**
 * 将环境变量中的站点地址规范为合法 URL 字符串（含协议），供 metadata、sitemap、JSON-LD 使用。
 * Vercel 上常有用户只填域名（如 ribomachine.com），直接传给 `new URL()` 会抛 ERR_INVALID_URL。
 */
export function normalizeSiteUrl(raw: string | undefined): string {
  const trimmed = (raw ?? SITE_URL_FALLBACK).trim();
  if (!trimmed) return SITE_URL_FALLBACK;

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const u = new URL(withProtocol);
    return u.origin;
  } catch {
    return SITE_URL_FALLBACK;
  }
}

export const siteConfig = {
  name: "日博RIBO",
  description:
    "全自动高速直线 PET 吹瓶机研发与制造 · Fully automatic high-speed linear PET blow molding machines",
  url: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  locales: ["cn", "en"] as const,
  defaultLocale: "cn" as const,
  hero: {
    /** 可替换为 /videos/hero.mp4 等自有素材 */
    videoSrc:
      "https://cdn.coverr.co/videos/coverr-an-industrial-plant-1576/1080p.mp4",
    posterSrc:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1920&q=80",
  },
} as const;
