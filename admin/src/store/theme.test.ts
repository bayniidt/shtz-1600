import { beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_ADMIN_THEME } from "@/config/theme";
import { fetchTheme } from "@/services/settings";
import { useThemeStore } from "@/store/theme";

vi.mock("@/services/settings", () => ({
  fetchTheme: vi.fn(),
  updateTheme: vi.fn(),
  resetTheme: vi.fn(),
}));

const mockedFetchTheme = vi.mocked(fetchTheme);

beforeEach(() => {
  useThemeStore.setState({ theme: DEFAULT_ADMIN_THEME, loaded: false });
});

describe("theme store", () => {
  it("load 成功时合并远端主题并写入 CSS 变量", async () => {
    mockedFetchTheme.mockResolvedValue({ brand: { colorPrimary: "#123456" } });

    await useThemeStore.getState().load();

    const state = useThemeStore.getState();
    expect(state.loaded).toBe(true);
    expect(state.theme.brand.colorPrimary).toBe("#123456");
    expect(state.theme.brand.colorAccent).toBe(DEFAULT_ADMIN_THEME.brand.colorAccent);
    expect(document.documentElement.style.getPropertyValue("--adfly-brand")).toBe("#123456");
  });

  it("load 失败时回退默认主题且不抛错", async () => {
    mockedFetchTheme.mockRejectedValue(new Error("network"));

    await expect(useThemeStore.getState().load()).resolves.toBeUndefined();

    expect(useThemeStore.getState().theme).toEqual(DEFAULT_ADMIN_THEME);
    expect(useThemeStore.getState().loaded).toBe(true);
    expect(document.documentElement.style.getPropertyValue("--adfly-brand")).toBe(
      DEFAULT_ADMIN_THEME.brand.colorPrimary,
    );
  });

  it("applyRemote 返回合并后的主题并立即生效", () => {
    const next = useThemeStore.getState().applyRemote({ layout: { siderWidth: 280 } });

    expect(next.layout.siderWidth).toBe(280);
    expect(useThemeStore.getState().theme.layout.siderWidth).toBe(280);
    expect(useThemeStore.getState().loaded).toBe(true);
  });

  it("applyRemote 传入空值等价于恢复默认", () => {
    useThemeStore.getState().applyRemote({ brand: { colorPrimary: "#000000" } });
    const next = useThemeStore.getState().applyRemote(null);
    expect(next.brand.colorPrimary).toBe(DEFAULT_ADMIN_THEME.brand.colorPrimary);
  });
});
