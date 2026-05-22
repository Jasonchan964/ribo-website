import type { PoolConfig } from "pg";
import {
  parsePostgresUrl,
  validatePostgresUrlForRuntime,
  type ParsedPostgresUrl,
} from "./postgres-url";

let loggedPoolHints = false;

function logPoolHintsOnce(parsed: ParsedPostgresUrl | null): void {
  if (loggedPoolHints || !parsed) return;
  loggedPoolHints = true;

  const { errors, warnings } = validatePostgresUrlForRuntime(parsed);
  for (const msg of errors) {
    console.error(`[db] ${msg}`);
  }
  for (const msg of warnings) {
    console.warn(`[db] ${msg}`);
  }
}

/**
 * 从连接串的 sslmode 推导 pg.Pool 的 ssl 选项。
 * 若连接串已含 sslmode，则不再传入冲突的 ssl 对象（避免与 verify-full 冲突并触发 SSL 警告/挂起）。
 */
export function resolvePgSslFromUrl(
  parsed: ParsedPostgresUrl | null,
): PoolConfig["ssl"] | undefined {
  const sslmode = parsed?.sslmode?.toLowerCase() ?? null;

  if (sslmode) {
    // 由 connectionString 中的 sslmode 驱动 TLS，避免重复配置。
    return undefined;
  }

  if (parsed?.isNeon) {
    return { rejectUnauthorized: true };
  }

  return undefined;
}

/**
 * Neon + Vercel Serverless 的 pg.Pool 配置。
 * @see https://node-postgres.com/apis/pool
 * @see https://neon.com/docs/connect/choose-connection
 */
export function buildPostgresPoolConfig(databaseUrl: string): PoolConfig {
  const parsed = parsePostgresUrl(databaseUrl);
  logPoolHintsOnce(parsed);

  if (process.env.VERCEL === "1" && !parsed) {
    throw new Error(
      "[db] Vercel 上 DATABASE_URL 无法解析为 Postgres 连接串；请从 Neon 复制 Pooled 连接串，勿手工拼接 sslmode。",
    );
  }

  const isServerless =
    process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME != null;

  const maxFromEnv = Number.parseInt(
    process.env.DATABASE_POOL_MAX ?? "",
    10,
  );
  const max =
    Number.isFinite(maxFromEnv) && maxFromEnv > 0
      ? maxFromEnv
      : isServerless
        ? 1
        : 10;

  const config: PoolConfig = {
    connectionString: parsed?.connectionString ?? normalizeRawUrl(databaseUrl),
    max,
    min: 0,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: isServerless ? 5_000 : 30_000,
    allowExitOnIdle: isServerless,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10_000,
    application_name: process.env.VERCEL
      ? "ribo-website-vercel"
      : "ribo-website",
  };

  const ssl = resolvePgSslFromUrl(parsed);
  if (ssl !== undefined) {
    config.ssl = ssl;
  }

  if (isServerless) {
    config.options = "-c statement_timeout=60000";
  }

  return config;
}

function normalizeRawUrl(raw: string): string {
  return raw.trim();
}
