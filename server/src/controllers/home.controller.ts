import type { Request, Response } from "express";

import { HomeContent } from "@/models/HomeContent.model";
import { readSingleton, updateSingleton } from "@/services/singleton.service";
import { sendOk } from "@/utils/respond";
import { HOME_SECTIONS, type HomeSection } from "@/validations/home.validation";

const NOT_FOUND = "首页内容尚未初始化，请先执行 npm run seed";

const SECTION_LABELS: Record<HomeSection, string> = {
  hero: "Hero 区",
  media: "媒体资源区",
  flow: "Flow AI 区",
  clients: "客户选择区",
  strength: "公司实力区",
  honors: "企业荣誉区",
};

/** GET /home —— 一次性返回 6 大板块。 */
export async function getHome(_req: Request, res: Response): Promise<void> {
  const data = await readSingleton(HomeContent, NOT_FOUND);
  sendOk(res, data);
}

/** PUT /home/:section —— 更新单个板块，返回更新后的完整首页内容。 */
export function updateHomeSection(
  section: HomeSection,
): (req: Request, res: Response) => Promise<void> {
  return async (req: Request, res: Response): Promise<void> => {
    const data = await updateSingleton(HomeContent, { [section]: req.body });
    sendOk(res, data, { message: `首页「${SECTION_LABELS[section]}」已保存` });
  };
}

export { HOME_SECTIONS };
export type { HomeSection };
