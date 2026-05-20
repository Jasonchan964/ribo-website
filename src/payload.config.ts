import path from "node:path";
import { fileURLToPath } from "node:url";
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
import { isCloudinaryConfigured } from "./lib/cloudinary/config";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";
const isPostgresUrl =
  databaseUrl.startsWith("postgres://") ||
  databaseUrl.startsWith("postgresql://");

/**
 * Vercel 等无服务器环境无法持久化 SQLite 文件，必须用托管 Postgres（如 Neon）。
 * push：首迁/开发时根据 schema 同步表结构；生产稳定后可关 PAYLOAD_DISABLE_PUSH 并改用 migrate。
 */
function database() {
  if (isPostgresUrl) {
    return postgresAdapter({
      pool: {
        connectionString: databaseUrl,
      },
      push: process.env.PAYLOAD_DISABLE_PUSH !== "true",
    });
  }

  if (process.env.VERCEL === "1") {
    throw new Error(
      '[payload] On Vercel you must set DATABASE_URL to a PostgreSQL connection string (e.g. from neon.tech). SQLite file databases are not supported on serverless; see README "Deploy on Vercel".',
    );
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
      enabled: isCloudinaryConfigured(),
      collections: {
        media: {
          adapter: cloudinaryAdapter,
          disableLocalStorage: true,
          disablePayloadAccessControl: true,
        },
      },
    }),
  ],
});
