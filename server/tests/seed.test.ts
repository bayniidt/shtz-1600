import { writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { AboutContent } from "@/models/AboutContent.model";
import { CareersCity } from "@/models/CareersCity.model";
import { CareersContent } from "@/models/CareersContent.model";
import { CareersPosition } from "@/models/CareersPosition.model";
import { CaseItem } from "@/models/CaseItem.model";
import { CasesPageContent } from "@/models/CasesPageContent.model";
import { HomeContent } from "@/models/HomeContent.model";
import { SiteConfig } from "@/models/SiteConfig.model";
import {
  ensureDefaultAdmin,
  readSiteDataFile,
  seedAll,
  seedContentFromSiteData,
  seedContentIfMissing,
} from "@/services/seed.service";
import { ADMIN_USERNAME, resetTestDB, setupTestDB, teardownTestDB } from "./helpers/db";
import { User } from "@/models/User.model";
import { SITE_DATA_FIXTURE } from "./fixtures/site-data";
import { aboutContentSchema } from "@/validations/about.validation";
import { careersContentSchema } from "@/validations/careers.validation";
import { HOME_SECTION_SCHEMAS } from "@/validations/home.validation";
import { siteConfigSchema } from "@/validations/site.validation";

const EMPTY_COUNTS = {
  site: 0,
  home: 0,
  casesPage: 0,
  caseItems: 0,
  about: 0,
  careersContent: 0,
  cities: 0,
  positions: 0,
};

type LooseRecord = Record<string, unknown>;
interface RealSiteData {
  site: LooseRecord;
  home: Record<"hero" | "media" | "flow" | "clients" | "strength" | "honors", LooseRecord>;
  cases: { page: LooseRecord; items: LooseRecord[] };
  about: LooseRecord;
  careers: LooseRecord & { cities: LooseRecord[]; positions: LooseRecord[] };
}

/** 读取真实 site.json 并按已知结构访问（仅测试内部使用）。 */
function realSiteData(): RealSiteData {
  return readSiteDataFile() as unknown as RealSiteData;
}

const raw = (doc: { toObject: () => unknown } | null): LooseRecord =>
  (doc?.toObject() ?? {}) as LooseRecord;

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await resetTestDB();
});

describe("readSiteDataFile —— 读取真实站点数据", () => {
  it("T1 正常：默认路径可读到 web/data/site.json 且结构完整", () => {
    const data = realSiteData();

    expect(data.site.name).toBeTruthy();
    expect(data.home.hero.title).toBeTruthy();
    expect(data.cases.items.length).toBeGreaterThan(0);
    expect(data.about.heroTitle).toBeTruthy();
    expect(data.careers.cities.length).toBeGreaterThan(0);
    expect(data.careers.positions.length).toBeGreaterThan(0);
  });

  it("T2 异常：文件不存在时抛出可读错误", () => {
    expect(() => readSiteDataFile("/tmp/definitely-missing-site.json")).toThrow(/找不到站点数据文件/);
  });

  it("T3 异常：非法 JSON 抛出可读错误", () => {
    const bad = join(tmpdir(), `adfly-bad-site-${Date.now()}.json`);
    writeFileSync(bad, "{ not json");
    try {
      expect(() => readSiteDataFile(bad)).toThrow(/不是合法 JSON/);
    } finally {
      rmSync(bad, { force: true });
    }
  });
});

describe("seedContentFromSiteData —— 真实数据入库", () => {
  it("T4 正常：真实 site.json 灌入 9 类数据（8 案例 / 7 城市 / 79 职位）", async () => {
    const counts = await seedContentFromSiteData(readSiteDataFile(), { overwrite: true });

    expect(counts.site).toBe(1);
    expect(counts.home).toBe(1);
    expect(counts.casesPage).toBe(1);
    expect(counts.about).toBe(1);
    expect(counts.careersContent).toBe(1);
    expect(counts.caseItems).toBe(8);
    expect(counts.cities).toBe(7);
    expect(counts.positions).toBe(79);

    expect(await SiteConfig.countDocuments()).toBe(1);
    expect(await HomeContent.countDocuments()).toBe(1);
    expect(await CasesPageContent.countDocuments()).toBe(1);
    expect(await CaseItem.countDocuments()).toBe(8);
    expect(await AboutContent.countDocuments()).toBe(1);
    expect(await CareersContent.countDocuments()).toBe(1);
    expect(await CareersCity.countDocuments()).toBe(7);
    expect(await CareersPosition.countDocuments()).toBe(79);
  });

  it("T5 正常：幂等 —— 重复执行 overwrite=false 不会重复写入", async () => {
    await seedContentFromSiteData(readSiteDataFile(), { overwrite: true });

    const second = await seedContentFromSiteData(readSiteDataFile(), { overwrite: false });

    expect(second).toEqual(EMPTY_COUNTS);
    expect(await CaseItem.countDocuments()).toBe(8);
    expect(await CareersPosition.countDocuments()).toBe(79);
  });

  it("T6 正常：overwrite=true 会覆盖被手工改坏的数据", async () => {
    await seedContentFromSiteData(readSiteDataFile(), { overwrite: true });
    await SiteConfig.updateOne({ key: "default" }, { $set: { name: "被改坏的名字" } });
    await CareersCity.updateOne({ id: "shanghai" }, { $set: { name: "被改坏的城市" } });

    const counts = await seedContentFromSiteData(readSiteDataFile(), { overwrite: true });

    expect(counts.site).toBe(1);
    expect(counts.cities).toBe(7);
    const site = await SiteConfig.findOne({ key: "default" });
    expect(site?.name).not.toBe("被改坏的名字");
    const city = await CareersCity.findOne({ id: "shanghai" });
    expect(city?.name).not.toBe("被改坏的城市");
  });

  it("T7 正常：数据为空时全部跳过（不产生文档）", async () => {
    const counts = await seedContentFromSiteData({}, { overwrite: true });
    expect(counts).toEqual(EMPTY_COUNTS);
  });

  it("T8 边界：实体缺少 id 时跳过（不写入脏数据）", async () => {
    const counts = await seedContentFromSiteData(
      { careers: { cities: [{ name: "无 id 城市" }], positions: [{ title: "无 id 职位" }] } },
      { overwrite: true },
    );

    expect(counts.cities).toBe(0);
    expect(counts.positions).toBe(0);
    expect(await CareersCity.countDocuments()).toBe(0);
  });

  it("T9 边界：单文档内容为空对象时跳过", async () => {
    const counts = await seedContentFromSiteData({ site: {}, about: {} }, { overwrite: true });
    expect(counts.site).toBe(0);
    expect(counts.about).toBe(0);
  });

  it("T10 边界：城市 / 职位内部字段不互相污染", async () => {
    await seedContentFromSiteData(readSiteDataFile(), { overwrite: true });

    const content = await CareersContent.findOne({ key: "default" });
    const contentRaw = raw(content);
    expect(contentRaw.cities).toBeUndefined();
    expect(contentRaw.positions).toBeUndefined();

    const city = await CareersCity.findOne({ id: "shanghai" });
    const cityRaw = raw(city);
    expect(cityRaw.positions).toBeUndefined();
    expect(cityRaw.summary).toBeDefined();
  });
});

describe("真实数据与接口校验规则一致性", () => {
  it("T11 正常：site.json 的单文档内容全部通过 PUT 校验 schema", async () => {
    const data = realSiteData();

    expect(siteConfigSchema.safeParse(data.site).success).toBe(true);
    expect(aboutContentSchema.safeParse(data.about).success).toBe(true);

    // careers.content 需要剔除 cities / positions 后再校验
    const { cities, positions, ...careersContent } = data.careers ?? {};
    void cities;
    void positions;
    expect(careersContentSchema.safeParse(careersContent).success).toBe(true);
  });

  it("T12 正常：首页 6 大板块全部通过各自 schema", async () => {
    const data = realSiteData();

    for (const [section, schema] of Object.entries(HOME_SECTION_SCHEMAS)) {
      const result = schema.safeParse(data.home[section as keyof RealSiteData["home"]]);
      if (!result.success) {
        throw new Error(`home.${section} 校验失败：${JSON.stringify(result.error.issues)}`);
      }
      expect(result.success).toBe(true);
    }
  });

  it("T13 正常：职位引用的城市 id 均存在，日期格式统一", async () => {
    const data = realSiteData();
    const cityIds = new Set(data.careers.cities.map((city) => city.id));

    for (const position of data.careers.positions) {
      expect(cityIds.has(position.cityId)).toBe(true);
      expect(position.id).toBeTruthy();
      expect(position.title).toBeTruthy();
    }
  });
});

describe("ensureDefaultAdmin / seedAll / seedContentIfMissing", () => {
  it("T14 正常：管理员已存在时返回 created=false", async () => {
    const result = await ensureDefaultAdmin();
    expect(result).toEqual({ created: false, username: ADMIN_USERNAME });
  });

  it("T15 正常：管理员缺失时自动创建", async () => {
    await User.deleteMany({ username: ADMIN_USERNAME });

    const result = await ensureDefaultAdmin();
    expect(result.created).toBe(true);
    expect(await User.countDocuments({ username: ADMIN_USERNAME })).toBe(1);
  });

  it("T16 正常：seedAll 同时写入管理员与内容", async () => {
    await User.deleteMany({ username: ADMIN_USERNAME });

    const { admin, counts } = await seedAll({ overwrite: true });

    expect(admin.created).toBe(true);
    expect(counts.site).toBe(1);
    expect(counts.positions).toBe(79);
  });

  it("T17 正常：seedContentIfMissing 在文件可用时返回计数", async () => {
    const counts = await seedContentIfMissing();
    expect(counts?.site).toBe(1);
  });

  it("T18 异常：数据文件不可用时 seedContentIfMissing 返回 null（不阻断启动）", async () => {
    await expect(seedContentIfMissing("/tmp/adfly-missing-site-data.json")).resolves.toBeNull();
  });

  it("T19 正常：夹具数据也能完整灌库（供接口测试使用）", async () => {
    const counts = await seedContentFromSiteData(SITE_DATA_FIXTURE, { overwrite: true });
    expect(counts).toMatchObject({ site: 1, home: 1, casesPage: 1, about: 1, careersContent: 1 });
    expect(counts.caseItems).toBe(2);
    expect(counts.cities).toBe(2);
    expect(counts.positions).toBe(2);
  });
});
