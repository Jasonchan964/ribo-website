export const siteConfig = {
  name: "日博RIBO",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ribo.com",
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
