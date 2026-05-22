/**
 * 解析与校验 Postgres / Neon 连接串。
 * 不拼接或改写 user/password/host，避免破坏已编码的特殊字符。
 */

export type ParsedPostgresUrl = {
  connectionString: string;
  hostname: string;
  sslmode: string | null;
  isNeon: boolean;
  isNeonPooler: boolean;
};

export function normalizePostgresUrl(raw: string): string {
  return raw.trim();
}

export function isPostgresConnectionString(url: string): boolean {
  const trimmed = normalizePostgresUrl(url);
  return (
    trimmed.startsWith("postgres://") ||
    trimmed.startsWith("postgresql://")
  );
}

/**
 * 用 WHATWG URL 解析；postgres scheme 需临时换成 https 才能正确解析 query。
 */
export function parsePostgresUrl(raw: string): ParsedPostgresUrl | null {
  const connectionString = normalizePostgresUrl(raw);
  if (!isPostgresConnectionString(connectionString)) {
    return null;
  }

  try {
    const parsed = new URL(
      connectionString.replace(/^postgresql?:\/\//, "https://"),
    );
    const hostname = parsed.hostname.toLowerCase();
    const isNeon = hostname.includes("neon.tech");
    const isNeonPooler = isNeon && hostname.includes("-pooler");

    return {
      connectionString,
      hostname,
      sslmode: parsed.searchParams.get("sslmode"),
      isNeon,
      isNeonPooler,
    };
  } catch {
    return null;
  }
}

export type PostgresUrlValidation = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

export function validatePostgresUrlForRuntime(
  parsed: ParsedPostgresUrl | null,
): PostgresUrlValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!parsed) {
    return {
      ok: false,
      errors: [
        "DATABASE_URL 不是有效的 postgres:// 或 postgresql:// 连接串（请检查是否含未编码的特殊字符）。",
      ],
      warnings: [],
    };
  }

  if (!parsed.hostname) {
    errors.push("DATABASE_URL 缺少主机名。");
  }

  const sslmode = parsed.sslmode?.toLowerCase() ?? null;
  if (parsed.isNeon && !sslmode) {
    warnings.push(
      "Neon 连接串建议包含 ?sslmode=require（或 verify-full），否则可能无法建立 TLS。",
    );
  }

  try {
    const url = new URL(
      parsed.connectionString.replace(/^postgresql?:\/\//, "https://"),
    );
    if (url.searchParams.getAll("sslmode").length > 1) {
      errors.push(
        "DATABASE_URL 含有多个 sslmode 查询参数，请勿手工拼接；请从 Neon 控制台整段复制连接串。",
      );
    }
  } catch {
    /* parsePostgresUrl 已校验过 */
  }

  if (
    parsed.isNeon &&
    process.env.VERCEL === "1" &&
    !parsed.isNeonPooler
  ) {
    warnings.push(
      "Vercel 生产环境请使用 Neon 控制台「Pooled connection」连接串（主机名含 -pooler），避免 Serverless 并发耗尽直连连接导致写入挂起。",
    );
  }

  return { ok: errors.length === 0, errors, warnings };
}
