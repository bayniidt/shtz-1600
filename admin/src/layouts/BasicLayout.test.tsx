import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppRoutes } from "@/App";
import { fetchAbout, fetchHome, fetchSite } from "@/services/content";
import { fetchMe } from "@/services/auth";
import { fetchTheme } from "@/services/settings";
import { ABOUT_FIXTURE, HOME_FIXTURE, SITE_FIXTURE } from "@/test/fixtures/content";
import { useAuthStore } from "@/store/auth";
import { useDirtyStore } from "@/store/dirty";
import { fireEvent, renderWithProviders, screen, waitFor } from "@/test/utils";

vi.mock("@/services/auth", () => ({ login: vi.fn(), logout: vi.fn(), fetchMe: vi.fn() }));

vi.mock("@/services/settings", () => ({
  fetchTheme: vi.fn(),
  updateTheme: vi.fn(),
  resetTheme: vi.fn(),
}));

vi.mock("@/services/content", () => ({
  fetchSite: vi.fn(),
  saveSite: vi.fn(),
  fetchHome: vi.fn(),
  saveHomeSection: vi.fn(),
  fetchAbout: vi.fn(),
  saveAbout: vi.fn(),
  fetchCareersContent: vi.fn(),
  saveCareersContent: vi.fn(),
}));

const mockedFetchSite = vi.mocked(fetchSite);
const mockedFetchHome = vi.mocked(fetchHome);
const mockedFetchAbout = vi.mocked(fetchAbout);

const ADMIN = { id: "1", username: "admin", role: "admin" };

beforeEach(() => {
  useDirtyStore.getState().reset();
  localStorage.clear();
  localStorage.setItem("adfly_admin_token", "test-token");
  useAuthStore.setState({ token: "test-token", user: ADMIN, ready: true, signingIn: false });
  vi.mocked(fetchTheme).mockResolvedValue({});
  vi.mocked(fetchMe).mockResolvedValue({ user: ADMIN } as never);
  mockedFetchSite.mockResolvedValue(SITE_FIXTURE as never);
  mockedFetchHome.mockResolvedValue(HOME_FIXTURE as never);
  mockedFetchAbout.mockResolvedValue(ABOUT_FIXTURE as never);
});

describe("BasicLayout 未保存修改拦截", () => {
  it("B1 无未保存修改时菜单直接跳转", async () => {
    renderWithProviders(<AppRoutes />, { route: "/content/site" });
    await waitFor(() => expect(screen.getByLabelText("公司名称")).toHaveValue(SITE_FIXTURE.name));

    fireEvent.click(screen.getByRole("menuitem", { name: /概览/ }));

    await waitFor(() => expect(screen.getByText("快捷入口")).toBeInTheDocument());
    expect(screen.queryByText("有未保存的修改")).not.toBeInTheDocument();
  });

  it("B2 有未保存修改时弹出确认框，取消后停留在本页", async () => {
    renderWithProviders(<AppRoutes />, { route: "/content/site" });
    await waitFor(() => expect(screen.getByLabelText("公司名称")).toHaveValue(SITE_FIXTURE.name));

    fireEvent.change(screen.getByLabelText("公司名称"), { target: { value: "改动过的名称" } });
    fireEvent.click(screen.getByRole("menuitem", { name: /概览/ }));

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent("有未保存的修改");
    expect(dialog).toHaveTextContent("站点与导航离开当前页面将丢失未保存的内容");

    fireEvent.click(screen.getByRole("button", { name: "留在本页" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByTestId("page-title")).toHaveTextContent("站点与导航");
    expect(screen.getByLabelText("公司名称")).toHaveValue("改动过的名称");
  });

  it("B3 确认放弃后跳转，并清掉未保存登记", async () => {
    renderWithProviders(<AppRoutes />, { route: "/content/site" });
    await waitFor(() => expect(screen.getByLabelText("公司名称")).toHaveValue(SITE_FIXTURE.name));

    fireEvent.change(screen.getByLabelText("公司名称"), { target: { value: "改动过的名称" } });
    fireEvent.click(screen.getByRole("menuitem", { name: /概览/ }));
    fireEvent.click(await screen.findByRole("button", { name: "放弃修改并离开" }));

    await waitFor(() => expect(screen.getByText("快捷入口")).toBeInTheDocument());
    expect(Object.values(useDirtyStore.getState().entries)).toHaveLength(0);
  });

  it("B4 从旧内容编辑地址点击内容管理会回到总览", async () => {
    renderWithProviders(<AppRoutes />, { route: "/content/site" });
    await waitFor(() => expect(screen.getByLabelText("公司名称")).toHaveValue(SITE_FIXTURE.name));

    fireEvent.change(screen.getByLabelText("公司名称"), { target: { value: "改动过的名称" } });
    fireEvent.click(screen.getByRole("menuitem", { name: /内容管理/ }));

    expect(await screen.findByRole("dialog")).toHaveTextContent("有未保存的修改");
    fireEvent.click(screen.getByRole("button", { name: "放弃修改并离开" }));
    await waitFor(() => expect(screen.getByTestId("page-title")).toHaveTextContent("内容管理"));
  });
});
