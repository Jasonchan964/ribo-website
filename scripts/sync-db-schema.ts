/**
 * Vercel 构建阶段将 Payload schema 同步到 Neon。
 * 必须以 NODE_ENV=development 运行（Payload 仅在非 production 时 Drizzle push）。
 *
 * 非交互式：通过 prompts.override 自动确认 data-loss 警告（Payload 无 acceptDataLoss API）。
 */
import { createRequire } from "node:module";

const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";
const isPostgresUrl =
  databaseUrl.startsWith("postgres://") ||
  databaseUrl.startsWith("postgresql://");

if (process.env.VERCEL !== "1" || !isPostgresUrl) {
  console.log("[db] skip schema sync (local build or non-Postgres DATABASE_URL)");
  process.exit(0);
}

// Payload connect() 仅在 NODE_ENV !== 'production' 时 push；构建环境常为 production，需覆盖。
// @types/node 将 NODE_ENV 标为 readonly，用 Record 写入以避免 next build 类型检查失败。
const env = process.env as Record<string, string | undefined>;
env.NODE_ENV = "development";
env.PAYLOAD_FORCE_DRIZZLE_PUSH = "true";
env.DISABLE_PAYLOAD_HMR = "true";
if (!env.CI) env.CI = "1";

// 须在加载 Payload 之前执行：自动确认 Drizzle push 的 data-loss / warnings，避免无 TTY 死锁。
const require = createRequire(import.meta.url);
const prompts = require("prompts") as {
  override: (answers: Record<string, unknown>) => void;
};
prompts.override({ confirm: true });

type PayloadDbWithPool = {
  pool?: { end(): Promise<void> };
};

async function closeDatabaseConnections(
  db: PayloadDbWithPool | undefined,
): Promise<void> {
  if (db?.pool && typeof db.pool.end === "function") {
    await db.pool.end();
  }
}

async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string,
): Promise<T | void> {
  let timeout: NodeJS.Timeout | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<void>((resolve) => {
        timeout = setTimeout(() => {
          console.warn(`[db] ${label} timed out; forcing build to continue`);
          resolve();
        }, ms);
      }),
    ]);
  } catch (error) {
    console.warn(`[db] ${label} failed during cleanup; forcing build to continue`, error);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

async function syncSchema(): Promise<void> {
  const { getPayload } = await import("payload");
  const { default: config } = await import("../src/payload.config");

  let payload: Awaited<ReturnType<typeof getPayload>> | undefined;

  try {
    payload = await getPayload({ config });
    payload.logger.info("[db] Vercel build: schema sync finished");
  } finally {
    if (payload) {
      await withTimeout(payload.destroy(), 5_000, "Payload destroy");
      await withTimeout(
        closeDatabaseConnections(payload.db as PayloadDbWithPool),
        5_000,
        "Payload db pool close",
      );
    }

    const { closeSharedPostgresPool } = await import(
      "../src/lib/database/postgres-pool"
    );
    await withTimeout(
      closeSharedPostgresPool(),
      5_000,
      "shared Postgres pool close",
    );
  }
}

syncSchema()
  .then(() => {
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error("[db] Vercel build: schema sync failed", error);
    process.exit(1);
  });
