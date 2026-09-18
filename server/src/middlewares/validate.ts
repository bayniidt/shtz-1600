import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ZodTypeAny } from "zod";

import { ApiError, ErrorCode } from "@/utils/ApiError";

type Source = "body" | "query" | "params";

interface ValidateOptions {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

const SOURCES: Source[] = ["body", "query", "params"];

/** 服务端托管字段：客户端回传时直接剔除（既可幂等回写，也避免被篡改）。 */
const MANAGED_KEYS = ["_id", "__v", "key", "createdAt", "updatedAt"];

function stripManagedKeys(body: unknown): void {
  if (!body || typeof body !== "object" || Array.isArray(body)) return;
  const record = body as Record<string, unknown>;
  for (const key of MANAGED_KEYS) delete record[key];
}

/** Zod 默认英文提示 → 中文（仅覆盖最常见的几条，其余原样透传）。 */
const MESSAGE_MAP: Record<string, string> = {
  Required: "该字段必填",
  "Invalid input": "字段类型或格式不正确",
  "Required input": "该字段必填",
  "Invalid email": "邮箱格式不正确",
};

function translate(message: string): string {
  if (MESSAGE_MAP[message]) return MESSAGE_MAP[message];
  const unknownKeys = /^Unrecognized key\(s\) in object: (.+)$/.exec(message);
  if (unknownKeys) return `不支持的字段：${unknownKeys[1].replace(/'/g, "")}`;
  if (/^Expected .*, received/.test(message)) return "字段类型或格式不正确";
  if (/^Too small: expected string to have >=1 characters$/.test(message)) return "该字段不能为空";
  return message;
}

/**
 * Zod 校验中间件：校验通过后用解析结果覆盖原值（去未知字段 / 类型转换）。
 * 失败抛出 400 / code=4000，附带 `errors: [{path, message}]`。
 */
export function validate(schemas: ValidateOptions): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      for (const source of SOURCES) {
        const schema = schemas[source];
        if (!schema) continue;
        if (source === "body") stripManagedKeys(req.body);
        const result = schema.safeParse(req[source]);
        if (!result.success) {
          next(
            new ApiError(400, ErrorCode.VALIDATION, "参数校验失败", {
              errors: result.error.issues.map((issue) => ({
                path: issue.path.join(".") || source,
                message: translate(issue.message),
              })),
            }),
          );
          return;
        }
        if (source === "query") {
          // Express 5 / 4 的 query 是 getter，逐个赋值更安全
          Object.defineProperty(req, "query", {
            value: result.data,
            writable: true,
            configurable: true,
          });
        } else {
          req[source] = result.data as never;
        }
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
