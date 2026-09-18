import type { RequestHandler } from "express";

import { ApiError } from "@/utils/ApiError";

/**
 * Stage 1 占位处理器：路由已注册但业务尚未实现。
 * 返回 501 / code=5001，Stage 2~4 会逐个替换为真实实现。
 */
export function notImplemented(feature: string): RequestHandler {
  return (_req, _res, next) => {
    next(ApiError.notImplemented(`「${feature}」尚未实现`));
  };
}
