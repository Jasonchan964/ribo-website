import config from "@payload-config";
import { getPayload, type Payload } from "payload";
import {
  getSharedPostgresPool,
  isPostgresConnectionString,
} from "@/lib/database/postgres-pool";

const globalForPayload = globalThis as typeof globalThis & {
  __riboPayloadPromise?: Promise<Payload> | null;
};

/** 是否应尝试连接 Payload（需配置密钥；数据库默认使用 ribo-cms.db） */
export function isPayloadConfigured(): boolean {
  if (process.env.CMS_USE_MOCK === "true") return false;
  return Boolean(process.env.PAYLOAD_SECRET?.trim());
}

/** @deprecated 使用 isPayloadConfigured */
export function isPayloadEnabled(): boolean {
  return isPayloadConfigured();
}

export async function getPayloadClient(): Promise<Payload> {
  const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";

  if (isPostgresConnectionString(databaseUrl)) {
    getSharedPostgresPool(databaseUrl);
  }

  if (!globalForPayload.__riboPayloadPromise) {
    globalForPayload.__riboPayloadPromise = getPayload({ config });
  }

  return globalForPayload.__riboPayloadPromise;
}
