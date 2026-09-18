import type { Request, Response } from "express";

import { CareersContent } from "@/models/CareersContent.model";
import { readSingleton, updateSingleton } from "@/services/singleton.service";
import { sendOk } from "@/utils/respond";

const NOT_FOUND = "招聘页面文案尚未初始化，请先执行 npm run seed";

/** GET /careers/content */
export async function getCareersContent(_req: Request, res: Response): Promise<void> {
  const data = await readSingleton(CareersContent, NOT_FOUND);
  sendOk(res, data);
}

/** PUT /careers/content */
export async function updateCareersContent(req: Request, res: Response): Promise<void> {
  const data = await updateSingleton(CareersContent, req.body as Record<string, unknown>);
  sendOk(res, data, { message: "招聘页面文案已保存" });
}
