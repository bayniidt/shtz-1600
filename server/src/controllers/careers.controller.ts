import type { Request, Response } from "express";
import type { FilterQuery } from "mongoose";

import { CareersCity, type CareersCityDoc } from "@/models/CareersCity.model";
import { CareersContent } from "@/models/CareersContent.model";
import { CareersPosition, type CareersPositionDoc } from "@/models/CareersPosition.model";
import { isTruthyFlag } from "@/models/schemas/common.schema";
import { readSingleton, updateSingleton } from "@/services/singleton.service";
import { ApiError } from "@/utils/ApiError";
import { sendCreated, sendOk } from "@/utils/respond";
import type {
  CareersCityDeleteInput,
  CareersCityInput,
  CareersCityListQueryInput,
  CareersPositionInput,
  CareersPositionListQueryInput,
} from "@/validations/careers.validation";

const CONTENT_NOT_FOUND = "招聘页面文案尚未初始化，请先执行 npm run seed";
const CITY_NOT_FOUND = "招聘城市不存在";
const POSITION_NOT_FOUND = "招聘职位不存在";

const TRUTHY_FLAG_VALUES = [true, "yes", "true", "1"];
const FALSY_FLAG_VALUES = [false, "", "no", "false", "0"];

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function idTokens(value: string): string[] {
  return value
    .split(/[\/,\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeExtraCities(value: string, allowedIds: Set<string>, replaceId?: { from: string; to: string }): string {
  const ids = idTokens(value).map((id) => (replaceId?.from === id ? replaceId.to : id));
  return [...new Set(ids)].filter((id) => allowedIds.has(id)).join("/");
}

function withoutPrimaryCity(value: string, primaryCityId: string): string {
  return idTokens(value).filter((id) => id !== primaryCityId).join("/");
}

function cityTokenRegex(id: string): RegExp {
  return new RegExp(`(^|[/,\\n])${escapeRegExp(id)}([/,\\n]|$)`, "i");
}

function normalizeCity(body: CareersCityInput): Record<string, unknown> {
  return { ...body, featured: isTruthyFlag(body.featured) };
}

async function assertCityExists(cityId: string): Promise<void> {
  if (!(await CareersCity.exists({ id: cityId }))) {
    throw ApiError.badRequest("职位所属城市不存在", [{ path: "cityId", message: `城市「${cityId}」不存在` }]);
  }
}

async function normalizePosition(body: CareersPositionInput): Promise<Record<string, unknown>> {
  await assertCityExists(body.cityId);
  const cities = await CareersCity.find({}, { id: 1 }).lean();
  const allowedIds = new Set(cities.map((city) => city.id));
  return {
    ...body,
    extraCities: withoutPrimaryCity(normalizeExtraCities(body.extraCities, allowedIds), body.cityId),
    urgent: isTruthyFlag(body.urgent),
    hot: isTruthyFlag(body.hot),
  };
}

function cityFilter(keyword?: string, featured?: string): FilterQuery<CareersCityDoc> {
  const filter: FilterQuery<CareersCityDoc> = {};
  if (keyword) {
    const regex = new RegExp(escapeRegExp(keyword), "i");
    filter.$or = [{ id: regex }, { name: regex }, { nameEn: regex }, { code: regex }, { summary: regex }];
  }
  if (featured === "true") filter.featured = { $in: TRUTHY_FLAG_VALUES };
  if (featured === "false") filter.featured = { $in: FALSY_FLAG_VALUES };
  return filter;
}

function positionFilter(query: CareersPositionListQueryInput): FilterQuery<CareersPositionDoc> {
  const filter: FilterQuery<CareersPositionDoc> = {};
  if (query.cityId) {
    filter.$or = [{ cityId: query.cityId }, { extraCities: cityTokenRegex(query.cityId) }];
  }
  if (query.keyword) {
    const regex = new RegExp(escapeRegExp(query.keyword), "i");
    filter.$and = [{ $or: [{ id: regex }, { title: regex }, { summary: regex }, { department: regex }, { tags: regex }] }];
  }
  if (query.hot === "true") filter.hot = { $in: TRUTHY_FLAG_VALUES };
  if (query.hot === "false") filter.hot = { $in: FALSY_FLAG_VALUES };
  if (query.urgent === "true") filter.urgent = { $in: TRUTHY_FLAG_VALUES };
  if (query.urgent === "false") filter.urgent = { $in: FALSY_FLAG_VALUES };
  return filter;
}

/** GET /careers/content */
export async function getCareersContent(_req: Request, res: Response): Promise<void> {
  const data = await readSingleton(CareersContent, CONTENT_NOT_FOUND);
  sendOk(res, data);
}

/** PUT /careers/content */
export async function updateCareersContent(req: Request, res: Response): Promise<void> {
  const data = await updateSingleton(CareersContent, req.body as Record<string, unknown>);
  sendOk(res, data, { message: "招聘页面文案已保存" });
}

/** GET /careers/cities */
export async function listCareersCities(req: Request, res: Response): Promise<void> {
  const { keyword, featured, page = 1, pageSize = 20 } = req.query as unknown as CareersCityListQueryInput;
  const filter = cityFilter(keyword, featured);
  const [cities, total] = await Promise.all([
    CareersCity.find(filter).sort({ featured: -1, name: 1 }).skip((page - 1) * pageSize).limit(pageSize),
    CareersCity.countDocuments(filter),
  ]);
  const items = await Promise.all(
    cities.map(async (city) => {
      const positionsCount = await CareersPosition.countDocuments({
        $or: [{ cityId: city.id }, { extraCities: cityTokenRegex(city.id) }],
      });
      return { ...city.toJSON(), positionsCount };
    }),
  );
  sendOk(res, { items, total, page, pageSize });
}

/** POST /careers/cities */
export async function createCareersCity(req: Request, res: Response): Promise<void> {
  const body = req.body as CareersCityInput;
  if (await CareersCity.exists({ id: body.id })) throw ApiError.conflict(`城市 id「${body.id}」已存在`);
  const doc = await CareersCity.create(normalizeCity(body));
  sendCreated(res, { ...doc.toJSON(), positionsCount: 0 }, "招聘城市已创建");
}

/** GET /careers/cities/:id */
export async function getCareersCity(req: Request, res: Response): Promise<void> {
  const city = await CareersCity.findOne({ id: req.params.id });
  if (!city) throw ApiError.notFound(CITY_NOT_FOUND);
  const positions = await CareersPosition.find({
    $or: [{ cityId: city.id }, { extraCities: cityTokenRegex(city.id) }],
  }).sort({ hot: -1, urgent: -1, publishedAt: -1, updatedAt: -1 });
  sendOk(res, { ...city.toJSON(), positionsCount: positions.length, positions: positions.map((item) => item.toJSON()) });
}

/** PUT /careers/cities/:id —— 修改 id 时同步职位主城市与附加城市。 */
export async function updateCareersCity(req: Request, res: Response): Promise<void> {
  const oldId = req.params.id;
  const body = req.body as CareersCityInput;
  const city = await CareersCity.findOne({ id: oldId });
  if (!city) throw ApiError.notFound(CITY_NOT_FOUND);
  if (body.id !== oldId && (await CareersCity.exists({ id: body.id }))) {
    throw ApiError.conflict(`城市 id「${body.id}」已存在`);
  }

  const allowedIds = new Set((await CareersCity.find({}, { id: 1 }).lean()).map((item) => item.id));
  allowedIds.delete(oldId);
  allowedIds.add(body.id);
  const positions = await CareersPosition.find({
    $or: [{ cityId: oldId }, { extraCities: cityTokenRegex(oldId) }],
  });

  city.set(normalizeCity(body));
  await city.save();
  await Promise.all(
    positions.map(async (position) => {
      if (position.cityId === oldId) position.cityId = body.id;
      position.extraCities = withoutPrimaryCity(
        normalizeExtraCities(position.extraCities, allowedIds, { from: oldId, to: body.id }),
        position.cityId,
      );
      await position.save();
    }),
  );

  const updated = await CareersCity.findOne({ id: body.id });
  sendOk(res, { ...updated!.toJSON(), positionsCount: positions.length }, { message: "招聘城市已保存" });
}

/** DELETE /careers/cities/:id —— 有职位时将主归属回退到指定或自动选择的城市。 */
export async function deleteCareersCity(req: Request, res: Response): Promise<void> {
  const city = await CareersCity.findOne({ id: req.params.id });
  if (!city) throw ApiError.notFound(CITY_NOT_FOUND);
  const body = (req.body ?? {}) as CareersCityDeleteInput;
  const otherCities = await CareersCity.find({ id: { $ne: city.id } }).sort({ id: 1 });
  const fallback = body.fallbackCityId
    ? otherCities.find((item) => item.id === body.fallbackCityId)
    : otherCities[0];
  if (body.fallbackCityId && !fallback) {
    throw ApiError.badRequest("职位回退城市不存在", [
      { path: "fallbackCityId", message: `城市「${body.fallbackCityId}」不存在或不能作为回退城市` },
    ]);
  }

  const positions = await CareersPosition.find({
    $or: [{ cityId: city.id }, { extraCities: cityTokenRegex(city.id) }],
  });
  const allowedIds = new Set(otherCities.map((item) => item.id));
  await Promise.all(
    positions.map(async (position) => {
      if (position.cityId === city.id) position.cityId = fallback?.id ?? "";
      position.extraCities = withoutPrimaryCity(normalizeExtraCities(position.extraCities, allowedIds), position.cityId);
      await position.save();
    }),
  );
  await city.deleteOne();
  sendOk(
    res,
    { id: city.id, success: true, fallbackCityId: fallback?.id ?? null, reassignedPositions: positions.length },
    { message: "招聘城市已删除" },
  );
}

/** GET /careers/positions */
export async function listCareersPositions(req: Request, res: Response): Promise<void> {
  const query = req.query as unknown as CareersPositionListQueryInput;
  const { page = 1, pageSize = 20 } = query;
  const filter = positionFilter(query);
  const [positions, total] = await Promise.all([
    CareersPosition.find(filter)
      .sort({ hot: -1, urgent: -1, publishedAt: -1, updatedAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize),
    CareersPosition.countDocuments(filter),
  ]);
  sendOk(res, { items: positions.map((position) => position.toJSON()), total, page, pageSize });
}

/** POST /careers/positions */
export async function createCareersPosition(req: Request, res: Response): Promise<void> {
  const body = req.body as CareersPositionInput;
  if (await CareersPosition.exists({ id: body.id })) throw ApiError.conflict(`职位 id「${body.id}」已存在`);
  const doc = await CareersPosition.create(await normalizePosition(body));
  sendCreated(res, doc.toJSON(), "招聘职位已创建");
}

/** GET /careers/positions/:id */
export async function getCareersPosition(req: Request, res: Response): Promise<void> {
  const doc = await CareersPosition.findOne({ id: req.params.id });
  if (!doc) throw ApiError.notFound(POSITION_NOT_FOUND);
  sendOk(res, doc.toJSON());
}

/** PUT /careers/positions/:id */
export async function updateCareersPosition(req: Request, res: Response): Promise<void> {
  const id = req.params.id;
  const body = req.body as CareersPositionInput;
  if (body.id !== id) throw ApiError.badRequest("招聘职位 id 不可修改", [{ path: "id", message: "id 不可修改" }]);
  const doc = await CareersPosition.findOne({ id });
  if (!doc) throw ApiError.notFound(POSITION_NOT_FOUND);
  doc.set(await normalizePosition(body));
  await doc.save();
  sendOk(res, doc.toJSON(), { message: "招聘职位已保存" });
}

/** DELETE /careers/positions/:id */
export async function deleteCareersPosition(req: Request, res: Response): Promise<void> {
  const doc = await CareersPosition.findOneAndDelete({ id: req.params.id });
  if (!doc) throw ApiError.notFound(POSITION_NOT_FOUND);
  sendOk(res, { id: doc.id, success: true }, { message: "招聘职位已删除" });
}
