import path from "node:path";

import dotenv from "dotenv";

const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";
dotenv.config({ path: path.resolve(process.cwd(), envFile) });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

/** 安全解析数字环境变量，非法时回退。 */
export function parseNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** 解析布尔环境变量："true" / "1" / "yes" 为真。 */
export function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value === "true" || value === "1" || value === "yes";
}

const nodeEnv = process.env.NODE_ENV ?? "development";
const isTest = nodeEnv === "test";

export const config = {
  nodeEnv,
  isTest,
  isProd: nodeEnv === "production",
  port: parseNumber(process.env.PORT, 4000),
  apiPrefix: process.env.API_PREFIX ?? "/api/v1",
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
  mongoUri: isTest
    ? process.env.MONGO_URI_TEST ?? "mongodb://127.0.0.1:27017/adfly_admin_test"
    : process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017/adfly_admin",
  jwtSecret: process.env.JWT_SECRET ?? "dev-only-insecure-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "12h",
  adminUsername: process.env.ADMIN_USERNAME ?? "admin",
  adminPassword: process.env.ADMIN_PASSWORD ?? "admin",
  loginRateWindowMinutes: parseNumber(process.env.LOGIN_RATE_WINDOW_MINUTES, 15),
  loginRateMaxAttempts: parseNumber(process.env.LOGIN_RATE_MAX_ATTEMPTS, 10),
  swaggerEnabled: parseBool(process.env.SWAGGER_ENABLED, true),
  /** data/site.json 路径（相对 server/ 工作目录） */
  siteDataFile: process.env.SITE_DATA_FILE ?? path.resolve(process.cwd(), "../web/data/site.json"),
} as const;

if (config.isProd && config.jwtSecret === "dev-only-insecure-secret") {
  // eslint-disable-next-line no-console
  console.warn("[config] ⚠️  JWT_SECRET 未设置，生产环境请务必配置强随机值");
}
