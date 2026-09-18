import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { config } from "@/config";
import { ApiError, ErrorCode } from "@/utils/ApiError";

interface MongoDuplicateError {
  code?: number;
  keyValue?: Record<string, unknown>;
}

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound(`接口不存在: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Zod 直接抛出（未走 validate 中间件时兜底）
  if (err instanceof ZodError) {
    res.status(400).json({
      code: ErrorCode.VALIDATION,
      message: "参数校验失败",
      errors: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  if (err instanceof ApiError) {
    res.status(err.httpStatus).json({
      code: err.code,
      message: err.message,
      ...(err.errors ? { errors: err.errors } : {}),
      ...(err.details !== undefined && !config.isProd ? { details: err.details } : {}),
    });
    return;
  }

  const mongoErr = err as MongoDuplicateError;
  if (mongoErr?.code === 11000) {
    res.status(409).json({
      code: ErrorCode.CONFLICT,
      message: "资源已存在",
      ...(!config.isProd && mongoErr.keyValue ? { details: mongoErr.keyValue } : {}),
    });
    return;
  }

  const message = err instanceof Error ? err.message : "服务器内部错误";
  if (!config.isTest) {
    // eslint-disable-next-line no-console
    console.error("[error]", err);
  }
  res.status(500).json({
    code: ErrorCode.INTERNAL,
    message: config.isProd ? "服务器内部错误" : message,
  });
}
