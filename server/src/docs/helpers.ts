/** OpenAPI 文档构建小工具（供 swagger.ts 与各模块文档复用）。 */

export function errorResponse(
  description: string,
  code: number,
  errors?: Array<{ path: string; message: string }>,
): Record<string, unknown> {
  const example: Record<string, unknown> = { code, message: description };
  if (code === 4000) {
    example.errors = errors ?? [{ path: "field", message: "字段校验失败" }];
  }

  return {
    description,
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
        example,
      },
    },
  };
}

export function envelope(dataSchema: Record<string, unknown>, example?: unknown): Record<string, unknown> {
  return {
    content: {
      "application/json": {
        schema: {
          allOf: [
            { $ref: "#/components/schemas/ApiEnvelope" },
            { type: "object", properties: { data: dataSchema } },
          ],
        },
        ...(example !== undefined ? { example } : {}),
      },
    },
  };
}

export function jsonRequest(schemaRef: string, example?: unknown): Record<string, unknown> {
  return {
    required: true,
    content: {
      "application/json": {
        schema: { $ref: schemaRef },
        ...(example !== undefined ? { example } : {}),
      },
    },
  };
}

/** 常见错误响应集合。 */
export function commonErrors(options: { protected?: boolean; notFound?: boolean } = {}): Record<string, unknown> {
  return {
    400: errorResponse("参数校验失败（errors 数组给出具体字段）", 4000),
    ...(options.protected ? { 401: errorResponse("未登录 / Token 失效", 4010) } : {}),
    ...(options.notFound ? { 404: errorResponse("资源不存在或尚未初始化", 4040) } : {}),
    500: errorResponse("服务器内部错误", 5000),
  };
}
