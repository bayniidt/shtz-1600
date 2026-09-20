import { describe, expect, it } from "vitest";

import {
  loadModuleBlueprints,
  MODULE_BLUEPRINTS,
  OPENAPI_DOCUMENT_URL,
} from "@/config/endpoints";

describe("接口蓝图 OpenAPI 同步", () => {
  it("从机器可读文档生成方法、路径、摘要与鉴权标记", async () => {
    const fakeFetch = async (input: RequestInfo | URL) => {
      expect(input).toBe(OPENAPI_DOCUMENT_URL);
      return new Response(
        JSON.stringify({
          paths: {
            "/cases": {
              get: { tags: ["Cases"], summary: "案例列表（实时文档）" },
              post: { tags: ["Cases"], summary: "新建案例（实时文档）", security: [{ bearerAuth: [] }] },
            },
          },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    };

    const loaded = await loadModuleBlueprints(fakeFetch);

    expect(loaded.cases.endpoints).toEqual([
      { method: "GET", path: "/cases", label: "案例列表（实时文档）", auth: false },
      { method: "POST", path: "/cases", label: "新建案例（实时文档）", auth: true },
    ]);
    expect(loaded.site.endpoints).toEqual(MODULE_BLUEPRINTS.site.endpoints);
  });

  it("OpenAPI 不可用时回退到本地蓝图", async () => {
    const loaded = await loadModuleBlueprints(async () => new Response("unavailable", { status: 503 }));
    expect(loaded.cases).toEqual(MODULE_BLUEPRINTS.cases);
    expect(loaded.careersCities).toEqual(MODULE_BLUEPRINTS.careersCities);
  });
});
