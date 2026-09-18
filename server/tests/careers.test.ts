import type { Express } from "express";
import request from "supertest";

import { createApp } from "@/app";
import { CareersCity } from "@/models/CareersCity.model";
import { CareersContent } from "@/models/CareersContent.model";
import { CareersPosition } from "@/models/CareersPosition.model";
import { CAREERS_FIXTURE, CITIES_FIXTURE, POSITIONS_FIXTURE } from "./fixtures/site-data";
import { bearer, loginAsAdmin, resetTestDB, seedFixtureContent, setupTestDB, teardownTestDB } from "./helpers/db";

const CONTENT = "/api/v1/careers/content";

let app: Express;
let token: string;

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await resetTestDB();
  app = createApp();
  token = await loginAsAdmin(app);
});

describe("GET /careers/content —— 读取招聘页面文案", () => {
  it("T1 正常：返回文案且不包含城市 / 职位数据", async () => {
    await seedFixtureContent();
    const res = await request(app).get(CONTENT);

    expect(res.status).toBe(200);
    expect(res.body.data.heroTitle).toBe(CAREERS_FIXTURE.heroTitle);
    expect(res.body.data.benefits).toHaveLength(2);
    expect(res.body.data.benefits[1].items).toContain("/");
    expect(res.body.data.cities).toBeUndefined();
    expect(res.body.data.positions).toBeUndefined();
    expect(res.body.data._id).toBeUndefined();
  });

  it("T2 异常：未初始化返回 404 / 4040", async () => {
    const res = await request(app).get(CONTENT);
    expect(res.status).toBe(404);
    expect(res.body.code).toBe(4040);
  });
});

describe("PUT /careers/content —— 更新招聘页面文案", () => {
  it("T3 正常：整体保存并可在 GET 中读到", async () => {
    await seedFixtureContent();
    const res = await request(app)
      .put(CONTENT)
      .set(bearer(token))
      .send({ ...CAREERS_FIXTURE, heroTitle: "加入我们" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("招聘页面文案已保存");

    const after = await request(app).get(CONTENT);
    expect(after.body.data.heroTitle).toBe("加入我们");
  });

  it("T4 正常：GET → PUT 回写（幂等）", async () => {
    await seedFixtureContent();
    const before = await request(app).get(CONTENT);

    const res = await request(app).put(CONTENT).set(bearer(token)).send(before.body.data);

    expect(res.status).toBe(200);
    expect(res.body.data.benefits).toEqual(before.body.data.benefits);
  });

  it("T5 正常：更新文案不影响城市 / 职位集合", async () => {
    await seedFixtureContent();
    const cityCount = await CareersCity.countDocuments();
    const positionCount = await CareersPosition.countDocuments();

    await request(app)
      .put(CONTENT)
      .set(bearer(token))
      .send({ ...CAREERS_FIXTURE, jobsTitle: "在招职位" });

    expect(await CareersCity.countDocuments()).toBe(cityCount);
    expect(await CareersPosition.countDocuments()).toBe(positionCount);
  });

  it("T6 正常：未初始化时 PUT 自动创建", async () => {
    const res = await request(app).put(CONTENT).set(bearer(token)).send(CAREERS_FIXTURE);
    expect(res.status).toBe(200);
    expect(await CareersContent.countDocuments()).toBe(1);
  });

  it("T7 异常：未登录返回 401 / 4010", async () => {
    const res = await request(app).put(CONTENT).send(CAREERS_FIXTURE);
    expect(res.status).toBe(401);
    expect(res.body.code).toBe(4010);
  });

  it("T8 异常：缺少必填字段返回 400", async () => {
    const { jobsTitle, ...rest } = CAREERS_FIXTURE;
    void jobsTitle;
    const res = await request(app).put(CONTENT).set(bearer(token)).send(rest);

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: "jobsTitle" })]),
    );
  });

  it("T9 异常：招聘邮箱非法返回 400", async () => {
    const res = await request(app)
      .put(CONTENT)
      .set(bearer(token))
      .send({ ...CAREERS_FIXTURE, applyEmail: "hr#" });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "applyEmail", message: "邮箱格式不正确" }),
      ]),
    );
  });

  it("T10 边界：福利分组最多 12 组", async () => {
    const benefits = (count: number) =>
      Array.from({ length: count }, (_, index) => ({ group: `分组${index}`, items: "A / B" }));

    const ok = await request(app)
      .put(CONTENT)
      .set(bearer(token))
      .send({ ...CAREERS_FIXTURE, benefits: benefits(12) });
    expect(ok.status).toBe(200);

    const tooMany = await request(app)
      .put(CONTENT)
      .set(bearer(token))
      .send({ ...CAREERS_FIXTURE, benefits: benefits(13) });
    expect(tooMany.status).toBe(400);
  });

  it("T11 边界：招聘邮箱允许留空", async () => {
    const res = await request(app)
      .put(CONTENT)
      .set(bearer(token))
      .send({ ...CAREERS_FIXTURE, applyEmail: "" });

    expect(res.status).toBe(200);
    expect(res.body.data.applyEmail).toBe("");
  });
});

describe("招聘城市 CRUD", () => {
  it("T12 城市列表聚合 positionsCount，详情返回关联职位", async () => {
    await seedFixtureContent();

    const list = await request(app).get("/api/v1/careers/cities?pageSize=10");
    expect(list.status).toBe(200);
    expect(list.body.data.total).toBe(2);
    expect(list.body.data.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "shanghai", positionsCount: 1 }),
        expect.objectContaining({ id: "shenzhen", positionsCount: 2 }),
      ]),
    );

    const detail = await request(app).get("/api/v1/careers/cities/shanghai");
    expect(detail.status).toBe(200);
    expect(detail.body.data.positions).toHaveLength(1);
    expect(detail.body.data.positions[0].id).toBe("position-001");
  });

  it("T13 修改城市 id 会联动职位主归属和 extraCities", async () => {
    await seedFixtureContent();

    const shanghai = await request(app)
      .put("/api/v1/careers/cities/shanghai")
      .set(bearer(token))
      .send({ ...CITIES_FIXTURE[0], id: "shanghai-hq" });
    expect(shanghai.status).toBe(200);

    const position = await request(app).get("/api/v1/careers/positions/position-001");
    expect(position.body.data.cityId).toBe("shanghai-hq");

    const shenzhen = await request(app)
      .put("/api/v1/careers/cities/shenzhen")
      .set(bearer(token))
      .send({ ...CITIES_FIXTURE[1], id: "shenzhen-south" });
    expect(shenzhen.status).toBe(200);
    const linked = await request(app).get("/api/v1/careers/positions/position-001");
    expect(linked.body.data.extraCities).toBe("shenzhen-south");
  });

  it("T14 删除城市会把主职位回退并清理附加城市", async () => {
    await seedFixtureContent();
    const deleted = await request(app)
      .delete("/api/v1/careers/cities/shanghai")
      .set(bearer(token))
      .send({ fallbackCityId: "shenzhen" });

    expect(deleted.status).toBe(200);
    expect(deleted.body.data).toMatchObject({ id: "shanghai", fallbackCityId: "shenzhen", reassignedPositions: 1 });
    const position = await request(app).get("/api/v1/careers/positions/position-001");
    expect(position.body.data.cityId).toBe("shenzhen");
    expect(position.body.data.extraCities).toBe("");
    expect((await request(app).get("/api/v1/careers/cities/shanghai")).status).toBe(404);
  });

  it("T15 城市写接口需要登录且 id 冲突返回 409", async () => {
    const unauth = await request(app).post("/api/v1/careers/cities").send(CITIES_FIXTURE[0]);
    expect(unauth.status).toBe(401);

    await seedFixtureContent();
    const conflict = await request(app)
      .post("/api/v1/careers/cities")
      .set(bearer(token))
      .send(CITIES_FIXTURE[0]);
    expect(conflict.status).toBe(409);
    expect(conflict.body.code).toBe(4090);
  });

  it("T16 删除最后一个城市时不删除职位，而是清空主城市", async () => {
    await seedFixtureContent();
    await CareersCity.deleteMany({ id: "shenzhen" });
    const deleted = await request(app)
      .delete("/api/v1/careers/cities/shanghai")
      .set(bearer(token));

    expect(deleted.status).toBe(200);
    expect(deleted.body.data).toMatchObject({ id: "shanghai", fallbackCityId: null });
    const position = await request(app).get("/api/v1/careers/positions/position-001");
    expect(position.body.data.cityId).toBe("");
    expect(await CareersPosition.countDocuments()).toBe(2);
  });
});

describe("招聘职位 CRUD", () => {
  it("T17 职位列表支持城市 / 关键词筛选与分页", async () => {
    await seedFixtureContent();
    const res = await request(app).get("/api/v1/careers/positions?cityId=shenzhen&pageSize=10");
    expect(res.status).toBe(200);
    expect(res.body.data.total).toBe(2);
    expect(res.body.data.items.map((item: { id: string }) => item.id)).toEqual(
      expect.arrayContaining(["position-001", "position-002"]),
    );
  });

  it("T18 创建 / 更新 / 删除职位，并过滤无效 extraCities", async () => {
    await seedFixtureContent();
    const payload = {
      ...POSITIONS_FIXTURE[0],
      id: "position-new",
      cityId: "shanghai",
      extraCities: "shenzhen/unknown/shenzhen",
    };
    const created = await request(app).post("/api/v1/careers/positions").set(bearer(token)).send(payload);
    expect(created.status).toBe(201);
    expect(created.body.data.extraCities).toBe("shenzhen");

    const invalidCity = await request(app)
      .post("/api/v1/careers/positions")
      .set(bearer(token))
      .send({ ...payload, id: "position-invalid", cityId: "missing-city" });
    expect(invalidCity.status).toBe(400);
    expect(invalidCity.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({ path: "cityId" })]));

    const updated = await request(app)
      .put("/api/v1/careers/positions/position-new")
      .set(bearer(token))
      .send({ ...payload, title: "更新后的职位", extraCities: "unknown/shenzhen" });
    expect(updated.status).toBe(200);
    expect(updated.body.data.title).toBe("更新后的职位");
    expect(updated.body.data.extraCities).toBe("shenzhen");

    const deleted = await request(app)
      .delete("/api/v1/careers/positions/position-new")
      .set(bearer(token));
    expect(deleted.status).toBe(200);
    expect(deleted.body.data).toMatchObject({ id: "position-new", success: true });
    expect((await request(app).get("/api/v1/careers/positions/position-new")).status).toBe(404);
  });

  it("T19 缺少必填字段和未登录写操作返回正确错误", async () => {
    const unauth = await request(app).post("/api/v1/careers/positions").send({});
    expect(unauth.status).toBe(401);

    const invalid = await request(app)
      .post("/api/v1/careers/positions")
      .set(bearer(token))
      .send({ ...POSITIONS_FIXTURE[0], id: "position-invalid" , title: "" });
    expect(invalid.status).toBe(400);
    expect(invalid.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({ path: "title" })]));
  });
});
