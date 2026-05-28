import pg from "pg";
import type { Pool, PoolConfig } from "pg";

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
        "[db] Vercel/Serverless: DATABASE_URL 建议使用 Neon「Pooled connection」（主机名含 -pooler）。",
      );
    }
  } catch {
    /* ignore */
  }
}

function toServerlessConnectionString(connectionString: string): string {
  if (!isServerlessRuntime()) return connectionString;

  try {
    const url = new URL(connectionString);
    const hostname = url.hostname.toLowerCase();

    if (hostname.includes("neon.tech") && !hostname.includes("-pooler")) {
      const [endpoint, ...rest] = url.hostname.split(".");
      url.hostname = [`${endpoint}-pooler`, ...rest].join(".");
      return url.toString();
    }
  } catch {
    /* Keep the original string; pg will surface the real connection error. */
  }

  return connectionString;
}

/**
 * Payload connect() 会通过 pool.connect() 长期占用 1 条连接（错误监听），
 * 因此 Serverless 下 max 不能为 1，否则 Admin/查询会全部超时。
 * TLS 由 DATABASE_URL 的 sslmode 控制，勿设置 pool.ssl。
 */
export function buildPostgresPoolConfig(connectionString: string): PoolConfig {
  const serverless = isServerlessRuntime();
  const normalizedConnectionString = toServerlessConnectionString(connectionString);

  warnIfNotNeonPooler(normalizedConnectionString);

  return {
    connectionString: normalizedConnectionString,
    // Payload 常驻 1 条 connect + 业务查询至少需要再 1 条
    max: serverless ? 2 : 10,
    min: 0,
    idleTimeoutMillis: serverless ? 10_000 : 30_000,
    connectionTimeoutMillis: serverless ? 20_000 : 10_000,
    allowExitOnIdle: serverless,
  };
}

function createPool(connectionString: string): Pool {
  return new pg.Pool(buildPostgresPoolConfig(connectionString));
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

export async function closeSharedPostgresPool(): Promise<void> {
  const store = getPoolStore();
  const pool = store.pool;

  store.pool = null;
  store.connectionString = null;

  if (pool) {
    await pool.end();
  }
}

/**
 * 供 Payload postgresAdapter：`new pg.Pool()` 返回 globalThis 单例。
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
