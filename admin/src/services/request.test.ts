import MockAdapter from "axios-mock-adapter";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ApiRequestError,
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
  http,
} from "@/services/request";
import { feedback } from "@/utils/feedback";
import { clearSession, getToken, setToken } from "@/utils/token";

let mock: MockAdapter;

beforeEach(() => {
  mock = new MockAdapter(http);
  localStorage.clear();
});

afterEach(() => {
  mock.restore();
});

describe("请求封装", () => {
  it("apiGet 解包统一信封", async () => {
    mock.onGet("/site").reply(200, { code: 0, message: "ok", data: { name: "ADFLY" } });
    await expect(apiGet("/site")).resolves.toEqual({ name: "ADFLY" });
  });

  it("apiPost / apiPut / apiDelete 传递请求体与路径", async () => {
    mock.onPost("/cases", { title: "A" }).reply(200, { code: 0, message: "ok", data: { id: "1" } });
    mock.onPut("/cases/1", { title: "B" }).reply(200, { code: 0, message: "ok", data: { id: "1" } });
    mock.onDelete("/cases/1").reply(200, { code: 0, message: "ok", data: null });

    await expect(apiPost("/cases", { title: "A" })).resolves.toEqual({ id: "1" });
    await expect(apiPut("/cases/1", { title: "B" })).resolves.toEqual({ id: "1" });
    await expect(apiDelete("/cases/1")).resolves.toBeNull();
  });

  it("自动注入 Bearer Token", async () => {
    setToken("jwt-abc");
    mock.onGet("/auth/me").reply((config) => {
      expect(config.headers?.Authorization).toBe("Bearer jwt-abc");
      return [200, { code: 0, message: "ok", data: { user: { username: "admin" } } }];
    });
    await apiGet("/auth/me");
    expect(mock.history.get).toHaveLength(1);
  });

  it("未登录时不带 Authorization 头", async () => {
    mock.onGet("/settings/theme").reply((config) => {
      expect(config.headers?.Authorization).toBeUndefined();
      return [200, { code: 0, message: "ok", data: {} }];
    });
    await apiGet("/settings/theme");
  });

  it("业务错误 → 抛出 ApiRequestError 并携带 code / status / errors", async () => {
    mock.onPut("/site").reply(400, {
      code: 4000,
      message: "参数校验失败",
      errors: [{ path: "name", message: "必填" }],
    });

    await expect(apiPut("/site", {})).rejects.toMatchObject({
      name: "ApiRequestError",
      message: "参数校验失败",
      code: 4000,
      status: 400,
      errors: [{ path: "name", message: "必填" }],
    });
  });

  it("501 占位接口错误同样被归一化", async () => {
    mock.onGet("/cases").reply(501, { code: 5001, message: "「读取案例列表」尚未实现" });
    const error = await apiGet("/cases").catch((err: unknown) => err);
    expect(error).toBeInstanceOf(ApiRequestError);
    expect((error as ApiRequestError).code).toBe(5001);
  });

  it("网络异常时回退默认文案", async () => {
    mock.onGet("/site").networkError();
    const error = await apiGet("/site").catch((err: unknown) => err);
    expect(error).toBeInstanceOf(ApiRequestError);
    expect((error as ApiRequestError).code).toBe(5000);
    expect((error as ApiRequestError).message.length).toBeGreaterThan(0);
  });

  it("401 时清理本地会话并跳转登录页", async () => {
    const errorSpy = vi.spyOn(feedback, "error").mockImplementation(() => undefined);
    const assign = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { pathname: "/admin/cases", href: "", assign },
    });
    setToken("expired");

    mock.onGet("/auth/me").reply(401, { code: 4010, message: "Token 已过期" });
    await expect(apiGet("/auth/me")).rejects.toBeInstanceOf(ApiRequestError);

    expect(getToken()).toBeNull();
    expect(errorSpy).toHaveBeenCalledWith("登录已失效，请重新登录");
    expect(window.location.href).toContain("/admin/login");
  });

  it("401 且已在登录页时不重复提示", async () => {
    const errorSpy = vi.spyOn(feedback, "error").mockImplementation(() => undefined);
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { pathname: "/admin/login", href: "" },
    });

    mock.onPost("/auth/login").reply(401, { code: 4010, message: "用户名或密码错误" });
    await expect(apiPost("/auth/login", {})).rejects.toBeInstanceOf(ApiRequestError);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("clearSession 不影响后续请求（可重复调用）", () => {
    setToken("x");
    clearSession();
    clearSession();
    expect(getToken()).toBeNull();
  });
});
