import { beforeEach, describe, expect, it } from "vitest";

import {
  TOKEN_KEY,
  USER_KEY,
  clearSession,
  getStoredUser,
  getToken,
  setStoredUser,
  setToken,
} from "@/utils/token";

beforeEach(() => {
  localStorage.clear();
});

describe("token 工具", () => {
  it("读写 Token", () => {
    expect(getToken()).toBeNull();
    setToken("abc");
    expect(getToken()).toBe("abc");
    expect(localStorage.getItem(TOKEN_KEY)).toBe("abc");
  });

  it("读写用户信息", () => {
    expect(getStoredUser()).toBeNull();
    setStoredUser({ id: "1", username: "admin", role: "admin" });
    expect(getStoredUser()).toEqual({ id: "1", username: "admin", role: "admin" });
    expect(localStorage.getItem(USER_KEY)).toContain("admin");
  });

  it("用户信息损坏时返回 null 而不抛错", () => {
    localStorage.setItem(USER_KEY, "{not-json");
    expect(getStoredUser()).toBeNull();
  });

  it("clearSession 同时清理 Token 与用户", () => {
    setToken("abc");
    setStoredUser({ id: "1", username: "admin", role: "admin" });
    clearSession();
    expect(getToken()).toBeNull();
    expect(getStoredUser()).toBeNull();
  });
});
