import MockAdapter from "axios-mock-adapter";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { fetchMe, login, logout } from "@/services/auth";
import { http } from "@/services/request";
import { setToken } from "@/utils/token";

let mock: MockAdapter;

beforeEach(() => {
  mock = new MockAdapter(http);
});

afterEach(() => {
  mock.restore();
});

describe("auth 服务", () => {
  it("login 提交用户名密码并返回 Token 与用户", async () => {
    mock.onPost("/auth/login", { username: "admin", password: "admin" }).reply(200, {
      code: 0,
      message: "ok",
      data: {
        accessToken: "jwt-1",
        expiresIn: 3600,
        user: { id: "1", username: "admin", role: "admin" },
      },
    });

    const result = await login({ username: "admin", password: "admin" });
    expect(result.accessToken).toBe("jwt-1");
    expect(result.user.username).toBe("admin");
  });

  it("fetchMe 携带 Token 并返回当前用户", async () => {
    setToken("jwt-2");
    mock.onGet("/auth/me").reply(200, {
      code: 0,
      message: "ok",
      data: { user: { id: "1", username: "admin", role: "admin" } },
    });

    const result = await fetchMe();
    expect(result.user.role).toBe("admin");
    expect(mock.history.get[0].headers?.Authorization).toBe("Bearer jwt-2");
  });

  it("logout 调用后端登出接口", async () => {
    mock.onPost("/auth/logout").reply(200, { code: 0, message: "ok", data: { success: true } });

    await expect(logout()).resolves.toEqual({ success: true });
    expect(mock.history.post[0].url).toBe("/auth/logout");
  });
});
