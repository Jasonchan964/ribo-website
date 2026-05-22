import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { PoolConfig } from "pg";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { cloudStoragePlugin } from "@payloadcms/plugin-cloud-storage";
import { buildConfig } from "payload";
import sharp from "sharp";
import {
  CaseStudies,
  Media,
  Products,
  Users,
} from "./payload/collections";
import { cloudinaryAdapter } from "./payload/cloudinary-adapter";
import { cloudinaryClientUploadsPlugin } from "./payload/cloudinary-client-uploads-plugin";
import { isCloudinaryMediaStorageEnabled } from "./lib/cloudinary/config";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";
const isPostgresUrl =
  databaseUrl.startsWith("postgres://") ||
  databaseUrl.startsWith("postgresql://");

/**
 * Vercel 无法在仓库内持久化 SQLite；未配置 Postgres 时用临时目录中的文件，
 * 仅用于让 Payload 完成初始化（查询常因无表失败 → 前台由 cms-source 回退 Mock）。
 * 正式 CMS 数据请配置 Neon 等的 DATABASE_URL（postgres://…）。
 */
function vercelFallbackSqliteUrl(): string {
  const file = path.join(tmpdir(), "payload-cms-vercel.sqlite");
  const normalized = file.replace(/\\/g, "/");
  return normalized.startsWith("/") ? `file:${normalized}` : `file:/${normalized}`;
}

/**
 * Neon + Vercel Serverless：pg Pool 选项会传给每个底层 Client（连接超时、SSL、池大小）。
 * @see https://node-postgres.com/apis/pool
 */
function buildPostgresPoolConfig(): PoolConfig {
  return {
    connectionString: databaseUrl,
    max: 10,
    connectionTimeoutMillis: 10_000,
    ssl: { rejectUnauthorized: false },
  };
}

/**
 * push: true — 开启 Drizzle 开发态 schema 自动同步（Payload 在 NODE_ENV=production 运行时不会 push）。
 * 线上 Neon：由 Vercel 构建脚本 scripts/sync-db-schema.ts 在 deploy 前执行一次 push，无需本地 db:push / migrate。
 * PAYLOAD_DISABLE_PUSH=true 可关闭 push（高级）。
 */
function database() {
  if (isPostgresUrl) {
    return postgresAdapter({
      pool: buildPostgresPoolConfig(),
      push:
        process.env.PAYLOAD_DISABLE_PUSH === "true" ? false : true,
    });
  }

  if (process.env.VERCEL === "1") {
    return sqliteAdapter({
      client: {
        url: vercelFallbackSqliteUrl(),
      },
    });
  }

  return sqliteAdapter({
    client: {
      url:
        databaseUrl || `file:${path.resolve(dirname, "../ribo-cms.db")}`,
    },
  });
}

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: " · RIBO CMS",
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  editor: lexicalEditor(),
  collections: [Users, Media, Products, CaseStudies],
  secret: process.env.PAYLOAD_SECRET || "dev-only-change-me-in-production",
  typescript: {
    outputFile: path.resolve(dirname, "payload/payload-types.ts"),
  },
  db: database(),
  sharp,
  plugins: [
    cloudStoragePlugin({
      enabled: isCloudinaryMediaStorageEnabled(),
      collections: {
        media: {
          adapter: cloudinaryAdapter,
          disableLocalStorage: true,
          disablePayloadAccessControl: true,
        },
      },
    }),
    cloudinaryClientUploadsPlugin,
  ],
});
