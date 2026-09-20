import { commonErrors, envelope, errorResponse, jsonRequest } from "@/docs/helpers";

const objectSchema = (description: string, properties: Record<string, unknown>): Record<string, unknown> => ({
  type: "object",
  description,
  additionalProperties: true,
  properties,
});

const cityExample = {
  id: "shanghai",
  name: "上海",
  nameEn: "Shanghai",
  code: "CT_125",
  summary: "集团总部",
  featured: true,
  positionsCount: 1,
};

const cityWriteExample = {
  id: "shanghai",
  name: "上海",
  nameEn: "Shanghai",
  code: "CT_125",
  summary: "集团总部",
  featured: true,
};

const positionExample = {
  id: "position-001",
  title: "广告优化师",
  cityId: "shanghai",
  extraCities: "shenzhen",
  type: "全职",
  department: "投放中心",
  tags: "Facebook/Google",
  urgent: false,
  hot: true,
  publishedAt: "2026-01-01",
  summary: "负责广告投放优化。",
  description: "制定投放策略\n优化素材",
  requirement: "3 年以上经验",
  bonus: "熟悉 TikTok",
  applyUrl: "https://example.com/jobs/position-001",
};

const idParam = {
  name: "id",
  in: "path",
  required: true,
  schema: { type: "string" },
  description: "业务主键（slug）",
};

const cityProperties: Record<string, unknown> = {
  id: { type: "string", example: "shanghai" },
  name: { type: "string", example: "上海" },
  nameEn: { type: "string", example: "Shanghai" },
  code: { type: "string", example: "CT_125" },
  summary: { type: "string" },
  featured: { type: "boolean", description: "城市索引高亮" },
  positionsCount: { type: "integer", description: "主归属或附加城市职位数" },
};

const citySchema = objectSchema("招聘城市（业务主键 id）", cityProperties);

const positionSchema = objectSchema("招聘职位（业务主键 id）", {
  id: { type: "string", example: "position-001" },
  title: { type: "string", example: "广告优化师" },
  cityId: { type: "string", example: "shanghai" },
  extraCities: { type: "string", example: "shenzhen", description: "其他城市 id，/ 分隔；无效 id 会被过滤" },
  type: { type: "string", example: "全职" },
  department: { type: "string", example: "投放中心" },
  tags: { type: "string", example: "Facebook/Google" },
  urgent: { type: "boolean" },
  hot: { type: "boolean" },
  publishedAt: { type: "string", example: "2026-01-01" },
  summary: { type: "string" },
  description: { type: "string" },
  requirement: { type: "string" },
  bonus: { type: "string" },
  applyUrl: {
    oneOf: [
      { type: "string", enum: [""] },
      { type: "string", format: "uri", pattern: "^https?://" },
    ],
    description: "投递地址；可为空，仅允许绝对 http:// 或 https:// 地址",
    example: "https://example.com/jobs/position-001",
  },
});

export const careersSchemas: Record<string, Record<string, unknown>> = {
  CareerCity: citySchema,
  CareerCityInput: objectSchema("招聘城市写入模型（不含服务端统计字段）", {
    id: cityProperties.id,
    name: cityProperties.name,
    nameEn: cityProperties.nameEn,
    code: cityProperties.code,
    summary: cityProperties.summary,
    featured: cityProperties.featured,
  }),
  CareerPosition: positionSchema,
  CareerCityListResult: objectSchema("城市分页结果", {
    items: { type: "array", items: { $ref: "#/components/schemas/CareerCity" } },
    total: { type: "integer", example: 7 },
    page: { type: "integer", example: 1 },
    pageSize: { type: "integer", example: 20 },
  }),
  CareerCityDetail: objectSchema("城市详情及关联职位", {
    ...cityProperties,
    positions: { type: "array", items: { $ref: "#/components/schemas/CareerPosition" } },
  }),
  CareerPositionListResult: objectSchema("职位分页结果", {
    items: { type: "array", items: { $ref: "#/components/schemas/CareerPosition" } },
    total: { type: "integer", example: 20 },
    page: { type: "integer", example: 1 },
    pageSize: { type: "integer", example: 20 },
  }),
  CareerCityDeleteResult: objectSchema("城市删除结果", {
    id: { type: "string" },
    success: { type: "boolean" },
    fallbackCityId: { type: "string", nullable: true },
    reassignedPositions: { type: "integer" },
  }),
  CareerCityDeleteRequest: objectSchema("城市删除时的职位回退配置", {
    fallbackCityId: { type: "string", nullable: true, description: "可选；省略时自动选择其他城市" },
  }),
};

function pageParameters(extra: Record<string, unknown>[] = []): Record<string, unknown>[] {
  return [
    ...extra,
    { name: "keyword", in: "query", schema: { type: "string" }, description: "关键词" },
    { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
    { name: "pageSize", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 20 } },
  ];
}

/** Stage 4：招聘城市 / 职位 CRUD。 */
export function careersPaths(): Record<string, Record<string, unknown>> {
  const city = { $ref: "#/components/schemas/CareerCity" };
  const position = { $ref: "#/components/schemas/CareerPosition" };
  return {
    "/careers/cities": {
      get: {
        tags: ["Careers"],
        summary: "城市列表（含职位数）",
        description: "按关键词、重点标记与分页读取招聘城市，并统计主归属或附加城市职位数。",
        parameters: pageParameters([
          { name: "featured", in: "query", schema: { type: "string", enum: ["true", "false", "all"] } },
        ]),
        responses: {
          200: {
            description: "城市分页结果",
            ...envelope(
              { $ref: "#/components/schemas/CareerCityListResult" },
              { code: 0, message: "ok", data: { items: [cityExample], total: 1, page: 1, pageSize: 20 } },
            ),
          },
          ...commonErrors(),
        },
      },
      post: {
        tags: ["Careers"],
        summary: "新建城市",
        description: "创建招聘城市；业务主键 id 重复时返回 4090。",
        security: [{ bearerAuth: [] }],
        requestBody: jsonRequest("#/components/schemas/CareerCityInput", cityWriteExample),
        responses: {
          201: { description: "创建成功", ...envelope(city, { code: 0, message: "招聘城市已创建", data: cityExample }) },
          401: errorResponse("未登录 / Token 失效", 4010),
          409: errorResponse("城市 id 冲突", 4090),
          ...commonErrors(),
        },
      },
    },
    "/careers/cities/{id}": {
      get: {
        tags: ["Careers"],
        summary: "城市详情 + 关联职位",
        description: "读取城市详情及主归属或附加城市匹配到的职位列表。",
        parameters: [idParam],
        responses: {
          200: {
            description: "城市详情",
            ...envelope(
              { $ref: "#/components/schemas/CareerCityDetail" },
              { code: 0, message: "ok", data: { ...cityExample, positions: [positionExample] } },
            ),
          },
          404: errorResponse("招聘城市不存在", 4040),
          500: errorResponse("服务器内部错误", 5000),
        },
      },
      put: {
        tags: ["Careers"],
        summary: "编辑城市（改 id 联动职位）",
        description: "整体更新城市；修改 id 时同步更新职位的 cityId 与 extraCities。",
        security: [{ bearerAuth: [] }],
        parameters: [idParam],
        requestBody: jsonRequest("#/components/schemas/CareerCityInput", cityWriteExample),
        responses: {
          200: { description: "保存后的城市", ...envelope(city, { code: 0, message: "招聘城市已保存", data: cityExample }) },
          400: errorResponse("参数校验失败", 4000),
          401: errorResponse("未登录 / Token 失效", 4010),
          404: errorResponse("招聘城市不存在", 4040),
          409: errorResponse("城市 id 冲突", 4090),
          500: errorResponse("服务器内部错误", 5000),
        },
      },
      delete: {
        tags: ["Careers"],
        summary: "删除城市（职位回退）",
        description: "删除城市并将关联职位回退到指定或自动选择的其他城市；无其他城市时清空主 cityId。",
        security: [{ bearerAuth: [] }],
        parameters: [idParam],
        requestBody: jsonRequest("#/components/schemas/CareerCityDeleteRequest", { fallbackCityId: "shenzhen" }),
        responses: {
          200: {
            description: "删除成功",
            ...envelope(
              { $ref: "#/components/schemas/CareerCityDeleteResult" },
              { code: 0, message: "招聘城市已删除", data: { id: "shanghai", success: true, fallbackCityId: "shenzhen", reassignedPositions: 1 } },
            ),
          },
          400: errorResponse("回退城市无效或无法删除唯一城市", 4000),
          401: errorResponse("未登录 / Token 失效", 4010),
          404: errorResponse("招聘城市不存在", 4040),
          500: errorResponse("服务器内部错误", 5000),
        },
      },
    },
    "/careers/positions": {
      get: {
        tags: ["Careers"],
        summary: "职位列表（筛选 / 分页）",
        description: "按城市、热招、急招与关键词筛选招聘职位，并返回分页结果。",
        parameters: pageParameters([
          { name: "cityId", in: "query", schema: { type: "string" }, description: "主城市或附加城市" },
          { name: "hot", in: "query", schema: { type: "string", enum: ["true", "false", "all"] } },
          { name: "urgent", in: "query", schema: { type: "string", enum: ["true", "false", "all"] } },
        ]),
        responses: {
          200: {
            description: "职位分页结果",
            ...envelope(
              { $ref: "#/components/schemas/CareerPositionListResult" },
              { code: 0, message: "ok", data: { items: [positionExample], total: 1, page: 1, pageSize: 20 } },
            ),
          },
          ...commonErrors(),
        },
      },
      post: {
        tags: ["Careers"],
        summary: "新建职位",
        description: "创建招聘职位；主城市必须存在，无效或重复的 extraCities 会被过滤去重。",
        security: [{ bearerAuth: [] }],
        requestBody: jsonRequest("#/components/schemas/CareerPosition", positionExample),
        responses: {
          201: { description: "创建成功", ...envelope(position, { code: 0, message: "招聘职位已创建", data: positionExample }) },
          400: errorResponse("参数校验失败 / 所属城市不存在", 4000),
          401: errorResponse("未登录 / Token 失效", 4010),
          409: errorResponse("职位 id 冲突", 4090),
          500: errorResponse("服务器内部错误", 5000),
        },
      },
    },
    "/careers/positions/{id}": {
      get: {
        tags: ["Careers"],
        summary: "职位详情",
        description: "按职位业务主键读取完整职位内容，不存在时返回 4040。",
        parameters: [idParam],
        responses: {
          200: { description: "职位详情", ...envelope(position, { code: 0, message: "ok", data: positionExample }) },
          404: errorResponse("招聘职位不存在", 4040),
          500: errorResponse("服务器内部错误", 5000),
        },
      },
      put: {
        tags: ["Careers"],
        summary: "编辑职位",
        description: "整体更新招聘职位；业务主键 id 不可通过编辑修改。",
        security: [{ bearerAuth: [] }],
        parameters: [idParam],
        requestBody: jsonRequest("#/components/schemas/CareerPosition", positionExample),
        responses: {
          200: { description: "保存后的职位", ...envelope(position, { code: 0, message: "招聘职位已保存", data: positionExample }) },
          400: errorResponse("参数校验失败 / 所属城市不存在 / id 不可修改", 4000),
          401: errorResponse("未登录 / Token 失效", 4010),
          404: errorResponse("招聘职位不存在", 4040),
          500: errorResponse("服务器内部错误", 5000),
        },
      },
      delete: {
        tags: ["Careers"],
        summary: "删除职位",
        description: "按职位业务主键删除职位，删除成功返回被删除 id。",
        security: [{ bearerAuth: [] }],
        parameters: [idParam],
        responses: {
          200: {
            description: "删除成功",
            ...envelope(
              { type: "object", properties: { id: { type: "string" }, success: { type: "boolean" } } },
              { code: 0, message: "招聘职位已删除", data: { id: "position-001", success: true } },
            ),
          },
          401: errorResponse("未登录 / Token 失效", 4010),
          404: errorResponse("招聘职位不存在", 4040),
          500: errorResponse("服务器内部错误", 5000),
        },
      },
    },
  };
}
