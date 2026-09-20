import type { Express } from "express";
import request from "supertest";

import { createApp } from "@/app";
import { placeholderEndpoints, openApiDocument } from "@/docs/swagger";
import { resetTestDB, setupTestDB, teardownTestDB } from "./helpers/db";

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

const PLACEHOLDER_ENDPOINTS = placeholderEndpoints();

describe("Stage 4 路由与文档收口", () => {
  it("S1 招聘城市 / 职位 CRUD 不再保留 501 占位接口", () => {
    expect(PLACEHOLDER_ENDPOINTS).toHaveLength(0);
    // Stage 2 / 3 已实现的接口不应再出现在占位列表中
    const implemented = ["/site", "/home", "/about", "/careers/content", "/cases", "/cases/page"];
    const paths = PLACEHOLDER_ENDPOINTS.map((e) => e.path);
    for (const path of implemented) {
      expect(paths.filter((p) => p === path)).toHaveLength(0);
    }
  });

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

  it("S7 提供机器可读 OpenAPI JSON，所有操作都包含请求/响应示例", async () => {
    const response = await request(app).get("/api/docs/openapi.json");
    expect(response.status).toBe(200);
    expect(response.body.openapi).toBe("3.0.3");
    expect(response.body.paths).toBeTruthy();

    const methods = new Set(["get", "post", "put", "delete"]);
    for (const pathItem of Object.values(openApiDocument.paths as Record<string, Record<string, unknown>>)) {
      for (const [method, rawOperation] of Object.entries(pathItem)) {
        if (!methods.has(method)) continue;
        const operation = rawOperation as {
          description?: string;
          requestBody?: { content?: Record<string, { example?: unknown }> };
          responses?: Record<string, { content?: Record<string, { example?: unknown }> }>;
        };
        expect(operation.description).toBeTruthy();
        expect(operation.responses).toBeTruthy();

        const responses = operation.responses ?? {};
        expect(Object.keys(responses).some((status) => /^2\d\d$/.test(status))).toBe(true);

        for (const [status, rawResponse] of Object.entries(responses)) {
          const example = rawResponse.content?.["application/json"]?.example;
          expect(example).toBeDefined();
          if (!/^2\d\d$/.test(status)) {
            expect((example as { code?: number })?.code).toEqual(expect.any(Number));
          }
        }

        if (operation.requestBody) {
          expect(operation.requestBody.content?.["application/json"]?.example).toBeDefined();
        }
      }
    }
  });
});
