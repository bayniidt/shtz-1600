import type { Express } from "express";
import request from "supertest";

import { createApp } from "@/app";
import { DEFAULT_ADMIN_THEME } from "@/config/theme";
import {
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
  resetTestDB,
  setupTestDB,
  teardownTestDB,
} from "./helpers/db";

const THEME = "/api/v1/settings/theme";

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
  const res = await request(app)
    .post("/api/v1/auth/login")
    .send({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
  token = res.body.data.accessToken as string;
});

describe("GET /settings/theme", () => {
  it("T1 正常：首次读取返回默认品牌主题（与前台一致）", async () => {
    const res = await request(app).get(THEME);

    expect(res.status).toBe(200);
    expect(res.body.data.brand.colorPrimary).toBe("#1e96d4");
    expect(res.body.data.brand.colorAccent).toBe("#ed5736");
    expect(res.body.data.typography.fontSize).toBe(14);
  });
});

describe("PUT /settings/theme", () => {
  it("T2 正常：局部更新主色后读取生效", async () => {
    const put = await request(app)
      .put(THEME)
      .set("Authorization", `Bearer ${token}`)
      .send({ brand: { colorPrimary: "#0066ff" } });

    expect(put.status).toBe(200);
    expect(put.body.data.brand.colorPrimary).toBe("#0066ff");
    // 未更新的字段保持不变
    expect(put.body.data.brand.colorAccent).toBe(DEFAULT_ADMIN_THEME.brand.colorAccent);

    const get = await request(app).get(THEME);
    expect(get.body.data.brand.colorPrimary).toBe("#0066ff");
  });

  it("T3 异常：未登录更新 → 401 / 4010", async () => {
    const res = await request(app).put(THEME).send({ brand: { colorPrimary: "#000000" } });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe(4010);
  });

  it("T4 异常：非法颜色值 → 400 / 4000", async () => {
    const res = await request(app)
      .put(THEME)
      .set("Authorization", `Bearer ${token}`)
      .send({ brand: { colorPrimary: "blue" } });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe(4000);
    expect(res.body.errors[0].path).toContain("colorPrimary");
  });

  it("T5 异常：未知字段（strict）→ 400", async () => {
    const res = await request(app)
      .put(THEME)
      .set("Authorization", `Bearer ${token}`)
      .send({ brand: { notAField: "#ffffff" } });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe(4000);
  });

  it("T6 边界：超出范围的 siderWidth / fontSize 被拦截", async () => {
    const tooWide = await request(app)
      .put(THEME)
      .set("Authorization", `Bearer ${token}`)
      .send({ layout: { siderWidth: 999 } });
    expect(tooWide.status).toBe(400);

    const tooSmall = await request(app)
      .put(THEME)
      .set("Authorization", `Bearer ${token}`)
      .send({ typography: { fontSize: 6 } });
    expect(tooSmall.status).toBe(400);
  });

  it("T7 正常：恢复默认主题", async () => {
    await request(app)
      .put(THEME)
      .set("Authorization", `Bearer ${token}`)
      .send({ brand: { colorPrimary: "#000000" } });

    const reset = await request(app)
      .post(`${THEME}/reset`)
      .set("Authorization", `Bearer ${token}`);

    expect(reset.status).toBe(200);
    expect(reset.body.data.brand.colorPrimary).toBe(DEFAULT_ADMIN_THEME.brand.colorPrimary);
  });

  it("T8 异常：未登录恢复默认 → 401", async () => {
    const res = await request(app).post(`${THEME}/reset`);
    expect(res.status).toBe(401);
  });
});
