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
  /** 生产环境推荐直接注入 bcrypt hash，避免在环境变量中保存明文密码。 */
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH ?? "",
  loginRateWindowMinutes: parseNumber(process.env.LOGIN_RATE_WINDOW_MINUTES, 15),
  loginRateMaxAttempts: parseNumber(process.env.LOGIN_RATE_MAX_ATTEMPTS, 10),
  swaggerEnabled: parseBool(process.env.SWAGGER_ENABLED, true),
  /** data/site.json 路径（相对 server/ 工作目录） */
  siteDataFile: process.env.SITE_DATA_FILE ?? path.resolve(process.cwd(), "../web/data/site.json"),
} as const;

export interface ProductionConfigValues {
  jwtSecret: string;
  adminPasswordHash: string;
  corsOrigin: string;
}

const BCRYPT_HASH_PATTERN = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

/**
 * 生产启动前的安全基线，避免服务在默认凭据或通配 CORS 下上线。
 * 开发 / 测试环境仍允许使用默认值，便于本地测试与种子初始化。
 */
export function validateProductionConfig(values: ProductionConfigValues = config): void {
  const errors: string[] = [];

  if (
    values.jwtSecret.length < 32 ||
    values.jwtSecret === "dev-only-insecure-secret" ||
    /replace-with|change-me|your[-_]?secret/i.test(values.jwtSecret)
  ) {
    errors.push("JWT_SECRET 必须是至少 32 个字符的非占位随机值");
  }

  if (!BCRYPT_HASH_PATTERN.test(values.adminPasswordHash)) {
    errors.push("ADMIN_PASSWORD_HASH 必须是有效的 bcrypt hash");
  }

  const origins = values.corsOrigin
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  if (origins.length === 0 || values.corsOrigin === "*") {
    errors.push("CORS_ORIGIN 必须配置一个或多个明确的 http(s) 来源，不能使用 *");
  } else {
    for (const origin of origins) {
      try {
        const parsed = new URL(origin);
        if (!/^https?:$/.test(parsed.protocol) || !parsed.hostname || parsed.pathname !== "/") {
          errors.push(`CORS_ORIGIN 来源无效：${origin}`);
        }
      } catch {
        errors.push(`CORS_ORIGIN 来源无效：${origin}`);
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`[config] 生产环境安全检查失败：${errors.join("；")}`);
  }
}

if (config.isProd && config.jwtSecret === "dev-only-insecure-secret") {
  // eslint-disable-next-line no-console
  console.warn("[config] ⚠️  JWT_SECRET 未设置，生产环境请务必配置强随机值");
}
