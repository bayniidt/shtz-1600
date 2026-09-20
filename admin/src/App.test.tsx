import { beforeEach, describe, expect, it, vi } from "vitest";

import App, { AppRoutes } from "@/App";
import { MODULE_BLUEPRINTS } from "@/config/endpoints";
import { fetchMe, login } from "@/services/auth";
import { fetchAbout, fetchCareersContent, fetchHome, fetchSite } from "@/services/content";
import { fetchTheme } from "@/services/settings";
import { fetchCareerCities, fetchCareerPositions } from "@/services/careers";
import {
  ABOUT_FIXTURE,
  CAREERS_CONTENT_FIXTURE,
  HOME_FIXTURE,
  SITE_FIXTURE,
} from "@/test/fixtures/content";
import { useAuthStore } from "@/store/auth";
import { fireEvent, renderWithProviders, render, screen, userEvent, waitFor } from "@/test/utils";

vi.mock("@/services/auth", () => ({
  login: vi.fn(),
  logout: vi.fn(),
  fetchMe: vi.fn(),
}));

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

vi.mock("@/services/careers", () => ({
  fetchCareerCities: vi.fn(),
  fetchCareerPositions: vi.fn(),
}));

const mockedLogin = vi.mocked(login);
const mockedFetchMe = vi.mocked(fetchMe);
const mockedFetchTheme = vi.mocked(fetchTheme);
const mockedFetchSite = vi.mocked(fetchSite);
const mockedFetchHome = vi.mocked(fetchHome);
const mockedFetchAbout = vi.mocked(fetchAbout);
const mockedFetchCareersContent = vi.mocked(fetchCareersContent);
const mockedFetchCareerCities = vi.mocked(fetchCareerCities);
const mockedFetchCareerPositions = vi.mocked(fetchCareerPositions);

const ADMIN = { id: "1", username: "admin", role: "admin" };

function signInAsAdmin() {
  localStorage.setItem("adfly_admin_token", "test-token");
  useAuthStore.setState({ token: "test-token", user: ADMIN, ready: true, signingIn: false });
}

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({ token: null, user: null, ready: true, signingIn: false });
  mockedFetchTheme.mockResolvedValue({});
  mockedFetchMe.mockResolvedValue({ user: ADMIN } as never);
  mockedFetchSite.mockResolvedValue(SITE_FIXTURE as never);
  mockedFetchHome.mockResolvedValue(HOME_FIXTURE as never);
  mockedFetchAbout.mockResolvedValue(ABOUT_FIXTURE as never);
  mockedFetchCareersContent.mockResolvedValue(CAREERS_CONTENT_FIXTURE as never);
  mockedFetchCareerCities.mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 100 });
  mockedFetchCareerPositions.mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 10 });
});

describe("菜单路由（每个菜单路由都能正常渲染）", () => {
  /** 已实现的管理页路由 */
  const IMPLEMENTED_ROUTES = [
    ["/content", "内容管理"],
    ["/careers", "招聘管理"],
    ["/settings/theme", "主题设置"],
  ] as const;

  /** Stage 2 已实现的内容编辑页（真实表单） */
  const CONTENT_ROUTES = [
    ["/content/site", MODULE_BLUEPRINTS.site.title],
    ["/content/home", MODULE_BLUEPRINTS.home.title],
    ["/content/about", MODULE_BLUEPRINTS.about.title],
    ["/content/careers", MODULE_BLUEPRINTS.careersContent.title],
  ] as const;

  it.each(IMPLEMENTED_ROUTES)("R %s 渲染页面标题「%s」且无空白页", (route, expected) => {
    signInAsAdmin();
    renderWithProviders(<AppRoutes />, { route });

    expect(screen.getByTestId("page-container")).toBeInTheDocument();
    expect(screen.getByTestId("page-title")).toHaveTextContent(expected);
  });

  it.each(CONTENT_ROUTES)("R %s 渲染内容编辑页「%s」并加载表单", async (route, expected) => {
    signInAsAdmin();
    renderWithProviders(<AppRoutes />, { route });

    expect(screen.getByTestId("page-container")).toBeInTheDocument();
    expect(screen.getByTestId("page-title")).toHaveTextContent(expected);
    await waitFor(() => expect(screen.getByTestId("content-form")).toBeInTheDocument());
    expect(screen.getByTestId("content-save")).toBeInTheDocument();
  });

  it("R /cases 渲染 Cases 列表页", async () => {
    signInAsAdmin();
    renderWithProviders(<AppRoutes />, { route: "/cases" });

    expect(screen.getByTestId("case-list")).toBeInTheDocument();
    expect(screen.getByTestId("page-title")).toHaveTextContent(MODULE_BLUEPRINTS.cases.title);
  });

  it("R /content 以表格展示内容模块，编辑在对话框内完成", async () => {
    signInAsAdmin();
    renderWithProviders(<AppRoutes />, { route: "/content" });

    expect(screen.getByTestId("content-management")).toBeInTheDocument();
    expect(screen.getByTestId("content-edit-site")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("content-edit-site"));

    expect(await screen.findByTestId("content-edit-dialog")).toBeInTheDocument();
    expect(await screen.findByTestId("content-form")).toBeInTheDocument();
    expect(screen.getByTestId("content-cancel")).toBeInTheDocument();
    expect(screen.getByTestId("content-save")).toBeInTheDocument();
  });

  it("R /dashboard 渲染概览卡片与快捷入口", () => {
    signInAsAdmin();
    renderWithProviders(<AppRoutes />, { route: "/dashboard" });
    expect(screen.getByText("快捷入口")).toBeInTheDocument();
    expect(screen.getByText(/你好，admin/)).toBeInTheDocument();
  });

  it("R 未知路径渲染 404 页面", () => {
    signInAsAdmin();
    renderWithProviders(<AppRoutes />, { route: "/not-exist" });
    expect(screen.getByText("页面不存在")).toBeInTheDocument();
  });

  it("R 未登录访问后台路由会跳转登录页", () => {
    renderWithProviders(<AppRoutes />, { route: "/cases" });
    expect(screen.getByText("管理后台 · Admin Console")).toBeInTheDocument();
    expect(screen.queryByTestId("page-container")).not.toBeInTheDocument();
  });

  it("R 根路径重定向到概览", () => {
    signInAsAdmin();
    renderWithProviders(<AppRoutes />, { route: "/" });
    expect(screen.getByText("快捷入口")).toBeInTheDocument();
  });
});

describe("登录流程", () => {
  it("L 登录成功后进入概览并写入会话", async () => {
    const user = userEvent.setup();
    mockedLogin.mockResolvedValue({ accessToken: "jwt-1", user: ADMIN } as never);

    renderWithProviders(<AppRoutes />, { route: "/login" });

    await user.type(screen.getByLabelText("用户名"), "admin");
    await user.type(screen.getByLabelText("密码"), "admin");
    await user.click(screen.getByRole("button", { name: /登\s*录/ }));

    await waitFor(() => expect(mockedLogin).toHaveBeenCalledWith({ username: "admin", password: "admin" }));
    await waitFor(() => expect(screen.getByText("快捷入口")).toBeInTheDocument());
    expect(useAuthStore.getState().token).toBe("jwt-1");
    expect(localStorage.getItem("adfly_admin_token")).toBe("jwt-1");
  });
  it("L 登录失败时停留在登录页并清除会话", async () => {
    const user = userEvent.setup();
    mockedLogin.mockRejectedValue(new Error("用户名或密码错误"));

    renderWithProviders(<AppRoutes />, { route: "/login" });

    await user.type(screen.getByLabelText("用户名"), "admin");
    await user.type(screen.getByLabelText("密码"), "wrong");
    await user.click(screen.getByRole("button", { name: /登\s*录/ }));

    await waitFor(() => expect(mockedLogin).toHaveBeenCalled());
    expect(screen.getByText("管理后台 · Admin Console")).toBeInTheDocument();
    expect(useAuthStore.getState().token).toBeNull();
  });

  it("L 已登录访问登录页会重定向到概览", () => {
    signInAsAdmin();
    renderWithProviders(<AppRoutes />, { route: "/login" });
    expect(screen.getByText("快捷入口")).toBeInTheDocument();
  });
});

describe("App 根组件（BrowserRouter + 主题/会话初始化）", () => {
  it("A 启动时加载主题与会话，并渲染概览页", async () => {
    signInAsAdmin();
    useAuthStore.setState({ token: "test-token", user: ADMIN, ready: false });

    render(<App />);

    await waitFor(() => expect(mockedFetchTheme).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mockedFetchMe).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByText("快捷入口")).toBeInTheDocument());
  });

  it("A 主题接口失败时回退默认主题，页面仍可渲染", async () => {
    signInAsAdmin();
    mockedFetchTheme.mockRejectedValue(new Error("network"));

    render(<App />);

    await waitFor(() => expect(mockedFetchTheme).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText("快捷入口")).toBeInTheDocument());
  });
});
