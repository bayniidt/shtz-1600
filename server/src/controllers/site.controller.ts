import type { Request, Response } from "express";

import { SiteConfig } from "@/models/SiteConfig.model";
import { readSingleton, updateSingleton } from "@/services/singleton.service";
import { sendOk } from "@/utils/respond";

const NOT_FOUND = "站点配置尚未初始化，请先执行 npm run seed";

/** GET /site */
export async function getSite(_req: Request, res: Response): Promise<void> {
  const data = await readSingleton(SiteConfig, NOT_FOUND);
  sendOk(res, data);
}

/** PUT /site */
export async function updateSite(req: Request, res: Response): Promise<void> {
  const data = await updateSingleton(SiteConfig, req.body as Record<string, unknown>);
  sendOk(res, data, { message: "站点配置已保存" });
}
