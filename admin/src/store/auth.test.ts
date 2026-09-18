import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchMe, login, logout } from "@/services/auth";
import { useAuthStore } from "@/store/auth";
import { getStoredUser, getToken, setToken } from "@/utils/token";

vi.mock("@/services/auth", () => ({
  login: vi.fn(),
  logout: vi.fn(),
  fetchMe: vi.fn(),
}));

const mockedLogin = vi.mocked(login);
const mockedLogout = vi.mocked(logout);
const mockedFetchMe = vi.mocked(fetchMe);

const ADMIN = { id: "1", username: "admin", role: "admin" };

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({ token: null, user: null, ready: false, signingIn: false });
});

describe("auth store", () => {
  it("signIn 成功后写入 Token 与用户", async () => {
    mockedLogin.mockResolvedValue({ accessToken: "jwt-1", user: ADMIN } as never);

    const user = await useAuthStore.getState().signIn("admin", "admin");

    expect(user).toEqual(ADMIN);
    expect(useAuthStore.getState().token).toBe("jwt-1");
    expect(useAuthStore.getState().signingIn).toBe(false);
    expect(getToken()).toBe("jwt-1");
    expect(getStoredUser()).toEqual(ADMIN);
  });

  it("signIn 失败时抛出错误并复位 signingIn", async () => {
    mockedLogin.mockRejectedValue(new Error("用户名或密码错误"));

    await expect(useAuthStore.getState().signIn("admin", "bad")).rejects.toThrow("用户名或密码错误");
    expect(useAuthStore.getState().signingIn).toBe(false);
    expect(useAuthStore.getState().token).toBeNull();
  });

  it("signOut 清理本地会话（登出接口失败也不影响）", async () => {
    setToken("jwt-1");
    useAuthStore.setState({ token: "jwt-1", user: ADMIN });
    mockedLogout.mockRejectedValue(new Error("network"));

    await useAuthStore.getState().signOut();

    expect(getToken()).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it("signOut 未登录时不调用接口", async () => {
    await useAuthStore.getState().signOut();
    expect(mockedLogout).not.toHaveBeenCalled();
  });

  it("hydrate：无 Token 时直接完成", async () => {
    await useAuthStore.getState().hydrate();

    expect(mockedFetchMe).not.toHaveBeenCalled();
    expect(useAuthStore.getState().ready).toBe(true);
    expect(useAuthStore.getState().token).toBeNull();
  });

  it("hydrate：Token 有效时刷新用户信息", async () => {
    setToken("jwt-1");
    mockedFetchMe.mockResolvedValue({ user: ADMIN } as never);

    await useAuthStore.getState().hydrate();

    expect(useAuthStore.getState().token).toBe("jwt-1");
    expect(useAuthStore.getState().user).toEqual(ADMIN);
    expect(useAuthStore.getState().ready).toBe(true);
  });

  it("hydrate：Token 失效时清理会话", async () => {
    setToken("jwt-expired");
    mockedFetchMe.mockRejectedValue(new Error("Token 已过期"));

    await useAuthStore.getState().hydrate();

    expect(getToken()).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().ready).toBe(true);
  });
});
