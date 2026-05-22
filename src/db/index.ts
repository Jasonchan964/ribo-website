/**
 * 数据库连接入口：Postgres 单例池与 Payload 适配器配置。
 */
export {
  buildPostgresPoolConfig,
  getPayloadPgModule,
  getSharedPostgresPool,
  isPostgresConnectionString,
  isServerlessRuntime,
} from "@/lib/database/postgres-pool";
