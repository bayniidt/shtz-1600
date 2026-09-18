import MockAdapter from "axios-mock-adapter";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { http } from "@/services/request";
import {
  fetchAbout,
  fetchCareersContent,
  fetchHome,
  fetchSite,
  saveAbout,
  saveCareersContent,
  saveHomeSection,
  saveSite,
} from "@/services/content";

let mock: MockAdapter;

const ok = (data: unknown) => [200, { code: 0, message: "ok", data }] as const;

beforeEach(() => {
  mock = new MockAdapter(http);
});

afterEach(() => {
  mock.restore();
});

describe("content 服务", () => {
  it("C1 fetchSite 读取站点配置", async () => {
    mock.onGet("/site").reply(...ok({ name: "上海翼投智能科技有限公司" }));

    await expect(fetchSite()).resolves.toEqual({ name: "上海翼投智能科技有限公司" });
    expect(mock.history.get[0].url).toBe("/site");
  });

  it("C2 saveSite 以 PUT 提交完整文档", async () => {
    const payload = { name: "ADFLY", nav: [{ label: "首页", href: "/" }] };
    mock.onPut("/site", payload).reply(...ok({ ...payload, updatedAt: "2024-01-01T00:00:00.000Z" }));

    const result = await saveSite(payload as never);
    expect(mock.history.put[0].url).toBe("/site");
    expect(result.updatedAt).toBe("2024-01-01T00:00:00.000Z");
  });

  it("C3 fetchHome 读取首页 6 个板块", async () => {
    mock.onGet("/home").reply(...ok({ hero: { title: "全球智能营销科技服务商" } }));

    await expect(fetchHome()).resolves.toEqual({ hero: { title: "全球智能营销科技服务商" } });
  });

  it("C4 saveHomeSection 按板块 PUT，并返回首页全量内容", async () => {
    mock.onPut("/home/hero", { title: "新标题" }).reply(...ok({ hero: { title: "新标题" }, media: {} }));

    const result = await saveHomeSection("hero", { title: "新标题" } as never);
    expect(mock.history.put[0].url).toBe("/home/hero");
    expect(result.hero.title).toBe("新标题");
    expect(result.media).toEqual({});
  });

  it("C5 saveHomeSection 支持全部 6 个板块路径", async () => {
    for (const section of ["hero", "media", "flow", "clients", "strength", "honors"] as const) {
      mock.onPut(`/home/${section}`).reply(...ok({ [section]: { ok: true } }));
    }

    for (const section of ["hero", "media", "flow", "clients", "strength", "honors"] as const) {
      await saveHomeSection(section, {} as never);
    }

    expect(mock.history.put.map((request) => request.url)).toEqual([
      "/home/hero",
      "/home/media",
      "/home/flow",
      "/home/clients",
      "/home/strength",
      "/home/honors",
    ]);
  });

  it("C6 fetchAbout / saveAbout 读写关于我们", async () => {
    mock.onGet("/about").reply(...ok({ heroTitle: "全球成功，从这里开始" }));
    mock.onPut("/about", { heroTitle: "新标题" }).reply(...ok({ heroTitle: "新标题" }));

    await expect(fetchAbout()).resolves.toEqual({ heroTitle: "全球成功，从这里开始" });
    await expect(saveAbout({ heroTitle: "新标题" } as never)).resolves.toEqual({ heroTitle: "新标题" });
    expect(mock.history.put[0].url).toBe("/about");
  });

  it("C7 fetchCareersContent / saveCareersContent 读写招聘文案", async () => {
    mock.onGet("/careers/content").reply(...ok({ heroTitle: "加入我们" }));
    mock.onPut("/careers/content", { heroTitle: "加入 ADFLY" }).reply(...ok({ heroTitle: "加入 ADFLY" }));

    await expect(fetchCareersContent()).resolves.toEqual({ heroTitle: "加入我们" });
    await expect(saveCareersContent({ heroTitle: "加入 ADFLY" } as never)).resolves.toEqual({
      heroTitle: "加入 ADFLY",
    });
    expect(mock.history.put[0].url).toBe("/careers/content");
  });

  it("C8 后端返回 4000 校验错误时抛出 ApiRequestError 且带字段信息", async () => {
    mock.onPut("/site").reply(400, {
      code: 4000,
      message: "参数校验失败",
      errors: [{ path: "name", message: "该字段必填" }],
    });

    await expect(saveSite({ name: "" } as never)).rejects.toMatchObject({
      code: 4000,
      message: "参数校验失败",
      errors: [{ path: "name", message: "该字段必填" }],
    });
  });

  it("C9 未登录（4010）时抛出鉴权错误", async () => {
    mock.onPut("/about").reply(401, { code: 4010, message: "登录已失效" });

    await expect(saveAbout({} as never)).rejects.toMatchObject({ code: 4010, message: "登录已失效" });
  });
});
