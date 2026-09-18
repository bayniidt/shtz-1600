import MockAdapter from "axios-mock-adapter";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { http } from "@/services/request";
import { fetchTheme, resetTheme, updateTheme } from "@/services/settings";

let mock: MockAdapter;

beforeEach(() => {
  mock = new MockAdapter(http);
});

afterEach(() => {
  mock.restore();
});

describe("settings 服务", () => {
  it("fetchTheme 读取主题（公开接口，无需 Token）", async () => {
    mock.onGet("/settings/theme").reply(200, {
      code: 0,
      message: "ok",
      data: { brand: { colorPrimary: "#1e96d4" } },
    });

    await expect(fetchTheme()).resolves.toEqual({ brand: { colorPrimary: "#1e96d4" } });
  });

  it("updateTheme 提交局部主题补丁", async () => {
    mock.onPut("/settings/theme", { brand: { colorPrimary: "#123456" } }).reply(200, {
      code: 0,
      message: "ok",
      data: { brand: { colorPrimary: "#123456" } },
    });

    const result = await updateTheme({ brand: { colorPrimary: "#123456" } });
    expect(result.brand?.colorPrimary).toBe("#123456");
  });

  it("resetTheme 调用重置接口", async () => {
    mock.onPost("/settings/theme/reset").reply(200, {
      code: 0,
      message: "ok",
      data: { brand: { colorPrimary: "#1e96d4" } },
    });

    const result = await resetTheme();
    expect(result.brand?.colorPrimary).toBe("#1e96d4");
    expect(mock.history.post[0].url).toBe("/settings/theme/reset");
  });
});
