import type { Express } from "express";
import request from "supertest";

import { createApp } from "@/app";
import { CareersCity } from "@/models/CareersCity.model";
import { CareersContent } from "@/models/CareersContent.model";
import { CareersPosition } from "@/models/CareersPosition.model";
import { CAREERS_FIXTURE } from "./fixtures/site-data";
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

describe("Stage 4 占位接口（尚未实现）", () => {
  it("T12 城市 / 职位 CRUD 仍返回 501 / 5001，写接口需登录", async () => {
    const read = await request(app).get("/api/v1/careers/cities");
    expect(read.status).toBe(501);
    expect(read.body.code).toBe(5001);

    const unauth = await request(app).post("/api/v1/careers/positions").send({});
    expect(unauth.status).toBe(401);

    const authed = await request(app)
      .post("/api/v1/careers/positions")
      .set(bearer(token))
      .send({});
    expect(authed.status).toBe(501);
    expect(authed.body.code).toBe(5001);
  });
});
