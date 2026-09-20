import { z } from "zod";

import { bilingualTranslationsSchema, requiredText, text, titledItemSchema } from "@/validations/common.validation";

/** PUT /about —— 关于我们整体更新。 */
export const aboutContentSchema = z
  .object({
    heroEyebrow: text(200, "眉标"),
    heroTitle: requiredText(200, "主标题"),
    heroDescription: text(2000, "简介"),
    stats: z
      .array(
        z
          .object({
            value: text(60, "数值"),
            unit: text(20, "单位"),
            label: text(120, "说明"),
          })
          .strict(),
      )
      .max(12, "指标最多 12 项"),
    visionTitle: requiredText(200, "愿景标题"),
    visionText: text(4000, "愿景正文"),
    values: z.array(titledItemSchema).max(12, "价值观最多 12 项"),
    timeline: z
      .array(
        z
          .object({
            period: text(40, "时间"),
            title: requiredText(200, "标题"),
            description: text(1000, "说明"),
          })
          .strict(),
      )
      .max(30, "里程碑最多 30 项"),
    team: z
      .array(
        z
          .object({
            name: requiredText(80, "姓名"),
            role: text(120, "职位"),
            bio: text(2000, "简介"),
            avatar: text(2000, "头像地址").optional(),
          })
          .strict(),
      )
      .max(30, "成员最多 30 人"),
    teamIntro: text(4000, "团队介绍"),
    offices: z
      .array(
        z
          .object({
            city: requiredText(80, "城市"),
            label: text(60, "标签"),
            address: text(300, "地址"),
          })
          .strict(),
      )
      .max(30, "办公点最多 30 个"),
    translations: bilingualTranslationsSchema,
  })
  .strict();

export type AboutContentInput = z.infer<typeof aboutContentSchema>;
