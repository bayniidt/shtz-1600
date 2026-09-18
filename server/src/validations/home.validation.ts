import { z } from "zod";

import {
  flagSchema,
  linkSchema,
  requiredText,
  statListSchema,
  statSchema,
  text,
  textList,
  titledItemSchema,
} from "@/validations/common.validation";

export const MEDIA_CATEGORIES = ["Social", "Search", "Content", "Ads"] as const;

/** PUT /home/hero */
export const heroSectionSchema = z
  .object({
    eyebrow: text(200, "眉标"),
    title: requiredText(200, "主标题"),
    titleEn: text(200, "英文标题"),
    description: text(1000, "简介"),
    primaryCta: linkSchema,
    secondaryCta: linkSchema,
    marquee: textList(50, 60),
    stats: z
      .array(
        z
          .object({
            value: text(60, "数值"),
            label: text(120, "说明"),
          })
          .strict(),
      )
      .max(12, "指标最多 12 项"),
  })
  .strict();

/** PUT /home/media */
export const mediaSectionSchema = z
  .object({
    title: requiredText(200, "标题"),
    subtitle: text(300, "副标题"),
    benefits: z.array(titledItemSchema).max(12, "权益最多 12 项"),
    partners: z
      .array(
        z
          .object({
            name: requiredText(80, "媒体名称"),
            mark: text(80, "字标"),
            category: z.enum(MEDIA_CATEGORIES),
            accent: text(20, "主色").optional(),
          })
          .strict(),
      )
      .max(60, "媒体最多 60 项"),
    cta: linkSchema,
  })
  .strict();

/** PUT /home/flow */
export const flowSectionSchema = z
  .object({
    eyebrow: text(200, "眉标"),
    title: requiredText(200, "标题"),
    description: text(1000, "说明"),
    orbit: z
      .array(z.object({ label: requiredText(60, "环形标签") }).strict())
      .max(20, "环形标签最多 20 项"),
    features: z
      .array(
        z
          .object({
            title: requiredText(200, "能力标题"),
            description: text(2000, "能力说明"),
            mark: text(80, "标识").optional(),
            points: text(1000, "要点").optional(),
          })
          .strict(),
      )
      .max(12, "能力最多 12 项"),
    cta: linkSchema,
  })
  .strict();

/** PUT /home/clients */
export const clientsSectionSchema = z
  .object({
    title: requiredText(200, "标题"),
    subtitle: text(300, "副标题"),
    industries: z
      .array(
        z
          .object({
            key: requiredText(60, "行业标识"),
            name: requiredText(60, "行业名称"),
            description: text(1000, "行业说明"),
            stat: text(300, "行业数据"),
          })
          .strict(),
      )
      .max(20, "行业最多 20 项"),
    logos: z
      .array(
        z
          .object({
            name: requiredText(80, "客户名称"),
            industry: requiredText(60, "所属行业"),
          })
          .strict(),
      )
      .max(200, "客户 Logo 最多 200 项"),
  })
  .strict();

/** PUT /home/strength */
export const strengthSectionSchema = z
  .object({
    title: requiredText(200, "标题"),
    description: text(2000, "简介"),
    nodes: z
      .array(
        z
          .object({
            city: requiredText(80, "城市"),
            role: text(120, "角色"),
            x: z.union([z.number(), z.string().max(20)]),
            y: z.union([z.number(), z.string().max(20)]),
            major: flagSchema.optional(),
          })
          .strict(),
      )
      .max(50, "节点最多 50 项"),
    stats: statListSchema,
    cta: linkSchema,
  })
  .strict();

/** PUT /home/honors */
export const honorsSectionSchema = z
  .object({
    title: requiredText(200, "标题"),
    subtitle: text(300, "副标题"),
    groups: z
      .array(
        z
          .object({
            key: requiredText(60, "分组标识"),
            title: requiredText(100, "分组名称"),
            items: z
              .array(
                z
                  .object({
                    title: requiredText(200, "荣誉名称"),
                    issuer: text(200, "颁发机构"),
                    year: text(20, "年份"),
                  })
                  .strict(),
              )
              .max(20, "每组荣誉最多 20 项"),
          })
          .strict(),
      )
      .max(10, "荣誉分组最多 10 组"),
  })
  .strict();

/** 首页板块名 → schema 映射（路由按 section 取用）。 */
export const HOME_SECTION_SCHEMAS = {
  hero: heroSectionSchema,
  media: mediaSectionSchema,
  flow: flowSectionSchema,
  clients: clientsSectionSchema,
  strength: strengthSectionSchema,
  honors: honorsSectionSchema,
} as const;

export type HomeSection = keyof typeof HOME_SECTION_SCHEMAS;
export const HOME_SECTIONS = Object.keys(HOME_SECTION_SCHEMAS) as HomeSection[];

export type HeroSectionInput = z.infer<typeof heroSectionSchema>;
export type MediaSectionInput = z.infer<typeof mediaSectionSchema>;
export type FlowSectionInput = z.infer<typeof flowSectionSchema>;
export type ClientsSectionInput = z.infer<typeof clientsSectionSchema>;
export type StrengthSectionInput = z.infer<typeof strengthSectionSchema>;
export type HonorsSectionInput = z.infer<typeof honorsSectionSchema>;

/** 复用给其他模块（stats 结构一致）。 */
export { statSchema };
