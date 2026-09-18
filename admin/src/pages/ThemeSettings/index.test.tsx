import { beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_ADMIN_THEME } from "@/config/theme";
import ThemeSettings from "@/pages/ThemeSettings";
import { resetTheme, updateTheme } from "@/services/settings";
import { useThemeStore } from "@/store/theme";
import { fireEvent, renderWithProviders, screen, waitFor } from "@/test/utils";

vi.mock("@/services/settings", () => ({
  fetchTheme: vi.fn(),
  updateTheme: vi.fn(),
  resetTheme: vi.fn(),
}));

const mockedUpdate = vi.mocked(updateTheme);
const mockedReset = vi.mocked(resetTheme);

beforeEach(() => {
  useThemeStore.setState({ theme: DEFAULT_ADMIN_THEME, loaded: true });
});

describe("主题设置页", () => {
  it("渲染全部配置分组与实时预览", () => {
    renderWithProviders(<ThemeSettings />, { route: "/settings/theme" });

    expect(screen.getByTestId("page-title")).toHaveTextContent("主题设置");
    expect(screen.getByText("品牌色（与前台一致）")).toBeInTheDocument();
    expect(screen.getByText("语义色")).toBeInTheDocument();
    expect(screen.getByText("布局")).toBeInTheDocument();
    expect(screen.getByText("排版")).toBeInTheDocument();
    expect(screen.getByText("实时预览")).toBeInTheDocument();

    expect(screen.getByTestId("theme-preview-primary")).toHaveStyle({
      background: DEFAULT_ADMIN_THEME.brand.colorPrimary,
    });
  });

  it("保存时提交完整主题并立即生效", async () => {
    mockedUpdate.mockResolvedValue({ brand: { colorPrimary: "#00aa88" } });

    renderWithProviders(<ThemeSettings />, { route: "/settings/theme" });
    fireEvent.click(screen.getByTestId("theme-save"));

    await waitFor(() => expect(mockedUpdate).toHaveBeenCalledTimes(1));
    const payload = mockedUpdate.mock.calls[0][0];
    expect(payload.brand?.colorPrimary).toBe(DEFAULT_ADMIN_THEME.brand.colorPrimary);
    expect(payload.layout?.siderWidth).toBe(DEFAULT_ADMIN_THEME.layout.siderWidth);
    expect(payload.typography?.fontSize).toBe(DEFAULT_ADMIN_THEME.typography.fontSize);

    await waitFor(() =>
      expect(useThemeStore.getState().theme.brand.colorPrimary).toBe("#00aa88"),
    );
  });

  it("保存失败时提示错误且不改变当前主题", async () => {
    mockedUpdate.mockRejectedValue(new Error("保存失败"));

    renderWithProviders(<ThemeSettings />, { route: "/settings/theme" });
    fireEvent.click(screen.getByTestId("theme-save"));

    await waitFor(() => expect(mockedUpdate).toHaveBeenCalled());
    expect(useThemeStore.getState().theme.brand.colorPrimary).toBe(
      DEFAULT_ADMIN_THEME.brand.colorPrimary,
    );
  });

  it("恢复默认需二次确认，并将主题重置", async () => {
    useThemeStore.setState({
      theme: {
        ...DEFAULT_ADMIN_THEME,
        brand: { ...DEFAULT_ADMIN_THEME.brand, colorPrimary: "#000000" },
      },
    });
    mockedReset.mockResolvedValue(DEFAULT_ADMIN_THEME as never);

    renderWithProviders(<ThemeSettings />, { route: "/settings/theme" });
    fireEvent.click(screen.getByTestId("theme-reset"));
    fireEvent.click(await screen.findByRole("button", { name: "确认重置" }));

    await waitFor(() => expect(mockedReset).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(useThemeStore.getState().theme.brand.colorPrimary).toBe(
        DEFAULT_ADMIN_THEME.brand.colorPrimary,
      ),
    );
  });
});
