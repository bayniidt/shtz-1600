import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import type { Model } from "mongoose";

import { config } from "@/config";
import { AboutContent } from "@/models/AboutContent.model";
import { CareersCity } from "@/models/CareersCity.model";
import { CareersContent } from "@/models/CareersContent.model";
import { CareersPosition } from "@/models/CareersPosition.model";
import { CaseItem } from "@/models/CaseItem.model";
import { CasesPageContent } from "@/models/CasesPageContent.model";
import { HomeContent } from "@/models/HomeContent.model";
import { SINGLETON_KEY } from "@/models/schemas/common.schema";
import { SiteConfig } from "@/models/SiteConfig.model";
import { User, hashPassword } from "@/models/User.model";
import type { SeedContentCounts, SiteDataInput } from "@/types/site-data";

export interface SeedResult {
  created: boolean;
  username: string;
}

export interface SeedContentOptions {
  /** true = 用 site.json 覆盖已有内容；false = 只补写缺失的文档（默认） */
  overwrite?: boolean;
}

/**
 * 首次启动（或 seed 时）确保默认管理员存在。
 * 生产环境优先通过 ADMIN_USERNAME / ADMIN_PASSWORD_HASH 注入管理员凭据；
 * 未提供 hash 时才回退到 ADMIN_PASSWORD（仅建议开发环境使用）。
 */
export async function ensureDefaultAdmin(): Promise<SeedResult> {
  const username = config.adminUsername;
  const existing = await User.findOne({ username });
  if (existing) return { created: false, username };

  const passwordHash = config.adminPasswordHash || (await hashPassword(config.adminPassword));
  await User.create({ username, passwordHash, role: "admin" });
  return { created: true, username };
}

/** 只挑出声明过的顶层字段，其余交给 Mongoose strict 模式裁剪。 */
function pick(source: unknown, keys: readonly string[]): Record<string, unknown> {
  const target: Record<string, unknown> = {};
  if (!source || typeof source !== "object" || Array.isArray(source)) return target;
  const record = source as Record<string, unknown>;
  for (const key of keys) {
    if (record[key] !== undefined) target[key] = record[key];
  }
  return target;
}

const SITE_KEYS = [
  "name",
  "nameEn",
  "logoText",
  "logoSub",
  "nav",
  "contactEmail",
  "businessEmail",
  "phone",
  "address",
  "icp",
  "seo",
  "footerLinks",
] as const;

const HOME_KEYS = ["hero", "media", "flow", "clients", "strength", "honors"] as const;

const ABOUT_KEYS = [
  "heroEyebrow",
  "heroTitle",
  "heroDescription",
  "stats",
  "visionTitle",
  "visionText",
  "values",
  "timeline",
  "team",
  "teamIntro",
  "offices",
] as const;

const CASES_PAGE_KEYS = ["title", "subtitle", "filters"] as const;

const CASE_ITEM_KEYS = [
  "id",
  "title",
  "client",
  "industry",
  "region",
  "summary",
  "cover",
  "awards",
  "tags",
  "year",
  "featured",
  "stats",
  "blocks",
] as const;

const CAREERS_CONTENT_KEYS = [
  "heroTitle",
  "heroSubtitle",
  "heroDescription",
  "citiesEyebrow",
  "citiesTitle",
  "citiesDescription",
  "cultureTitle",
  "culture",
  "benefitsTitle",
  "benefits",
  "jobsEyebrow",
  "jobsTitle",
  "portalUrl",
  "applyEmail",
] as const;

const CITY_KEYS = ["id", "name", "nameEn", "code", "summary", "featured"] as const;

const POSITION_KEYS = [
  "id",
  "title",
  "cityId",
  "extraCities",
  "type",
  "department",
  "tags",
  "urgent",
  "hot",
  "publishedAt",
  "summary",
  "description",
  "requirement",
  "bonus",
  "applyUrl",
] as const;

/** 单文档写入：不存在则创建；`overwrite=true` 时整体覆盖，否则跳过已有文档。 */
async function writeSingleton(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: Model<any>,
  data: Record<string, unknown>,
  overwrite: boolean,
): Promise<number> {
  if (Object.keys(data).length === 0) return 0;
  const filter = { key: SINGLETON_KEY };
  const existing = await model.exists(filter);
  if (existing) {
    if (!overwrite) return 0;
    await model.updateOne(filter, { $set: data });
    return 1;
  }
  await model.create({ ...data, key: SINGLETON_KEY });
  return 1;
}

/** 实体写入：按业务 `id` upsert，`overwrite=false` 时跳过已有文档。 */
async function writeEntity(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: Model<any>,
  data: Record<string, unknown>,
  overwrite: boolean,
): Promise<number> {
  const id = data.id;
  if (typeof id !== "string" || id.length === 0) return 0;
  const existing = await model.exists({ id });
  if (existing) {
    if (!overwrite) return 0;
    await model.updateOne({ id }, { $set: data });
    return 1;
  }
  await model.create(data);
  return 1;
}

/**
 * 把一份 `SiteData`（即 data/site.json 的内容）分拆写入各集合。
 * 幂等：重复执行不会产生重复文档。
 */
export async function seedContentFromSiteData(
  data: SiteDataInput,
  options: SeedContentOptions = {},
): Promise<SeedContentCounts> {
  const overwrite = options.overwrite ?? false;
  const counts: SeedContentCounts = {
    site: 0,
    home: 0,
    casesPage: 0,
    caseItems: 0,
    about: 0,
    careersContent: 0,
    cities: 0,
    positions: 0,
  };

  counts.site = await writeSingleton(SiteConfig, pick(data.site, SITE_KEYS), overwrite);
  counts.home = await writeSingleton(HomeContent, pick(data.home, HOME_KEYS), overwrite);
  counts.casesPage = await writeSingleton(
    CasesPageContent,
    pick(data.cases?.page, CASES_PAGE_KEYS),
    overwrite,
  );
  counts.about = await writeSingleton(AboutContent, pick(data.about, ABOUT_KEYS), overwrite);
  counts.careersContent = await writeSingleton(
    CareersContent,
    pick(data.careers, CAREERS_CONTENT_KEYS),
    overwrite,
  );

  for (const item of data.cases?.items ?? []) {
    counts.caseItems += await writeEntity(CaseItem, pick(item, CASE_ITEM_KEYS), overwrite);
  }
  for (const city of data.careers?.cities ?? []) {
    counts.cities += await writeEntity(CareersCity, pick(city, CITY_KEYS), overwrite);
  }
  for (const position of data.careers?.positions ?? []) {
    counts.positions += await writeEntity(CareersPosition, pick(position, POSITION_KEYS), overwrite);
  }

  return counts;
}

/** 读取 `data/site.json`（路径可用 SITE_DATA_FILE 覆盖）。 */
export function readSiteDataFile(file: string = config.siteDataFile): SiteDataInput {
  const absolute = resolve(file);
  let raw: string;
  try {
    raw = readFileSync(absolute, "utf8");
  } catch {
    throw new Error(`找不到站点数据文件：${absolute}（可用 SITE_DATA_FILE 指定）`);
  }
  try {
    return JSON.parse(raw) as SiteDataInput;
  } catch (error) {
    throw new Error(`站点数据文件不是合法 JSON：${absolute}（${(error as Error).message}）`);
  }
}

/** 完整 seed：管理员 + 内容（site/home/cases/about/careers）。 */
export async function seedAll(
  options: SeedContentOptions = {},
): Promise<{ admin: SeedResult; counts: SeedContentCounts }> {
  const admin = await ensureDefaultAdmin();
  const counts = await seedContentFromSiteData(readSiteDataFile(), options);
  return { admin, counts };
}

/**
 * 启动时调用：仅补写缺失的内容（不覆盖已有数据）。
 * site.json 不存在时返回 null，不阻断服务启动。
 */
export async function seedContentIfMissing(
  file?: string,
): Promise<SeedContentCounts | null> {
  try {
    return await seedContentFromSiteData(readSiteDataFile(file), { overwrite: false });
  } catch {
    return null;
  }
}
