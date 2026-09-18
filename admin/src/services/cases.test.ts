import MockAdapter from "axios-mock-adapter";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { http } from "@/services/request";
import {
  createCase,
  deleteCase,
  fetchCase,
  fetchCases,
  fetchCasesPage,
  saveCasesPage,
  toggleCaseFeatured,
  updateCase,
} from "@/services/cases";
import { CASE_ITEM_FIXTURE, CASE_ITEMS_FIXTURE, CASES_PAGE_FIXTURE } from "@/test/fixtures/content";

let mock: MockAdapter;

const ok = (data: unknown): [number, { code: 0; message: string; data: unknown }] => [
  200,
  { code: 0, message: "ok", data },
];

beforeEach(() => {
  mock = new MockAdapter(http);
});

afterEach(() => {
  mock.restore();
});

describe("cases 服务", () => {
  it("K1 fetchCasesPage 读取案例列表页文案", async () => {
    mock.onGet("/cases/page").reply(...ok(CASES_PAGE_FIXTURE));

    await expect(fetchCasesPage()).resolves.toEqual(CASES_PAGE_FIXTURE);
    expect(mock.history.get[0].url).toBe("/cases/page");
  });

  it("K2 saveCasesPage 以 PUT 提交完整文案", async () => {
    mock.onPut("/cases/page", CASES_PAGE_FIXTURE).reply(...ok(CASES_PAGE_FIXTURE));

    await expect(saveCasesPage(CASES_PAGE_FIXTURE)).resolves.toEqual(CASES_PAGE_FIXTURE);
    expect(mock.history.put[0].url).toBe("/cases/page");
  });

  it("K3 fetchCases 列表带分页 / 筛选参数", async () => {
    const result = { items: CASE_ITEMS_FIXTURE, total: 2, page: 1, pageSize: 10 };
    mock.onGet("/cases").reply((config) => {
      expect(config.params).toEqual({ page: 1, pageSize: 10, industry: "game", keyword: "游戏" });
      return ok(result);
    });

    await expect(
      fetchCases({ page: 1, pageSize: 10, industry: "game", keyword: "游戏" }),
    ).resolves.toEqual(result);
    expect(mock.history.get[0].url).toBe("/cases");
  });

  it("K4 fetchCase 按业务 id 读取详情", async () => {
    mock.onGet("/cases/case-001").reply(...ok(CASE_ITEM_FIXTURE));

    await expect(fetchCase("case-001")).resolves.toEqual(CASE_ITEM_FIXTURE);
    expect(mock.history.get[0].url).toBe("/cases/case-001");
  });

  it("K5 createCase 以 POST 新建", async () => {
    mock.onPost("/cases", CASE_ITEM_FIXTURE).reply(201, { code: 0, message: "案例已创建", data: CASE_ITEM_FIXTURE });

    await expect(createCase(CASE_ITEM_FIXTURE)).resolves.toEqual(CASE_ITEM_FIXTURE);
    expect(mock.history.post[0].url).toBe("/cases");
  });

  it("K6 updateCase 以 PUT 覆盖并强制 id 与路径一致", async () => {
    mock.onPut("/cases/case-001", CASE_ITEM_FIXTURE).reply(...ok(CASE_ITEM_FIXTURE));

    await expect(updateCase("case-001", CASE_ITEM_FIXTURE)).resolves.toEqual(CASE_ITEM_FIXTURE);
    expect(mock.history.put[0].url).toBe("/cases/case-001");
  });

  it("K7 deleteCase 以 DELETE 删除并返回结果", async () => {
    const result = { id: "case-001", success: true };
    mock.onDelete("/cases/case-001").reply(...ok(result));

    await expect(deleteCase("case-001")).resolves.toEqual(result);
    expect(mock.history.delete[0].url).toBe("/cases/case-001");
  });

  it("K8 toggleCaseFeatured 切换置顶", async () => {
    mock.onPost("/cases/case-001/featured", { featured: true }).reply(...ok(CASE_ITEM_FIXTURE));

    await expect(toggleCaseFeatured("case-001", true)).resolves.toEqual(CASE_ITEM_FIXTURE);
    expect(mock.history.post[0].url).toBe("/cases/case-001/featured");
  });

  it("K9 后端 409 冲突抛出 ApiRequestError", async () => {
    mock.onPost("/cases").reply(409, { code: 4090, message: "案例 id「case-001」已存在" });

    await expect(createCase(CASE_ITEM_FIXTURE)).rejects.toMatchObject({
      code: 4090,
      message: "案例 id「case-001」已存在",
    });
  });
});
