import path from "node:path";
import { fileURLToPath } from "node:url";
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
  db: sqliteAdapter({
    client: {
      url:
        process.env.DATABASE_URL ||
        `file:${path.resolve(dirname, "../ribo-cms.db")}`,
    },
  }),
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
