import { z } from "zod";

import { flagSchema, optionalEmail, requiredText, slugSchema, text, titledItemSchema } from "@/validations/common.validation";

/** PUT /careers/content —— 加入我们页面文案（不含 cities / positions）。 */
export const careersContentSchema = z
  .object({
    heroTitle: requiredText(200, "主标题"),
    heroSubtitle: text(300, "副标题"),
    heroDescription: text(2000, "简介"),
    citiesEyebrow: text(200, "城市眉标"),
    citiesTitle: requiredText(200, "城市标题"),
    citiesDescription: text(1000, "城市说明"),
    cultureTitle: requiredText(200, "文化标题"),
    culture: z.array(titledItemSchema).max(12, "企业文化最多 12 项"),
    benefitsTitle: requiredText(200, "福利标题"),
    benefits: z
      .array(
        z
          .object({
            group: requiredText(80, "福利分组"),
            items: text(1000, "福利条目"),
          })
          .strict(),
      )
      .max(12, "福利分组最多 12 组"),
    jobsEyebrow: text(200, "职位眉标"),
    jobsTitle: requiredText(200, "职位标题"),
    portalUrl: text(500, "招聘系统地址"),
    applyEmail: optionalEmail,
  })
  .strict();

export type CareersContentInput = z.infer<typeof careersContentSchema>;

/** 城市 CRUD 请求体。id 可在 PUT 时修改，服务端负责联动职位。 */
export const careersCitySchema = z
  .object({
    id: slugSchema,
    name: requiredText(100, "城市名称"),
    nameEn: text(120, "英文名称"),
    code: text(80, "城市编码"),
    summary: text(500, "城市简介"),
    featured: flagSchema,
  })
  .strict();

const emptyToUndefined = (value: unknown) =>
  value === "" || value === undefined || value === null ? undefined : value;

export const careersCityListQuerySchema = z
  .object({
    keyword: z.preprocess(emptyToUndefined, text(100, "关键词").optional()),
    featured: z.preprocess(emptyToUndefined, z.enum(["true", "false", "all"]).optional()),
    page: z.preprocess(
      emptyToUndefined,
      z.coerce.number().int("页码必须是整数").min(1, "页码最小为 1").max(10000, "页码过大").optional().default(1),
    ),
    pageSize: z.preprocess(
      emptyToUndefined,
      z.coerce.number().int("每页数量必须是整数").min(1, "每页数量最小为 1").max(100, "每页数量最大为 100").optional().default(20),
    ),
  })
  .strict();

/** 删除城市时可明确指定职位回退城市；未指定时自动选择 id 最小的其他城市。 */
export const careersCityDeleteSchema = z
  .object({
    fallbackCityId: z.preprocess(emptyToUndefined, slugSchema.optional()),
  })
  .strict();

export const careersPositionSchema = z
  .object({
    id: slugSchema,
    title: requiredText(200, "职位名称"),
    cityId: slugSchema,
    extraCities: text(500, "其他城市"),
    type: text(80, "职位类型"),
    department: text(120, "部门"),
    tags: text(500, "标签"),
    urgent: flagSchema,
    hot: flagSchema,
    publishedAt: text(40, "发布日期"),
    summary: text(1000, "职位简介"),
    description: text(10000, "职位职责"),
    requirement: text(10000, "任职要求"),
    bonus: text(10000, "加分项"),
    applyUrl: text(500, "投递链接"),
  })
  .strict();

export const careersPositionListQuerySchema = z
  .object({
    cityId: z.preprocess(emptyToUndefined, slugSchema.optional()),
    keyword: z.preprocess(emptyToUndefined, text(100, "关键词").optional()),
    hot: z.preprocess(emptyToUndefined, z.enum(["true", "false", "all"]).optional()),
    urgent: z.preprocess(emptyToUndefined, z.enum(["true", "false", "all"]).optional()),
    page: z.preprocess(
      emptyToUndefined,
      z.coerce.number().int("页码必须是整数").min(1, "页码最小为 1").max(10000, "页码过大").optional().default(1),
    ),
    pageSize: z.preprocess(
      emptyToUndefined,
      z.coerce.number().int("每页必须是整数").min(1, "每页数量最小为 1").max(100, "每页数量最大为 100").optional().default(20),
    ),
  })
  .strict();

export const careerIdParamsSchema = z.object({ id: slugSchema }).strict();

export type CareersCityInput = z.infer<typeof careersCitySchema>;
export type CareersCityListQueryInput = z.infer<typeof careersCityListQuerySchema>;
export type CareersCityDeleteInput = z.infer<typeof careersCityDeleteSchema>;
export type CareersPositionInput = z.infer<typeof careersPositionSchema>;
export type CareersPositionListQueryInput = z.infer<typeof careersPositionListQuerySchema>;
