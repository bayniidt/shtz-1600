import type { Request, Response } from "express";
import type { FilterQuery } from "mongoose";

import { CaseItem, type CaseItemDoc } from "@/models/CaseItem.model";
import { CasesPageContent } from "@/models/CasesPageContent.model";
import { isTruthyFlag } from "@/models/schemas/common.schema";
import { readSingleton, updateSingleton } from "@/services/singleton.service";
import { ApiError } from "@/utils/ApiError";
import { sendCreated, sendOk } from "@/utils/respond";
import type { CaseItemInput, CaseListQueryInput } from "@/validations/cases.validation";

const PAGE_NOT_FOUND = "案例列表页文案尚未初始化，请先执行 npm run seed";
const CASE_NOT_FOUND = "案例不存在";

/** 关键词模糊匹配用的正则（转义特殊字符，避免 ReDoS / 语法错误）。 */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** 把请求体归一化成可直接写库的字段（三态 featured → boolean）。 */
function normalizeCase(body: CaseItemInput): Record<string, unknown> {
  return { ...body, featured: isTruthyFlag(body.featured) };
}

/** GET /cases/page */
export async function getCasesPage(_req: Request, res: Response): Promise<void> {
  const data = await readSingleton(CasesPageContent, PAGE_NOT_FOUND);
  sendOk(res, data);
}

/** PUT /cases/page */
export async function updateCasesPage(req: Request, res: Response): Promise<void> {
  const data = await updateSingleton(CasesPageContent, req.body as Record<string, unknown>);
  sendOk(res, data, { message: "案例列表页文案已保存" });
}

/** GET /cases —— 分页 / 行业筛选 / 置顶筛选 / 关键词搜索。 */
export async function listCases(req: Request, res: Response): Promise<void> {
  const { industry, featured, keyword, page = 1, pageSize = 10 } = req.query as unknown as CaseListQueryInput;

  const filter: FilterQuery<CaseItemDoc> = {};
  if (industry && industry !== "all") filter.industry = industry;
  if (featured === "true") filter.featured = true;
  else if (featured === "false") filter.featured = false;
  if (keyword) {
    const regex = new RegExp(escapeRegExp(keyword), "i");
    filter.$or = [{ title: regex }, { client: regex }, { summary: regex }];
  }

  const [items, total] = await Promise.all([
    CaseItem.find(filter)
      .sort({ featured: -1, updatedAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize),
    CaseItem.countDocuments(filter),
  ]);

  sendOk(res, {
    items: items.map((item) => item.toJSON()),
    total,
    page,
    pageSize,
  });
}

/** GET /cases/:id */
export async function getCase(req: Request, res: Response): Promise<void> {
  const doc = await CaseItem.findOne({ id: req.params.id });
  if (!doc) throw ApiError.notFound(CASE_NOT_FOUND);
  sendOk(res, doc.toJSON());
}

/** POST /cases */
export async function createCase(req: Request, res: Response): Promise<void> {
  const body = req.body as CaseItemInput;
  const exists = await CaseItem.exists({ id: body.id });
  if (exists) throw ApiError.conflict(`案例 id「${body.id}」已存在`);

  const doc = await CaseItem.create(normalizeCase(body));
  sendCreated(res, doc.toJSON(), "案例已创建");
}

/** PUT /cases/:id —— `id` 为业务主键，创建后不可修改。 */
export async function updateCase(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const body = req.body as CaseItemInput;
  if (body.id !== id) {
    throw ApiError.badRequest("案例 id 不可修改", [{ path: "id", message: "id 不可修改" }]);
  }

  const doc = await CaseItem.findOneAndUpdate(
    { id },
    { $set: normalizeCase(body) },
    { new: true, runValidators: true },
  );
  if (!doc) throw ApiError.notFound(CASE_NOT_FOUND);
  sendOk(res, doc.toJSON(), { message: "案例已保存" });
}

/** DELETE /cases/:id */
export async function deleteCase(req: Request, res: Response): Promise<void> {
  const doc = await CaseItem.findOneAndDelete({ id: req.params.id });
  if (!doc) throw ApiError.notFound(CASE_NOT_FOUND);
  sendOk(res, { id: doc.id, success: true }, { message: "案例已删除" });
}

/** POST /cases/:id/featured —— 切换首页置顶。 */
export async function toggleCaseFeatured(req: Request, res: Response): Promise<void> {
  const featured = isTruthyFlag((req.body as { featured?: unknown }).featured);
  const doc = await CaseItem.findOneAndUpdate(
    { id: req.params.id },
    { $set: { featured } },
    { new: true },
  );
  if (!doc) throw ApiError.notFound(CASE_NOT_FOUND);
  sendOk(res, doc.toJSON(), { message: featured ? "已置顶" : "已取消置顶" });
}
