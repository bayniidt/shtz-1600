import type { Request, Response } from "express";

import { AboutContent } from "@/models/AboutContent.model";
import { readSingleton, updateSingleton } from "@/services/singleton.service";
import { sendOk } from "@/utils/respond";

const NOT_FOUND = "关于我们内容尚未初始化，请先执行 npm run seed";

/** GET /about */
export async function getAbout(_req: Request, res: Response): Promise<void> {
  const data = await readSingleton(AboutContent, NOT_FOUND);
  sendOk(res, data);
}

/** PUT /about */
export async function updateAbout(req: Request, res: Response): Promise<void> {
  const data = await updateSingleton(AboutContent, req.body as Record<string, unknown>);
  sendOk(res, data, { message: "关于我们已保存" });
}
