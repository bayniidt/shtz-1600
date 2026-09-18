import { z } from "zod";

import { INDUSTRY_FILTER_KEYS, INDUSTRY_KEYS } from "@/models/CasesPageContent.model";
import { flagSchema, requiredText, slugSchema, text, textList } from "@/validations/common.validation";

/** 案例核心指标（stats[]）。 */
export const caseStatSchema = z
  .object({
    value: text(60, "数值"),
    unit: text(20, "单位"),
    label: requiredText(120, "说明"),
  })
  .strict();

/** 案例内容板块（blocks[]，body / points 均为多行文本数组）。 */
export const caseBlockSchema = z
  .object({
    key: text(60, "板块标识"),
    title: requiredText(200, "板块标题"),
    body: textList(50, 2000),
    points: textList(50, 1000).optional(),
  })
  .strict();

/** POST /cases · PUT /cases/{id} —— 案例完整文档（`id` 为业务主键）。 */
export const caseItemSchema = z
  .object({
    id: slugSchema,
    title: requiredText(200, "案例标题"),
    client: requiredText(200, "客户名称"),
    industry: z.enum(INDUSTRY_KEYS),
    region: text(200, "投放区域"),
    summary: text(2000, "案例简介"),
    cover: text(2000, "封面图"),
    awards: textList(50, 300),
    tags: textList(50, 100),
    year: text(20, "年份"),
    featured: flagSchema,
    stats: z.array(caseStatSchema).max(24, "核心指标最多 24 项"),
    blocks: z.array(caseBlockSchema).max(100, "内容板块最多 100 项"),
  })
  .strict();

/** PUT /cases/page —— 案例列表页文案（单文档）。 */
export const casesPageSchema = z
  .object({
    title: requiredText(200, "页面标题"),
    subtitle: text(500, "页面副标题"),
    filters: z
      .array(
        z
          .object({
            key: z.enum(INDUSTRY_FILTER_KEYS),
            label: requiredText(40, "筛选项文案"),
          })
          .strict(),
      )
      .max(20, "筛选项最多 20 项"),
  })
  .strict();

/** POST /cases/{id}/featured —— 切换首页置顶。 */
export const caseFeaturedSchema = z
  .object({
    featured: flagSchema,
  })
  .strict();

/** query 中的空串（前端清空筛选）视为「未提供」。 */
const emptyToUndefined = (value: unknown) =>
  value === "" || value === undefined || value === null ? undefined : value;

/** GET /cases —— 列表分页 / 筛选 / 搜索。 */
export const caseListQuerySchema = z
  .object({
    industry: z.preprocess(emptyToUndefined, z.enum(INDUSTRY_FILTER_KEYS).optional()),
    featured: z.preprocess(emptyToUndefined, z.enum(["true", "false", "all"]).optional()),
    keyword: z.preprocess(emptyToUndefined, text(100, "关键词").optional()),
    page: z.preprocess(
      emptyToUndefined,
      z.coerce
        .number({ invalid_type_error: "页码必须是数字" })
        .int("页码必须是整数")
        .min(1, "页码最小为 1")
        .max(10000, "页码过大")
        .optional()
        .default(1),
    ),
    pageSize: z.preprocess(
      emptyToUndefined,
      z.coerce
        .number({ invalid_type_error: "每页数量必须是数字" })
        .int("每页数量必须是整数")
        .min(1, "每页数量最小为 1")
        .max(100, "每页数量最大为 100")
        .optional()
        .default(10),
    ),
  })
  .strict();

export type CaseItemInput = z.infer<typeof caseItemSchema>;
export type CasesPageInput = z.infer<typeof casesPageSchema>;
export type CaseListQueryInput = z.infer<typeof caseListQuerySchema>;
