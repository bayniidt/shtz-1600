import { AboutContent } from "@/models/AboutContent.model";
import { CareersCity } from "@/models/CareersCity.model";
import { CareersContent } from "@/models/CareersContent.model";
import { CareersPosition } from "@/models/CareersPosition.model";
import { CaseItem } from "@/models/CaseItem.model";
import { CasesPageContent } from "@/models/CasesPageContent.model";
import { HomeContent } from "@/models/HomeContent.model";
import { SiteConfig } from "@/models/SiteConfig.model";
import {
  SINGLETON_KEY,
  entitySchemaOptions,
  isTruthyFlag,
  singletonSchemaOptions,
  stripEntityFields,
  stripSingletonFields,
} from "@/models/schemas/common.schema";
import { resetTestDB, setupTestDB, teardownTestDB } from "./helpers/db";
import { seedFixtureContent } from "./helpers/db";

type IndexableModel = {
  schema: { indexes: () => [Record<string, unknown>, Record<string, unknown>?][] };
};

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await resetTestDB();
});

describe("isTruthyFlag —— 真假标记归一化（Stage 5 前台共用）", () => {
  it("T1 正常：true / \"yes\" / \"true\" / \"1\" 判定为真", () => {
    expect(isTruthyFlag(true)).toBe(true);
    expect(isTruthyFlag("yes")).toBe(true);
    expect(isTruthyFlag("YES")).toBe(true);
    expect(isTruthyFlag(" yes ")).toBe(true);
    expect(isTruthyFlag("true")).toBe(true);
    expect(isTruthyFlag("1")).toBe(true);
  });

  it("T2 边界：false / 空串 / 其他值判定为假", () => {
    for (const value of [false, "", "   ", "no", "0", null, undefined, 1, {}, []]) {
      expect(isTruthyFlag(value)).toBe(false);
    }
  });
});

describe("toJSON transform —— 隐藏内部字段", () => {
  it("T3 正常：单文档保留业务字段与 updatedAt，剔除 _id/__v/key/createdAt", () => {
    const target = stripSingletonFields(null, {
      _id: "1",
      __v: 0,
      key: SINGLETON_KEY,
      createdAt: "a",
      updatedAt: "b",
      name: "ADFLY",
    });
    expect(target).toEqual({ updatedAt: "b", name: "ADFLY" });
  });

  it("T4 正常：实体保留业务 id 与时间戳，仅剔除 _id/__v", () => {
    const target = stripEntityFields(null, {
      _id: "1",
      __v: 0,
      id: "case-001",
      createdAt: "a",
      updatedAt: "b",
    });
    expect(target).toEqual({ id: "case-001", createdAt: "a", updatedAt: "b" });
  });

  it("T5 正常：Schema 选项包含 timestamps / 关闭 versionKey 与 minimize", () => {
    for (const options of [singletonSchemaOptions(), entitySchemaOptions()]) {
      expect(options.timestamps).toBe(true);
      expect(options.versionKey).toBe(false);
      expect(options.minimize).toBe(false);
      expect(options.toJSON?.transform).toBeDefined();
    }
  });

  it("T6 正常：真实文档 toJSON 后不含内部字段", async () => {
    await seedFixtureContent();
    const site = await SiteConfig.findOne({ key: SINGLETON_KEY });
    const json = site!.toJSON() as Record<string, unknown>;
    expect(json.name).toBeTruthy();
    expect(json.updatedAt).toBeDefined();
    expect(json._id).toBeUndefined();
    expect(json.key).toBeUndefined();

    const city = await CareersCity.findOne({ id: "shanghai" });
    const cityJson = city!.toJSON() as Record<string, unknown>;
    expect(cityJson.id).toBe("shanghai");
    expect(cityJson._id).toBeUndefined();
    expect(cityJson.__v).toBeUndefined();
  });
});

describe("集合与索引定义", () => {
  it("T7 正常：8 个内容集合名与集合注册名一致", () => {
    const names = [
      SiteConfig.collection.name,
      HomeContent.collection.name,
      CasesPageContent.collection.name,
      CaseItem.collection.name,
      AboutContent.collection.name,
      CareersCity.collection.name,
      CareersPosition.collection.name,
      CareersContent.collection.name,
    ];
    expect(names).toEqual([
      "site_configs",
      "home_contents",
      "cases_page_contents",
      "case_items",
      "about_contents",
      "careers_cities",
      "careers_positions",
      "careers_contents",
    ]);
  });

  it("T8 正常：单文档集合存在 key 唯一索引，实体集合存在业务 id 唯一索引", () => {
    const hasUnique = (model: IndexableModel, field: string) =>
      model.schema
        .indexes()
        .some(([fields, options]) => fields[field] === 1 && options?.unique === true);

    for (const model of [SiteConfig, HomeContent, CasesPageContent, AboutContent, CareersContent]) {
      expect(hasUnique(model, "key")).toBe(true);
    }
    for (const model of [CaseItem, CareersCity, CareersPosition]) {
      expect(hasUnique(model, "id")).toBe(true);
    }
  });

  it("T9 正常：列表查询所需索引已建立", () => {
    const indexes = (model: IndexableModel) =>
      model.schema.indexes().map(([fields]) => Object.keys(fields).join(","));

    expect(indexes(CaseItem)).toEqual(
      expect.arrayContaining(["industry", "featured,updatedAt"]),
    );
    expect(indexes(CareersPosition)).toEqual(
      expect.arrayContaining(["cityId", "hot,publishedAt"]),
    );
  });

  it("T10 正常：集合字段默认值可用于「空文档」场景", async () => {
    const empty = await HomeContent.create({ key: SINGLETON_KEY });
    const json = empty.toJSON() as Record<string, unknown>;

    expect(json.hero).toBeDefined();
    expect(json.media).toBeDefined();
    expect(json.honors).toBeDefined();
  });
});
