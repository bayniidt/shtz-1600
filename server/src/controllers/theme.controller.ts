import type { Request, Response } from "express";

import { DEFAULT_ADMIN_THEME } from "@/config/theme";
import { ThemeSetting } from "@/models/ThemeSetting.model";
import { mergeTheme, type ThemeUpdateInput } from "@/validations/theme.validation";
import { sendOk } from "@/utils/respond";

const THEME_KEY = "admin";

/** 读取或惰性创建主题配置文档。 */
export async function getOrCreateTheme() {
  const existing = await ThemeSetting.findOne({ key: THEME_KEY });
  if (existing) return existing;
  return ThemeSetting.create({ key: THEME_KEY });
}

/** GET /settings/theme —— 公开接口，后台前端启动时读取主题。 */
export async function getTheme(_req: Request, res: Response): Promise<void> {
  const theme = await getOrCreateTheme();
  sendOk(res, {
    brand: theme.brand,
    semantic: theme.semantic,
    layout: theme.layout,
    typography: theme.typography,
    updatedAt: theme.updatedAt,
  });
}

/** PUT /settings/theme —— 局部更新主题（需登录）。 */
export async function updateTheme(req: Request, res: Response): Promise<void> {
  const theme = await getOrCreateTheme();
  const patch = req.body as ThemeUpdateInput;

  const merged = mergeTheme(
    {
      brand: { ...theme.brand },
      semantic: { ...theme.semantic },
      layout: { ...theme.layout },
      typography: { ...theme.typography },
    },
    patch,
  );

  theme.set(merged);
  await theme.save();

  sendOk(
    res,
    {
      brand: theme.brand,
      semantic: theme.semantic,
      layout: theme.layout,
      typography: theme.typography,
      updatedAt: theme.updatedAt,
    },
    { message: "主题已更新" },
  );
}

/** POST /settings/theme/reset —— 恢复默认主题（需登录）。 */
export async function resetTheme(_req: Request, res: Response): Promise<void> {
  const theme = await getOrCreateTheme();
  theme.set(structuredClone(DEFAULT_ADMIN_THEME));
  await theme.save();

  sendOk(res, theme, { message: "已恢复默认主题" });
}
