import { commonErrors, envelope, errorResponse, jsonRequest } from "@/docs/helpers";

/**
 * Stage 3：客户案例（Cases）接口的 OpenAPI 定义。
 *
 * 字段结构由 `src/validations/cases.validation.ts` 约束，
 * 文档中给出关键字段与示例，完整规则以 Zod 为准。
 */

const stringArray = (description: string) => ({
  type: "array",
  description,
  items: { type: "string" },
});

const objectSchema = (
  description: string,
  properties: Record<string, unknown> = {},
): Record<string, unknown> => ({
  type: "object",
  description,
  additionalProperties: true,
  properties,
});

const caseItemSchema = objectSchema("客户案例（业务主键 id）", {
  id: { type: "string", example: "case-001" },
  title: { type: "string", example: "游戏出海长线买量" },
  client: { type: "string", example: "测试游戏" },
  industry: { type: "string", enum: ["ecommerce", "game", "app", "brand"], example: "game" },
  region: { type: "string", example: "日本" },
  summary: { type: "string" },
  cover: { type: "string", example: "/images/case-001.png" },
  awards: stringArray("所获奖项"),
  tags: stringArray("标签"),
  year: { type: "string", example: "2024" },
  featured: { type: "boolean", description: "首页置顶（三态标记，写入统一归一化为布尔）" },
  stats: {
    type: "array",
    description: "核心指标（最多 24 项）",
    items: objectSchema("指标", {
      value: { type: "string", example: "320" },
      unit: { type: "string", example: "%" },
      label: { type: "string", example: "ROI 提升" },
    }),
  },
  blocks: {
    type: "array",
    description: "内容板块（最多 100 项）",
    items: objectSchema("内容板块", {
      key: { type: "string", example: "background" },
      title: { type: "string", example: "项目背景" },
      body: stringArray("正文段落"),
      points: stringArray("要点（可选）"),
    }),
  },
  createdAt: { type: "string", format: "date-time" },
  updatedAt: { type: "string", format: "date-time" },
});

export const casesSchemas: Record<string, Record<string, unknown>> = {
  CaseItem: caseItemSchema,
  CaseListResult: objectSchema("案例分页结果", {
    items: { type: "array", items: { $ref: "#/components/schemas/CaseItem" } },
    total: { type: "integer", example: 8 },
    page: { type: "integer", example: 1 },
    pageSize: { type: "integer", example: 10 },
  }),
  CasesPageContent: objectSchema("案例列表页文案（单文档）", {
    title: { type: "string", example: "海外营销成功案例" },
    subtitle: { type: "string" },
    filters: {
      type: "array",
      items: objectSchema("筛选项", {
        key: { type: "string", enum: ["all", "ecommerce", "game", "app", "brand"] },
        label: { type: "string", example: "全部" },
      }),
    },
    updatedAt: { type: "string", format: "date-time" },
  }),
};

const CASE_ITEM_EXAMPLE = {
  id: "case-001",
  title: "游戏出海长线买量",
  client: "测试游戏",
  industry: "game",
  region: "日本",
  summary: "以素材工业化产能实现稳定 ROI。",
  cover: "/images/case-001.png",
  awards: ["年度飞跃增长奖"],
  tags: ["日本", "游戏"],
  year: "2024",
  featured: true,
  stats: [{ value: "320", unit: "%", label: "ROI 提升" }],
  blocks: [{ key: "background", title: "项目背景", body: ["经典 IP 出海日本。"], points: ["长线买量"] }],
};

const idParam = {
  name: "id",
  in: "path",
  required: true,
  schema: { type: "string" },
  description: "案例业务主键（slug）",
};

/** Stage 3 已实现接口的 path 条目。 */
export function casesPaths(): Record<string, Record<string, unknown>> {
  const itemSchema = { $ref: "#/components/schemas/CaseItem" };
  const pageSchema = { $ref: "#/components/schemas/CasesPageContent" };

  return {
    "/cases/page": {
      get: {
        tags: ["Cases"],
        summary: "读取案例列表页文案",
        description: "尚未初始化时返回 404 / code=4040。",
        responses: {
          200: { description: "列表页文案", ...envelope(pageSchema) },
          ...commonErrors({ notFound: true }),
        },
      },
      put: {
        tags: ["Cases"],
        summary: "更新案例列表页文案",
        security: [{ bearerAuth: [] }],
        requestBody: jsonRequest("#/components/schemas/CasesPageContent", {
          title: "海外营销成功案例",
          subtitle: "以数据与创意驱动的增长实践",
          filters: [
            { key: "all", label: "全部" },
            { key: "game", label: "游戏" },
          ],
        }),
        responses: {
          200: { description: "保存后的文案", ...envelope(pageSchema) },
          ...commonErrors({ protected: true }),
        },
      },
    },
    "/cases": {
      get: {
        tags: ["Cases"],
        summary: "案例列表（分页 / 筛选 / 搜索）",
        description:
          "支持 `industry`（all/ecommerce/game/app/brand）、`featured`（true/false/all）、" +
          "`keyword`（模糊匹配 title / client / summary）与 `page` / `pageSize`。默认按「置顶优先 + 最近更新」排序。",
        parameters: [
          { name: "industry", in: "query", schema: { type: "string", enum: ["all", "ecommerce", "game", "app", "brand"] } },
          { name: "featured", in: "query", schema: { type: "string", enum: ["true", "false", "all"] } },
          { name: "keyword", in: "query", schema: { type: "string", example: "美妆" } },
          { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
          { name: "pageSize", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 10 } },
        ],
        responses: {
          200: {
            description: "分页结果",
            ...envelope(
              { $ref: "#/components/schemas/CaseListResult" },
              {
                code: 0,
                message: "ok",
                data: { items: [CASE_ITEM_EXAMPLE], total: 1, page: 1, pageSize: 10 },
              },
            ),
          },
          400: errorResponse("参数校验失败（errors 数组给出具体字段）", 4000),
          500: errorResponse("服务器内部错误", 5000),
        },
      },
      post: {
        tags: ["Cases"],
        summary: "新建案例",
        description: "请求体必须携带业务主键 `id`（slug）；`id` 重复返回 409 / code=4090。",
        security: [{ bearerAuth: [] }],
        requestBody: jsonRequest("#/components/schemas/CaseItem", CASE_ITEM_EXAMPLE),
        responses: {
          201: { description: "创建成功", ...envelope(itemSchema, { code: 0, message: "案例已创建", data: CASE_ITEM_EXAMPLE }) },
          400: errorResponse("参数校验失败", 4000),
          401: errorResponse("未登录 / Token 失效", 4010),
          409: errorResponse("业务主键（id）冲突", 4090),
          500: errorResponse("服务器内部错误", 5000),
        },
      },
    },
    "/cases/{id}": {
      get: {
        tags: ["Cases"],
        summary: "案例详情",
        parameters: [idParam],
        responses: {
          200: { description: "案例详情", ...envelope(itemSchema, { code: 0, message: "ok", data: CASE_ITEM_EXAMPLE }) },
          404: errorResponse("案例不存在", 4040),
          500: errorResponse("服务器内部错误", 5000),
        },
      },
      put: {
        tags: ["Cases"],
        summary: "编辑案例",
        description: "整体覆盖案例；`id` 为业务主键，与路径不一致时返回 400（id 不可修改）。",
        security: [{ bearerAuth: [] }],
        parameters: [idParam],
        requestBody: jsonRequest("#/components/schemas/CaseItem", CASE_ITEM_EXAMPLE),
        responses: {
          200: { description: "保存后的案例", ...envelope(itemSchema, { code: 0, message: "案例已保存", data: CASE_ITEM_EXAMPLE }) },
          400: errorResponse("参数校验失败 / id 不可修改", 4000),
          401: errorResponse("未登录 / Token 失效", 4010),
          404: errorResponse("案例不存在", 4040),
          500: errorResponse("服务器内部错误", 5000),
        },
      },
      delete: {
        tags: ["Cases"],
        summary: "删除案例",
        security: [{ bearerAuth: [] }],
        parameters: [idParam],
        responses: {
          200: {
            description: "删除成功",
            ...envelope(
              { type: "object", properties: { id: { type: "string" }, success: { type: "boolean" } } },
              { code: 0, message: "案例已删除", data: { id: "case-001", success: true } },
            ),
          },
          401: errorResponse("未登录 / Token 失效", 4010),
          404: errorResponse("案例不存在", 4040),
          500: errorResponse("服务器内部错误", 5000),
        },
      },
    },
    "/cases/{id}/featured": {
      post: {
        tags: ["Cases"],
        summary: "切换首页置顶",
        security: [{ bearerAuth: [] }],
        parameters: [idParam],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["featured"],
                properties: { featured: { type: "boolean", example: true } },
              },
              example: { featured: true },
            },
          },
        },
        responses: {
          200: { description: "更新后的案例", ...envelope(itemSchema, { code: 0, message: "已置顶", data: CASE_ITEM_EXAMPLE }) },
          400: errorResponse("参数校验失败", 4000),
          401: errorResponse("未登录 / Token 失效", 4010),
          404: errorResponse("案例不存在", 4040),
          500: errorResponse("服务器内部错误", 5000),
        },
      },
    },
  };
}
