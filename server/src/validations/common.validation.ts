import { z } from "zod";

/** 通用文本：去空格 + 长度上限。 */
export const text = (max: number, label = "内容") =>
  z.string().trim().max(max, `${label}长度不能超过 ${max} 个字符`);

/** 可为空的外部链接：只允许绝对 http / https URL，避免把脚本协议写入前台 href。 */
export const optionalHttpUrl = (max: number, label = "链接") =>
  z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : value),
    z
      .union([z.literal(""), z.string().max(max, `${label}长度不能超过 ${max} 个字符`)])
      .refine(
        (value) => {
          if (value === "") return true;
          try {
            const url = new URL(value);
            return (url.protocol === "http:" || url.protocol === "https:") && Boolean(url.hostname);
          } catch {
            return false;
          }
        },
        `${label}必须是 http 或 https 地址`,
      ),
  );

/** 必填文本（非空）。 */
export const requiredText = (max: number, label = "内容") =>
  text(max, label).min(1, `${label}不能为空`);

/** 可为空的邮箱（留空表示不展示）。 */
export const optionalEmail = z.union([
  z.literal(""),
  z.string().trim().max(200).email("邮箱格式不正确"),
]);

/** 链接 / CTA。 */
export const linkSchema = z
  .object({
    label: text(120, "按钮文案"),
    href: text(500, "链接"),
    external: z.boolean().optional(),
  })
  .strict();

/** 真假标记：兼容后台开关（boolean）与 site.json 历史值（"yes" / ""）。 */
export const flagSchema = z.union([z.boolean(), z.enum(["yes", "no", ""])]);

/** 字符串数组（用于 marquee / tags / awards / body 等）。 */
export const textList = (maxItems: number, itemMax = 300) =>
  z.array(z.string().max(itemMax, `单项长度不能超过 ${itemMax} 个字符`)).max(maxItems, `最多 ${maxItems} 项`);

/** 指标卡：value + label（+ 可选 unit / suffix）。 */
export const statSchema = z
  .object({
    value: text(60, "数值"),
    label: text(120, "说明"),
    unit: text(20, "单位").optional(),
    suffix: text(20, "后缀").optional(),
  })
  .strict();

/** 指标卡数组（统一上限）。 */
export const statListSchema = z.array(statSchema).max(12, "指标最多 12 项");

/** 标题 + 描述 的简单列表项。 */
export const titledItemSchema = z
  .object({
    title: requiredText(200, "标题"),
    description: text(2000, "描述"),
  })
  .strict();

/** 双语译文覆盖层：中文仍使用文档原字段，英文及补充中文保存于此。 */
export const bilingualTranslationsSchema = z
  .object({
    zh: z.record(z.unknown()).optional(),
    en: z.record(z.unknown()).optional(),
  })
  .strict()
  .optional();

/** 业务主键（slug）：小写字母、数字、连字符。 */
export const slugSchema = z
  .string()
  .trim()
  .min(1, "标识不能为空")
  .max(120, "标识长度不能超过 120 个字符")
  .regex(/^[A-Za-z0-9][A-Za-z0-9_-]*$/, "标识只能包含字母、数字、下划线或连字符");
