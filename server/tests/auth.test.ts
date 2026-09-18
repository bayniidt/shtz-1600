import type { Express } from "express";
import request from "supertest";

import { createApp } from "@/app";
import {
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
  resetTestDB,
  setupTestDB,
  teardownTestDB,
} from "./helpers/db";
import { signToken } from "@/utils/jwt";

const LOGIN = "/api/v1/auth/login";
const ME = "/api/v1/auth/me";

let app: Express;

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await resetTestDB();
  app = createApp();
});

async function login(payload: Record<string, unknown>, target: Express = app) {
  return request(target).post(LOGIN).send(payload);
}

describe("POST /auth/login", () => {
  it("A1 正常：admin/admin 登录成功，返回 accessToken 与用户信息", async () => {
    const res = await login({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.code).toBe(0);
    expect(res.body.data.accessToken).toEqual(expect.any(String));
    expect(res.body.data.tokenType).toBe("Bearer");
    expect(res.body.data.user).toMatchObject({ username: "admin", role: "admin" });
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it("A2 异常：用户名不存在 → 401 / 4010", async () => {
    const res = await login({ username: "nobody", password: ADMIN_PASSWORD });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe(4010);
    expect(res.body.message).toBe("用户名或密码错误");
  });

  it("A3 异常：密码错误 → 401 / 4010，且与用户名不存在提示一致（防枚举）", async () => {
    const wrongPassword = await login({ username: ADMIN_USERNAME, password: "wrong-password" });
    const noUser = await login({ username: "nobody", password: "wrong-password" });

    expect(wrongPassword.status).toBe(401);
    expect(wrongPassword.body.code).toBe(4010);
    expect(wrongPassword.body.message).toBe(noUser.body.message);
  });

  it("A4 异常：缺少 username → 400 / 4000，errors 指出字段", async () => {
    const res = await login({ password: ADMIN_PASSWORD });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe(4000);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: "username" })]),
    );
  });

  it("A5 异常：缺少 password → 400 / 4000", async () => {
    const res = await login({ username: ADMIN_USERNAME });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe(4000);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: "password" })]),
    );
  });

  it("A6 边界：password 100 字符不崩溃，101 字符被长度校验拦截", async () => {
    const exactly100 = await login({ username: ADMIN_USERNAME, password: "p".repeat(100) });
    expect(exactly100.status).toBe(401);

    const tooLong = await login({ username: ADMIN_USERNAME, password: "p".repeat(101) });
    expect(tooLong.status).toBe(400);
    expect(tooLong.body.code).toBe(4000);
  });

  it("A7 边界：连续 10 次失败后第 11 次返回 429 / 4290", async () => {
    const limitedApp = createApp({ loginRateMax: 10 });

    for (let i = 0; i < 10; i += 1) {
      const res = await login({ username: ADMIN_USERNAME, password: "bad" }, limitedApp);
      expect(res.status).toBe(401);
    }

    const blocked = await login({ username: ADMIN_USERNAME, password: "bad" }, limitedApp);
    expect(blocked.status).toBe(429);
    expect(blocked.body.code).toBe(4290);

    // 成功登录不计入失败次数
    const okApp = createApp({ loginRateMax: 2 });
    await login({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD }, okApp);
    const stillOk = await login({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD }, okApp);
    expect(stillOk.status).toBe(200);
  });
});

describe("GET /auth/me", () => {
  it("A8 正常：用登录返回的 Token 读取当前用户", async () => {
    const { body } = await login({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
    const token = body.data.accessToken as string;

    const res = await request(app).get(ME).set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.code).toBe(0);
    expect(res.body.data.user).toMatchObject({ username: "admin", role: "admin" });
    expect(res.body.data.user.lastLoginAt).toEqual(expect.any(String));
  });

  it("A9 异常：伪造 Token → 401 / 4010", async () => {
    const res = await request(app).get(ME).set("Authorization", "Bearer not-a-real-token");

    expect(res.status).toBe(401);
    expect(res.body.code).toBe(4010);
  });

  it("A10 异常：过期 Token → 401，msg=Token 已过期", async () => {
    const expired = signToken({ id: "000000000000000000000000", username: "admin", role: "admin" }, "-1s");

    const res = await request(app).get(ME).set("Authorization", `Bearer ${expired}`);

    expect(res.status).toBe(401);
    expect(res.body.code).toBe(4010);
    expect(res.body.message).toBe("Token 已过期");
  });

  it("A11 异常：未携带 Token → 401 / 4010", async () => {
    const res = await request(app).get(ME);

    expect(res.status).toBe(401);
    expect(res.body.code).toBe(4010);
  });

  it("A12 异常：Token 有效但账号已被删除 → 401", async () => {
    const token = signToken({ id: "64b000000000000000000000", username: "ghost", role: "admin" });
    const res = await request(app).get(ME).set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body.code).toBe(4010);
  });
});

describe("POST /auth/logout", () => {
  it("A13 正常：登出后原 Token 立即失效", async () => {
    const { body } = await login({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
    const token = body.data.accessToken as string;

    const out = await request(app).post("/api/v1/auth/logout").set("Authorization", `Bearer ${token}`);
    expect(out.status).toBe(200);
    expect(out.body.data.success).toBe(true);

    const after = await request(app).get(ME).set("Authorization", `Bearer ${token}`);
    expect(after.status).toBe(401);
    expect(after.body.code).toBe(4010);
  });

  it("A14 异常：未登录调用登出 → 401", async () => {
    const res = await request(app).post("/api/v1/auth/logout");
    expect(res.status).toBe(401);
    expect(res.body.code).toBe(4010);
  });
});

describe("基础健壮性", () => {
  it("H1 健康检查返回 ok", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("ok");
  });

  it("H2 未知路由 → 404 / 4040", async () => {
    const res = await request(app).get("/api/v1/not-exist");
    expect(res.status).toBe(404);
    expect(res.body.code).toBe(4040);
  });
});
