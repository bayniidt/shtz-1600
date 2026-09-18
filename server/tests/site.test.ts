import type { Express } from "express";
import request from "supertest";

import { createApp } from "@/app";
import { SiteConfig } from "@/models/SiteConfig.model";
import { SITE_FIXTURE } from "./fixtures/site-data";
import {
  bearer,
  loginAsAdmin,
  resetTestDB,
  seedFixtureContent,
  setupTestDB,
  teardownTestDB,
} from "./helpers/db";

const SITE = "/api/v1/site";

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

describe("GET /site —— 读取站点配置", () => {
  it("T1 正常：返回单文档内容，且不暴露内部字段", async () => {
    await seedFixtureContent();
    const res = await request(app).get(SITE);

    expect(res.status).toBe(200);
    expect(res.body.code).toBe(0);
    expect(res.body.data.name).toBe(SITE_FIXTURE.name);
    expect(res.body.data.logoText).toBe("ADFLY");
    expect(res.body.data.nav).toHaveLength(2);
    expect(res.body.data.seo.title).toBe(SITE_FIXTURE.seo.title);
    expect(res.body.data.updatedAt).toBeDefined();
    expect(res.body.data._id).toBeUndefined();
    expect(res.body.data.__v).toBeUndefined();
    expect(res.body.data.key).toBeUndefined();
    expect(res.body.data.createdAt).toBeUndefined();
  });

  it("T2 异常：数据未初始化时返回 404 / 4040 且给出 seed 提示", async () => {
    const res = await request(app).get(SITE);

    expect(res.status).toBe(404);
    expect(res.body.code).toBe(4040);
    expect(res.body.message).toContain("seed");
  });

  it("边界：只存在空的单文档时仍能正常返回 200", async () => {
    await SiteConfig.create({ key: "default" });
    const res = await request(app).get(SITE);

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("");
    expect(res.body.data.nav).toEqual([]);
  });
});

describe("PUT /site —— 更新站点配置", () => {
  it("T3 正常：完整更新后 GET 能读到新值", async () => {
    await seedFixtureContent();
    const res = await request(app).put(SITE).set(bearer(token)).send({
      ...SITE_FIXTURE,
      name: "新的公司名称",
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("站点配置已保存");
    expect(res.body.data.name).toBe("新的公司名称");

    const after = await request(app).get(SITE);
    expect(after.body.data.name).toBe("新的公司名称");
  });

  it("T4 正常：GET → PUT 回写（幂等，服务端托管字段被忽略）", async () => {
    await seedFixtureContent();
    const before = await request(app).get(SITE);

    const res = await request(app).put(SITE).set(bearer(token)).send(before.body.data);

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe(before.body.data.name);
    expect(res.body.data.nav).toEqual(before.body.data.nav);
  });

  it("T5 正常：未初始化时 PUT 直接创建（upsert）", async () => {
    const res = await request(app).put(SITE).set(bearer(token)).send(SITE_FIXTURE);
    expect(res.status).toBe(200);

    const count = await SiteConfig.countDocuments();
    expect(count).toBe(1);

    const after = await request(app).get(SITE);
    expect(after.status).toBe(200);
    expect(after.body.data.businessEmail).toBe(SITE_FIXTURE.businessEmail);
  });

  it("T6 异常：未登录返回 401 / 4010", async () => {
    const res = await request(app).put(SITE).send(SITE_FIXTURE);
    expect(res.status).toBe(401);
    expect(res.body.code).toBe(4010);
  });

  it("T7 异常：非法 Token 返回 401", async () => {
    const res = await request(app).put(SITE).set(bearer("not-a-token")).send(SITE_FIXTURE);
    expect(res.status).toBe(401);
    expect(res.body.code).toBe(4010);
  });

  it("T8 异常：缺少必填字段返回 400 / 4000 并给出字段路径", async () => {
    const { name, ...rest } = SITE_FIXTURE;
    void name;
    const res = await request(app).put(SITE).set(bearer(token)).send(rest);

    expect(res.status).toBe(400);
    expect(res.body.code).toBe(4000);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: "name" })]),
    );
  });

  it("T9 异常：未知字段被拒绝（strict 模式）", async () => {
    const res = await request(app)
      .put(SITE)
      .set(bearer(token))
      .send({ ...SITE_FIXTURE, hacker: "x" });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe(4000);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "body", message: expect.stringContaining("hacker") }),
      ]),
    );
  });

  it("T10 异常：邮箱格式错误返回中文提示", async () => {
    const res = await request(app)
      .put(SITE)
      .set(bearer(token))
      .send({ ...SITE_FIXTURE, contactEmail: "not-an-email" });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "contactEmail", message: "邮箱格式不正确" }),
      ]),
    );
  });

  it("T11 异常：类型错误（nav 不是数组）返回 400", async () => {
    const res = await request(app)
      .put(SITE)
      .set(bearer(token))
      .send({ ...SITE_FIXTURE, nav: "首页" });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: "nav" })]),
    );
  });

  it("T12 边界：空字符串 / 超长字段被拒绝", async () => {
    const empty = await request(app)
      .put(SITE)
      .set(bearer(token))
      .send({ ...SITE_FIXTURE, logoText: "   " });
    expect(empty.status).toBe(400);
    expect(empty.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: "logoText" })]),
    );

    const tooLong = await request(app)
      .put(SITE)
      .set(bearer(token))
      .send({ ...SITE_FIXTURE, name: "长".repeat(121) });
    expect(tooLong.status).toBe(400);
    expect(tooLong.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: "name" })]),
    );
  });

  it("T13 边界：nav 最多 20 项，21 项被拒绝；20 项通过", async () => {
    const nav = (count: number) =>
      Array.from({ length: count }, (_, index) => ({ label: `菜单${index}`, href: `/p${index}` }));

    const ok = await request(app)
      .put(SITE)
      .set(bearer(token))
      .send({ ...SITE_FIXTURE, nav: nav(20) });
    expect(ok.status).toBe(200);
    expect(ok.body.data.nav).toHaveLength(20);

    const tooMany = await request(app)
      .put(SITE)
      .set(bearer(token))
      .send({ ...SITE_FIXTURE, nav: nav(21) });
    expect(tooMany.status).toBe(400);
    expect(tooMany.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: "nav" })]),
    );
  });

  it("T14 边界：邮箱允许留空（前台不展示联系方式）", async () => {
    const res = await request(app)
      .put(SITE)
      .set(bearer(token))
      .send({ ...SITE_FIXTURE, contactEmail: "", businessEmail: "" });

    expect(res.status).toBe(200);
    expect(res.body.data.contactEmail).toBe("");
  });

  it("T15 边界：只更新部分字段时其余字段不受影响", async () => {
    await seedFixtureContent();
    const before = await request(app).get(SITE);

    const res = await request(app)
      .put(SITE)
      .set(bearer(token))
      .send({ ...before.body.data, phone: "+86 21 1111 2222" });

    expect(res.status).toBe(200);
    expect(res.body.data.phone).toBe("+86 21 1111 2222");
    expect(res.body.data.icp).toBe(before.body.data.icp);
  });
});
