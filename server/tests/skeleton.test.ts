import type { Express } from "express";
import request, { type Test } from "supertest";

import { createApp } from "@/app";
import { placeholderEndpoints, openApiDocument } from "@/docs/swagger";
import { ADMIN_PASSWORD, ADMIN_USERNAME, resetTestDB, setupTestDB, teardownTestDB } from "./helpers/db";

type Method = "get" | "post" | "put" | "delete";

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

function call(method: Method, path: string): Test {
  const url = `/api/v1${path.replace(/\{id\}/g, "sample-id")}`;
  switch (method) {
    case "get":
      return request(app).get(url);
    case "post":
      return request(app).post(url);
    case "put":
      return request(app).put(url);
    case "delete":
      return request(app).delete(url);
  }
}

const PLACEHOLDER_ENDPOINTS = placeholderEndpoints();
const PROTECTED = PLACEHOLDER_ENDPOINTS.filter((e) => e.protected);
const PUBLIC = PLACEHOLDER_ENDPOINTS.filter((e) => !e.protected);

describe("Stage 3 / 4 占位路由骨架", () => {
  it("S1 招聘城市 / 职位 CRUD 保持 10 个 501 占位接口", () => {
    expect(PLACEHOLDER_ENDPOINTS).toHaveLength(10);
    const tags = new Set(PLACEHOLDER_ENDPOINTS.map((e) => e.tag));
    expect(tags).toEqual(new Set(["Careers"]));
    // Stage 2 / 3 已实现的接口不应再出现在占位列表中
    const implemented = ["/site", "/home", "/about", "/careers/content", "/cases", "/cases/page"];
    const paths = PLACEHOLDER_ENDPOINTS.map((e) => e.path);
    for (const path of implemented) {
      expect(paths.filter((p) => p === path)).toHaveLength(0);
    }
  });

  it.each(PUBLIC.map((e) => [`${e.method.toUpperCase()} ${e.path}`, e] as const))(
    "S2 公开骨架 %s 返回 501 / 5001",
    async (_label, endpoint) => {
      const res = await call(endpoint.method, endpoint.path);
      expect(res.status).toBe(501);
      expect(res.body.code).toBe(5001);
      expect(res.body.message).toContain("尚未实现");
    },
  );

  it.each(PROTECTED.map((e) => [`${e.method.toUpperCase()} ${e.path}`, e] as const))(
    "S3 写骨架 %s 未登录 401，登录后 501",
    async (_label, endpoint) => {
      const unauth = await call(endpoint.method, endpoint.path).send({});
      expect(unauth.status).toBe(401);
      expect(unauth.body.code).toBe(4010);

      const authed = await call(endpoint.method, endpoint.path)
        .set("Authorization", `Bearer ${token}`)
        .send({});
      expect(authed.status).toBe(501);
      expect(authed.body.code).toBe(5001);
    },
  );

  it("S4 案例静态路由 /cases/page 优先于动态路由 /cases/:id", async () => {
    const page = await request(app).get("/api/v1/cases/page");
    const detail = await request(app).get("/api/v1/cases/another-case");
    // 两者都未初始化 → 均 404，但命中不同处理器（文案不同）
    expect(page.status).toBe(404);
    expect(detail.status).toBe(404);
    expect(page.body.message).toContain("文案");
    expect(detail.body.message).toBe("案例不存在");
  });

  it("S5 Swagger 文档覆盖全部占位 path 并标注 501 / 401", () => {
    const paths = openApiDocument.paths as Record<string, Record<string, unknown>>;
    for (const endpoint of PLACEHOLDER_ENDPOINTS) {
      const entry = paths[endpoint.path]?.[endpoint.method] as
        | { responses?: Record<string, unknown>; security?: unknown[] }
        | undefined;
      expect(entry).toBeDefined();
      expect(Object.keys(entry?.responses ?? {})).toContain("501");
      if (endpoint.protected) {
        expect(entry?.security).toEqual([{ bearerAuth: [] }]);
      }
    }
  });

  it("S6 Stage 2 / 3 已实现接口在 Swagger 中标注 200 且不再出现 501", () => {
    const paths = openApiDocument.paths as Record<string, Record<string, unknown>>;
    const implemented = ["/site", "/about", "/careers/content", "/cases/page"];

    for (const path of implemented) {
      const entry = paths[path] as Record<string, Record<string, unknown>>;
      expect(entry).toBeDefined();
      for (const method of ["get", "put"]) {
        const operation = entry[method];
        expect(operation).toBeDefined();
        expect(Object.keys(operation.responses as object)).toContain("200");
        expect(Object.keys(operation.responses as object)).not.toContain("501");
      }
      expect((entry.put as { security?: unknown[] }).security).toEqual([{ bearerAuth: [] }]);
      expect((entry.put as { requestBody?: unknown }).requestBody).toBeDefined();
    }

    // /home 只有 GET，各板块单独 PUT
    const home = paths["/home"] as Record<string, Record<string, unknown>>;
    expect(home.get).toBeDefined();
    expect(Object.keys(home.get.responses as object)).toContain("200");
    expect(home.put).toBeUndefined();

    for (const section of ["hero", "media", "flow", "clients", "strength", "honors"]) {
      const operation = (paths[`/home/${section}`] as Record<string, Record<string, unknown>>).put;
      expect(operation).toBeDefined();
      expect(Object.keys(operation.responses as object)).toContain("200");
    }
  });
});
