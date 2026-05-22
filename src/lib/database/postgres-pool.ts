import { Pool as NeonPool, neonConfig } from "@neondatabase/serverless";
import pg from "pg";
import type { Pool, PoolConfig } from "pg";
import ws from "ws";

type PgModule = typeof pg;

type PoolStore = {
  pool: Pool | null;
  connectionString: string | null;
};

const GLOBAL_POOL_STORE_KEY = "__riboPostgresPoolStore";
const GLOBAL_POOL_WARNED_KEY = "__riboPostgresPoolWarned";

function getPoolStore(): PoolStore {
  const g = globalThis as typeof globalThis & {
    [GLOBAL_POOL_STORE_KEY]?: PoolStore;
  };
  if (!g[GLOBAL_POOL_STORE_KEY]) {
    g[GLOBAL_POOL_STORE_KEY] = { pool: null, connectionString: null };
  }
  return g[GLOBAL_POOL_STORE_KEY];
}

export function isServerlessRuntime(): boolean {
  return (
    process.env.VERCEL === "1" ||
    process.env.AWS_LAMBDA_FUNCTION_NAME != null
  );
}

function configureNeonDriver(): void {
  if (isServerlessRuntime()) {
    neonConfig.webSocketConstructor = ws;
  }
}

export function isPostgresConnectionString(url: string): boolean {
  const trimmed = url.trim();
  return (
    trimmed.startsWith("postgres://") ||
    trimmed.startsWith("postgresql://")
  );
}

function warnIfNotNeonPooler(connectionString: string): void {
  if (!isServerlessRuntime()) return;

  const g = globalThis as typeof globalThis & {
    [GLOBAL_POOL_WARNED_KEY]?: boolean;
  };
  if (g[GLOBAL_POOL_WARNED_KEY]) return;
  g[GLOBAL_POOL_WARNED_KEY] = true;

  try {
    const host = new URL(
      connectionString.replace(/^postgresql?:\/\//, "https://"),
    ).hostname.toLowerCase();

    if (host.includes("neon.tech") && !host.includes("-pooler")) {
      console.warn(
        "[db] Vercel/Serverless: DATABASE_URL 建议使用 Neon「Pooled connection」（主机名含 -pooler），否则易出现连接超时。",
      );
    }
  } catch {
    /* ignore invalid URL during local bootstrap */
  }
}

/**
 * Neon + Vercel Serverless 推荐 pg Pool 参数。
 * TLS 由 DATABASE_URL 的 sslmode 控制，勿在此设置 pool.ssl。
 */
export function buildPostgresPoolConfig(connectionString: string): PoolConfig {
  const serverless = isServerlessRuntime();

  warnIfNotNeonPooler(connectionString);

  return {
    connectionString,
    max: serverless ? 1 : 10,
    min: 0,
    idleTimeoutMillis: serverless ? 10_000 : 30_000,
    connectionTimeoutMillis: 10_000,
    allowExitOnIdle: serverless,
  };
}

function createPool(connectionString: string): Pool {
  const poolConfig = buildPostgresPoolConfig(connectionString);

  if (isServerlessRuntime()) {
    configureNeonDriver();
    return new NeonPool(poolConfig) as unknown as Pool;
  }

  return new pg.Pool(poolConfig);
}

/**
 * 进程内单例 Pool，避免 Serverless 重复 new Pool 耗尽 Neon 连接。
 */
export function getSharedPostgresPool(connectionString: string): Pool {
  const store = getPoolStore();
  const normalized = connectionString.trim();

  if (store.pool && store.connectionString === normalized) {
    return store.pool;
  }

  if (store.pool) {
    void store.pool.end().catch(() => {});
  }

  store.pool = createPool(normalized);
  store.connectionString = normalized;
  return store.pool;
}

/**
 * 供 Payload postgresAdapter 使用：`new pg.Pool()` 返回 globalThis 单例。
 */
export function getPayloadPgModule(): PgModule {
  function SharedPool(
    this: unknown,
    options: PoolConfig = {},
  ): Pool {
    const connectionString =
      (typeof options.connectionString === "string" &&
        options.connectionString) ||
      process.env.DATABASE_URL?.trim() ||
      "";

    if (!connectionString) {
      throw new Error("[db] Missing DATABASE_URL for Postgres pool.");
    }

    return getSharedPostgresPool(connectionString);
  }

  return { ...pg, Pool: SharedPool as unknown as typeof pg.Pool };
}
