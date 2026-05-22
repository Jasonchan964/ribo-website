import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

function siteHostnameFromEnv(): string | null {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return null;
  try {
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    return new URL(withProtocol).hostname;
  } catch {
    return null;
  }
}

const siteHost = siteHostnameFromEnv();

/** 局域网 IP 访问 dev 时加载 JS（Next 16 默认会拦截跨源 /_next 请求） */
function allowedDevOriginsFromEnv(): string[] {
  const raw = process.env.ALLOWED_DEV_ORIGINS?.trim();
  if (raw) {
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return ["192.168.*", "10.*", "172.16.*", "172.17.*", "172.18.*"];
}

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "pg",
    "@payloadcms/db-postgres",
    "drizzle-orm",
  ],
  allowedDevOrigins: allowedDevOriginsFromEnv(),
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
