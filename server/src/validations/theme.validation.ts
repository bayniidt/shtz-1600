import { z } from "zod";

const hexColor = z
  .string()
  .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "颜色格式应为 #RRGGBB");

const hexWithDefault = hexColor.optional();

export const themeUpdateSchema = z
  .object({
    brand: z
      .object({
        colorPrimary: hexWithDefault,
        colorPrimaryStrong: hexWithDefault,
        colorPrimarySoft: hexWithDefault,
        colorAccent: hexWithDefault,
      })
      .partial()
      .strict()
      .optional(),
    semantic: z
      .object({
        colorSuccess: hexWithDefault,
        colorWarning: hexWithDefault,
        colorError: hexWithDefault,
        colorInfo: hexWithDefault,
      })
      .partial()
      .strict()
      .optional(),
    layout: z
      .object({
        headerBg: hexWithDefault,
        siderBg: hexWithDefault,
        bodyBg: hexWithDefault,
        headerHeight: z.number().int().min(48).max(96).optional(),
        siderWidth: z.number().int().min(160).max(320).optional(),
      })
      .partial()
      .strict()
      .optional(),
    typography: z
      .object({
        fontFamily: z.string().min(1).max(300).optional(),
        fontSize: z.number().int().min(12).max(20).optional(),
        borderRadius: z.number().int().min(0).max(24).optional(),
      })
      .partial()
      .strict()
      .optional(),
  })
  .strict("存在未知字段");

export type ThemeUpdateInput = z.infer<typeof themeUpdateSchema>;

/** 合并部分主题更新，未提供的字段保持原值。 */
export function mergeTheme<T extends Record<string, Record<string, unknown>>>(
  current: T,
  patch: ThemeUpdateInput,
): T {
  const next = structuredClone(current);
  for (const group of ["brand", "semantic", "layout", "typography"] as const) {
    const incoming = patch[group];
    if (!incoming) continue;
    Object.assign(next[group], incoming);
  }
  return next;
}
