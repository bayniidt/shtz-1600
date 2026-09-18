import type { Express } from "express";
import request from "supertest";

import { createApp } from "@/app";
import { AboutContent } from "@/models/AboutContent.model";
import { ABOUT_FIXTURE } from "./fixtures/site-data";
import { bearer, loginAsAdmin, resetTestDB, seedFixtureContent, setupTestDB, teardownTestDB } from "./helpers/db";

const ABOUT = "/api/v1/about";

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

describe("GET /about —— 读取关于我们", () => {
  it("T1 正常：返回单文档且不暴露内部字段", async () => {
    await seedFixtureContent();
    const res = await request(app).get(ABOUT);

    expect(res.status).toBe(200);
    expect(res.body.data.heroTitle).toBe(ABOUT_FIXTURE.heroTitle);
    expect(res.body.data.values).toHaveLength(2);
    expect(res.body.data.timeline[0].period).toBe("2017");
    expect(res.body.data.team[0].avatar).toBe("/images/team-1.png");
    expect(res.body.data._id).toBeUndefined();
    expect(res.body.data.updatedAt).toBeDefined();
  });

  it("T2 异常：未初始化返回 404 / 4040", async () => {
    const res = await request(app).get(ABOUT);
    expect(res.status).toBe(404);
    expect(res.body.code).toBe(4040);
  });
});

describe("PUT /about —— 更新关于我们", () => {
  it("T3 正常：整体保存并可在 GET 中读到", async () => {
    await seedFixtureContent();
    const res = await request(app)
      .put(ABOUT)
      .set(bearer(token))
      .send({ ...ABOUT_FIXTURE, visionText: "新的愿景正文" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("关于我们已保存");

    const after = await request(app).get(ABOUT);
    expect(after.body.data.visionText).toBe("新的愿景正文");
  });

  it("T4 正常：GET → PUT 回写（幂等）", async () => {
    await seedFixtureContent();
    const before = await request(app).get(ABOUT);

    const res = await request(app).put(ABOUT).set(bearer(token)).send(before.body.data);

    expect(res.status).toBe(200);
    expect(res.body.data.offices).toEqual(before.body.data.offices);
  });

  it("T5 正常：未初始化时 PUT 自动创建", async () => {
    const res = await request(app).put(ABOUT).set(bearer(token)).send(ABOUT_FIXTURE);
    expect(res.status).toBe(200);
    expect(await AboutContent.countDocuments()).toBe(1);
  });

  it("T6 异常：未登录返回 401 / 4010", async () => {
    const res = await request(app).put(ABOUT).send(ABOUT_FIXTURE);
    expect(res.status).toBe(401);
    expect(res.body.code).toBe(4010);
  });

  it("T7 异常：缺少必填字段返回 400", async () => {
    const { visionTitle, ...rest } = ABOUT_FIXTURE;
    void visionTitle;
    const res = await request(app).put(ABOUT).set(bearer(token)).send(rest);

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: "visionTitle" })]),
    );
  });

  it("T8 异常：数组项缺少标题返回 400（values）", async () => {
    const res = await request(app)
      .put(ABOUT)
      .set(bearer(token))
      .send({ ...ABOUT_FIXTURE, values: [{ description: "缺少标题" }] });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: "values.0.title" })]),
    );
  });

  it("T9 边界：timeline 最多 30 项", async () => {
    const timeline = (count: number) =>
      Array.from({ length: count }, (_, index) => ({
        period: `20${index}`,
        title: `里程碑${index}`,
        description: "",
      }));

    const ok = await request(app)
      .put(ABOUT)
      .set(bearer(token))
      .send({ ...ABOUT_FIXTURE, timeline: timeline(30) });
    expect(ok.status).toBe(200);

    const tooMany = await request(app)
      .put(ABOUT)
      .set(bearer(token))
      .send({ ...ABOUT_FIXTURE, timeline: timeline(31) });
    expect(tooMany.status).toBe(400);
  });

  it("T10 边界：team 成员头像可选", async () => {
    const res = await request(app)
      .put(ABOUT)
      .set(bearer(token))
      .send({
        ...ABOUT_FIXTURE,
        team: [{ name: "王五", role: "CTO", bio: "" }],
      });

    expect(res.status).toBe(200);
    expect(res.body.data.team[0].avatar).toBeFalsy();
  });

  it("T11 边界：空数组允许（清空价值观 / 办公点）", async () => {
    const res = await request(app)
      .put(ABOUT)
      .set(bearer(token))
      .send({ ...ABOUT_FIXTURE, values: [], offices: [], stats: [] });

    expect(res.status).toBe(200);
    expect(res.body.data.values).toEqual([]);
    expect(res.body.data.offices).toEqual([]);
  });
});
