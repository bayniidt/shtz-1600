import rateLimit, { type RateLimitRequestHandler } from "express-rate-limit";

import { config } from "@/config";
import { ErrorCode } from "@/utils/ApiError";

/**
 * 登录限流（工厂）：按 IP 统计失败次数（成功请求不计入）。
 * 超出后返回 429 / code=4290。使用工厂以便测试创建独立实例。
 */
export function createLoginRateLimiter(max?: number, windowMinutes?: number): RateLimitRequestHandler {
  return rateLimit({
    windowMs: (windowMinutes ?? config.loginRateWindowMinutes) * 60 * 1000,
    limit: max ?? config.loginRateMaxAttempts,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: {
      code: ErrorCode.TOO_MANY_REQUESTS,
      message: "登录尝试过于频繁，请稍后再试",
    },
  });
}

/** 通用写接口限流（宽松，仅防滥用）。 */
export function createWriteRateLimiter(): RateLimitRequestHandler {
  return rateLimit({
    windowMs: 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      code: ErrorCode.TOO_MANY_REQUESTS,
      message: "请求过于频繁，请稍后再试",
    },
  });
}
