/**
 * Vercel 构建阶段将 Payload schema 同步到 Neon。
 * Payload 在 NODE_ENV=production 运行时不会 push，因此在 CI 中以 development 连接一次。
 */
const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";
const isPostgresUrl =
  databaseUrl.startsWith("postgres://") ||
  databaseUrl.startsWith("postgresql://");

if (process.env.VERCEL !== "1" || !isPostgresUrl) {
  console.log("[db] skip schema sync (local build or non-Postgres DATABASE_URL)");
  process.exit(0);
}

process.env.NODE_ENV = "development";
process.env.PAYLOAD_FORCE_DRIZZLE_PUSH = "true";
process.env.CI = "1";

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
