import { z } from "zod";

import { bilingualTranslationsSchema, linkSchema, optionalEmail, requiredText, text } from "@/validations/common.validation";

export const navItemSchema = linkSchema;

/** PUT /site —— 站点与导航整体更新。 */
export const siteConfigSchema = z
  .object({
    name: requiredText(120, "公司名称"),
    nameEn: text(200, "英文名称"),
    logoText: requiredText(60, "Logo 主标识"),
    logoSub: text(60, "Logo 副标识"),
    nav: z.array(navItemSchema).max(20, "导航最多 20 项"),
    contactEmail: optionalEmail,
    businessEmail: optionalEmail,
    phone: text(60, "电话"),
    address: text(200, "地址"),
    icp: text(120, "备案号"),
    seo: z
      .object({
        title: text(200, "SEO 标题"),
        description: text(500, "SEO 描述"),
        keywords: text(1000, "SEO 关键词"),
      })
      .strict(),
    footerLinks: z.array(navItemSchema).max(50, "页脚链接最多 50 项"),
    translations: bilingualTranslationsSchema,
  })
  .strict();

export type SiteConfigInput = z.infer<typeof siteConfigSchema>;
