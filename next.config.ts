import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

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
    ],
  },
  // Vercel 默认会识别 Next.js；显式声明便于本地与 CI 行为一致
  ...(process.env.VERCEL === "1" ? { poweredByHeader: false } : {}),
};

export default withNextIntl(nextConfig);
