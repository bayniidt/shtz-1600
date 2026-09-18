/**
 * 业务错误码（响应体 `code` 字段）。
 * 与 HTTP 状态码解耦，前端据此做精细提示。
 */
export const ErrorCode = {
  OK: 0,
  /** 参数校验失败 */
  VALIDATION: 4000,
  /** 未登录 / Token 失效 */
  UNAUTHORIZED: 4010,
  /** 无权限 */
  FORBIDDEN: 4030,
  /** 资源不存在 */
  NOT_FOUND: 4040,
  /** 业务主键冲突 */
  CONFLICT: 4090,
  /** 请求过于频繁 */
  TOO_MANY_REQUESTS: 4290,
  /** 服务器内部错误 */
  INTERNAL: 5000,
  /** 功能尚未实现（占位接口） */
  NOT_IMPLEMENTED: 5001,
} as const;

export type ErrorCodeValue = (typeof ErrorCode)[keyof typeof ErrorCode];

export interface FieldError {
  path: string;
  message: string;
}

export class ApiError extends Error {
  public readonly httpStatus: number;
  public readonly code: ErrorCodeValue;
  public readonly errors?: FieldError[];
  public readonly details?: unknown;

  constructor(
    httpStatus: number,
    code: ErrorCodeValue,
    message: string,
    options: { errors?: FieldError[]; details?: unknown } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.httpStatus = httpStatus;
    this.code = code;
    this.errors = options.errors;
    this.details = options.details;
    Error.captureStackTrace?.(this, ApiError);
  }

  static badRequest(message = "参数校验失败", errors?: FieldError[]): ApiError {
    return new ApiError(400, ErrorCode.VALIDATION, message, { errors });
  }

  static unauthorized(message = "未登录或登录已失效"): ApiError {
    return new ApiError(401, ErrorCode.UNAUTHORIZED, message);
  }

  static forbidden(message = "无权限执行该操作"): ApiError {
    return new ApiError(403, ErrorCode.FORBIDDEN, message);
  }

  static notFound(message = "资源不存在"): ApiError {
    return new ApiError(404, ErrorCode.NOT_FOUND, message);
  }

  static conflict(message = "资源已存在"): ApiError {
    return new ApiError(409, ErrorCode.CONFLICT, message);
  }

  static tooManyRequests(message = "请求过于频繁，请稍后再试"): ApiError {
    return new ApiError(429, ErrorCode.TOO_MANY_REQUESTS, message);
  }

  static internal(message = "服务器内部错误"): ApiError {
    return new ApiError(500, ErrorCode.INTERNAL, message);
  }

  static notImplemented(message = "功能开发中"): ApiError {
    return new ApiError(501, ErrorCode.NOT_IMPLEMENTED, message);
  }
}
