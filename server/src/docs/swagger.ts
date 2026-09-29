import { config } from "@/config";
import { careersPaths, careersSchemas } from "@/docs/careers.paths";
import { casesPaths, casesSchemas } from "@/docs/cases.paths";
import { contentPaths, contentSchemas } from "@/docs/content.paths";
import { envelope, errorResponse } from "@/docs/helpers";

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "ADFLY Admin API",
    version: "0.1.0",
    description:
      "ADFLY 管理后台接口文档。统一响应体 `{ code, message, data }`；错误码见「错误码」标签。\n\n" +
      "**错误码**：0 成功 · 4000 参数校验失败 · 4010 未登录/Token 失效 · 4030 无权限 · " +
      "4040 资源不存在 · 4090 ID 冲突 · 4290 请求过于频繁 · 5000 服务器错误 · 5001 功能开发中（保留错误码兼容）",
  },
  servers: [{ url: config.apiPrefix, description: "当前服务" }],
  tags: [
    { name: "Auth", description: "认证：登录 / 当前用户 / 退出" },
    { name: "Settings", description: "全局设置：后台主题色" },
    { name: "Site", description: "站点与导航（✅ Stage 2 已实现）" },
    { name: "Home", description: "首页 6 大板块（✅ Stage 2 已实现）" },
    { name: "Cases", description: "客户案例 CRUD（✅ Stage 3 已实现）" },
    { name: "About", description: "关于我们（✅ Stage 2 已实现）" },
    { name: "Careers", description: "招聘页面文案（✅ Stage 2）· 城市 / 职位 CRUD（✅ Stage 4 已实现）" },
    { name: "错误码", description: "全局错误码说明" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      ApiEnvelope: {
        type: "object",
        required: ["code", "message", "data"],
        properties: {
          code: { type: "integer", example: 0 },
          message: { type: "string", example: "ok" },
          data: { type: "object" },
        },
      },
      ErrorResponse: {
        type: "object",
        required: ["code", "message"],
        properties: {
          code: { type: "integer", example: 4000 },
          message: { type: "string", example: "参数校验失败" },
          errors: {
            type: "array",
            items: {
              type: "object",
              required: ["path", "message"],
              properties: {
                path: { type: "string", example: "username" },
                message: { type: "string", example: "username 不能为空" },
              },
            },
          },
        },
      },
      AdminUser: {
        type: "object",
        properties: {
          id: { type: "string", example: "65f1c2a1b2c3d4e5f6a7b8c9" },
          username: { type: "string", example: "admin" },
          role: { type: "string", enum: ["admin", "editor"], example: "admin" },
          lastLoginAt: { type: "string", format: "date-time", nullable: true },
        },
      },
      AdminTheme: {
        type: "object",
        properties: {
          brand: {
            type: "object",
            properties: {
              colorPrimary: { type: "string", example: "#eb3407" },
              colorPrimaryStrong: { type: "string", example: "#b72805" },
              colorPrimarySoft: { type: "string", example: "#fff0eb" },
              colorAccent: { type: "string", example: "#070301" },
            },
          },
          semantic: {
            type: "object",
            properties: {
              colorSuccess: { type: "string", example: "#10b981" },
              colorWarning: { type: "string", example: "#f59e0b" },
              colorError: { type: "string", example: "#ef4444" },
              colorInfo: { type: "string", example: "#eb3407" },
            },
          },
          layout: {
            type: "object",
            properties: {
              headerBg: { type: "string", example: "#ffffff" },
              siderBg: { type: "string", example: "#fafafa" },
              bodyBg: { type: "string", example: "#f5f7fa" },
              headerHeight: { type: "integer", example: 64 },
              siderWidth: { type: "integer", example: 220 },
            },
          },
          typography: {
            type: "object",
            properties: {
              fontFamily: { type: "string" },
              fontSize: { type: "integer", example: 14 },
              borderRadius: { type: "integer", example: 0 },
            },
          },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["username", "password"],
        properties: {
          username: { type: "string", example: "admin" },
          password: { type: "string", format: "password", example: "admin" },
        },
      },
      LoginResponse: {
        type: "object",
        properties: {
          accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
          tokenType: { type: "string", example: "Bearer" },
          expiresIn: { type: "string", example: "12h" },
          user: { $ref: "#/components/schemas/AdminUser" },
        },
      },
      // 内容模块 schema（Stage 2）
      ...contentSchemas,
      // 客户案例 schema（Stage 3）
      ...casesSchemas,
      // 招聘城市 / 职位 schema（Stage 4）
      ...careersSchemas,
    },
  },
  paths: {
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "登录",
        description: "使用账号密码登录，返回 JWT。失败次数过多（默认 15 分钟内 10 次）返回 4290。",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
              example: { username: "admin", password: "admin" },
            },
          },
        },
        responses: {
          200: {
            description: "登录成功",
            ...envelope(
              { $ref: "#/components/schemas/LoginResponse" },
              {
                code: 0,
                message: "ok",
                data: {
                  accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                  tokenType: "Bearer",
                  expiresIn: "12h",
                  user: { id: "65f1...", username: "admin", role: "admin", lastLoginAt: null },
                },
              },
            ),
          },
          400: errorResponse("参数校验失败", 4000),
          401: errorResponse("用户名或密码错误", 4010),
          429: errorResponse("登录尝试过于频繁，请稍后再试", 4290),
          500: errorResponse("服务器内部错误", 5000),
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "获取当前登录用户",
        description: "校验 Bearer Token 并返回当前管理员的公开信息。",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "当前用户信息",
            ...envelope(
              {
                type: "object",
                properties: { user: { $ref: "#/components/schemas/AdminUser" } },
              },
              { code: 0, message: "ok", data: { user: { id: "65f1...", username: "admin", role: "admin" } } },
            ),
          },
          401: errorResponse("未登录 / Token 失效 / Token 已过期", 4010),
          500: errorResponse("服务器内部错误", 5000),
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "退出登录",
        description: "将当前 Token 加入黑名单。",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "已退出",
            ...envelope(
              { type: "object", properties: { success: { type: "boolean", example: true } } },
              { code: 0, message: "已退出登录", data: { success: true } },
            ),
          },
          401: errorResponse("未登录 / Token 失效", 4010),
          500: errorResponse("服务器内部错误", 5000),
        },
      },
    },
    "/settings/theme": {
      get: {
        tags: ["Settings"],
        summary: "读取后台主题配置",
        description: "公开接口。首次调用会自动创建默认主题（与前台 ADFLY 品牌色一致）。",
        responses: {
          200: {
            description: "主题配置",
            ...envelope(
              { $ref: "#/components/schemas/AdminTheme" },
              { code: 0, message: "ok", data: { brand: { colorPrimary: "#eb3407" } } },
            ),
          },
          500: errorResponse("服务器内部错误", 5000),
        },
      },
      put: {
        tags: ["Settings"],
        summary: "更新后台主题配置（局部更新）",
        description: "仅提交需要修改的主题分组；服务端返回合并后的完整主题配置。",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  brand: { type: "object", additionalProperties: { type: "string" } },
                  semantic: { type: "object", additionalProperties: { type: "string" } },
                  layout: { type: "object", additionalProperties: true },
                  typography: { type: "object", additionalProperties: true },
                },
              },
              example: { brand: { colorPrimary: "#0066ff" } },
            },
          },
        },
        responses: {
          200: {
            description: "更新后的完整主题",
            ...envelope(
              { $ref: "#/components/schemas/AdminTheme" },
              { code: 0, message: "主题配置已保存", data: { brand: { colorPrimary: "#0066ff" } } },
            ),
          },
          400: errorResponse("参数校验失败（颜色格式 / 范围 / 未知字段）", 4000),
          401: errorResponse("未登录 / Token 失效", 4010),
          500: errorResponse("服务器内部错误", 5000),
        },
      },
    },
    "/settings/theme/reset": {
      post: {
        tags: ["Settings"],
        summary: "恢复默认后台主题",
        description: "将后台主题恢复为 ADFLY 默认品牌色、布局与排版配置。",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "默认主题",
            ...envelope(
              { $ref: "#/components/schemas/AdminTheme" },
              { code: 0, message: "主题配置已恢复默认", data: { brand: { colorPrimary: "#eb3407" } } },
            ),
          },
          401: errorResponse("未登录 / Token 失效", 4010),
          500: errorResponse("服务器内部错误", 5000),
        },
      },
    },
    "/health": {
      get: {
        tags: ["Auth"],
        summary: "健康检查",
        description: "返回服务状态、进程运行时间与当前时间戳，不需要登录。",
        responses: {
          200: {
            description: "服务正常",
            ...envelope({
              type: "object",
              properties: {
                status: { type: "string", example: "ok" },
                uptime: { type: "integer", example: 12 },
                timestamp: { type: "string", format: "date-time" },
              },
            }, { code: 0, message: "ok", data: { status: "ok", uptime: 12, timestamp: "2026-09-20T00:00:00.000Z" } }),
          },
        },
      },
    },
    // Stage 2：已实现的内容模块（site / home / about / careers.content）
    ...contentPaths(),
    // Stage 3：已实现的客户案例模块（cases）
    ...casesPaths(),
    // Stage 4：已实现的招聘城市 / 职位模块（careers）
    ...careersPaths(),
    // 兼容旧测试与外部检查：当前没有未实现的占位接口
    ...buildPlaceholderPaths(),
  },
};

export const errorCodeTable = [
  { code: 0, http: 200, message: "成功" },
  { code: 4000, http: 400, message: "参数校验失败（errors 数组给出具体字段）" },
  { code: 4010, http: 401, message: "未登录 / Token 失效 / Token 已过期" },
  { code: 4030, http: 403, message: "无权限" },
  { code: 4040, http: 404, message: "资源不存在" },
  { code: 4090, http: 409, message: "业务主键（id）冲突" },
  { code: 4290, http: 429, message: "请求过于频繁" },
  { code: 5000, http: 500, message: "服务器内部错误" },
  { code: 5001, http: 501, message: "功能开发中（保留错误码兼容）" },
];

/* ------------------- 未实现接口兼容清单 ------------------- */

interface EndpointSpec {
  method: "get" | "post" | "put" | "delete";
  path: string;
  tag: string;
  summary: string;
  protected: boolean;
  stage: string;
}

export function placeholderEndpoints(): EndpointSpec[] {
  return [];
}

/** 保留旧扩展点；Stage 4 完成后不再生成占位 path。 */
function buildPlaceholderPaths(): Record<string, Record<string, unknown>> {
  const paths: Record<string, Record<string, unknown>> = {};
  for (const endpoint of placeholderEndpoints()) {
    const entry = paths[endpoint.path] ?? (paths[endpoint.path] = {});
    const hasIdParam = endpoint.path.includes("{");
    entry[endpoint.method] = {
      tags: [endpoint.tag],
      summary: endpoint.summary,
      description: `计划于 ${endpoint.stage} 实现。当前为路由骨架，返回 501 / code=5001。`,
      ...(endpoint.protected ? { security: [{ bearerAuth: [] }] } : {}),
      ...(hasIdParam
        ? {
            parameters: [
              {
                name: "id",
                in: "path",
                required: true,
                schema: { type: "string" },
                description: "业务标识（slug）",
              },
            ],
          }
        : {}),
      responses: {
        501: errorResponse("功能开发中", 5001),
        ...(endpoint.protected ? { 401: errorResponse("未登录 / Token 失效", 4010) } : {}),
        500: errorResponse("服务器内部错误", 5000),
      },
    };
  }
  return paths;
}
