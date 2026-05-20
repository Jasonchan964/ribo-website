import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

function siteHostnameFromEnv(): string | null {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return null;
  try {
    return new URL(raw).hostname;
  } catch {
    return null;
  }
}

const siteHost = siteHostnameFromEnv();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/api/media/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        pathname: "/api/media/**",
      },
      ...(siteHost && siteHost !== "localhost"
        ? [
            {
              protocol: "https" as const,
              hostname: siteHost,
              pathname: "/api/media/**",
            },
          ]
        : []),
    ],
  },
  // Vercel 默认会识别 Next.js；显式声明便于本地与 CI 行为一致
  ...(process.env.VERCEL === "1" ? { poweredByHeader: false } : {}),
};

export default withPayload(withNextIntl(nextConfig));
