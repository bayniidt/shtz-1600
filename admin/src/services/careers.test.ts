import MockAdapter from "axios-mock-adapter";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { http } from "@/services/request";
import {
  createCareerPosition,
  deleteCareerCity,
  fetchCareerCities,
  fetchCareerPosition,
  updateCareerCity,
} from "@/services/careers";

const ok = (data: unknown) => [200, { code: 0, message: "ok", data }] as const;
let mock: MockAdapter;

beforeEach(() => {
  mock = new MockAdapter(http);
});

afterEach(() => mock.restore());

describe("careers 服务", () => {
  it("C1 读取城市列表并保留查询参数", async () => {
    mock.onGet("/careers/cities").reply(...ok({ items: [], total: 0, page: 1, pageSize: 20 }));
    await expect(fetchCareerCities({ page: 1, pageSize: 20, keyword: "上海" })).resolves.toMatchObject({ total: 0 });
    expect(mock.history.get[0].url).toBe("/careers/cities");
  });

  it("C2 城市删除以 JSON body 传回退城市", async () => {
    mock.onDelete("/careers/cities/shanghai", { data: { fallbackCityId: "shenzhen" } }).reply(
      ...ok({ id: "shanghai", success: true }),
    );
    await expect(deleteCareerCity("shanghai", "shenzhen")).resolves.toEqual({ id: "shanghai", success: true });
    expect(mock.history.delete[0].data).toBe(JSON.stringify({ fallbackCityId: "shenzhen" }));
  });

  it("C3 职位创建、城市更新与职位详情使用对应 REST 路径", async () => {
    const position = { id: "position-001", title: "广告优化师" };
    mock.onPost("/careers/positions", position).reply(...ok(position));
    mock.onPut("/careers/cities/shanghai", { id: "shanghai", name: "上海" }).reply(...ok({ id: "shanghai" }));
    mock.onGet("/careers/positions/position-001").reply(...ok(position));

    await expect(createCareerPosition(position as never)).resolves.toEqual(position);
    await expect(updateCareerCity("shanghai", { id: "shanghai", name: "上海" } as never)).resolves.toEqual({ id: "shanghai" });
    await expect(fetchCareerPosition("position-001")).resolves.toEqual(position);
    expect(mock.history.post[0].url).toBe("/careers/positions");
    expect(mock.history.put[0].url).toBe("/careers/cities/shanghai");
  });
});
