/**
 * Vercel 构建阶段将 Payload schema 同步到 Neon。
 * 需由 npm build 以 NODE_ENV=development 调用本脚本（见 package.json），Payload 才会执行 Drizzle push。
 */
const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";
const isPostgresUrl =
  databaseUrl.startsWith("postgres://") ||
  databaseUrl.startsWith("postgresql://");

if (process.env.VERCEL !== "1" || !isPostgresUrl) {
  console.log("[db] skip schema sync (local build or non-Postgres DATABASE_URL)");
  process.exit(0);
}

import { getPayload } from "payload";
import config from "../src/payload.config";

try {
  const payload = await getPayload({ config });
  payload.logger.info("[db] Vercel build: schema sync finished");
  await payload.destroy();
  process.exit(0);
} catch (error) {
  console.error("[db] Vercel build: schema sync failed", error);
  process.exit(1);
}
