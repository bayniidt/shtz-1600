import { beforeEach, describe, expect, it, vi } from "vitest";

import HomeContentPage from "@/pages/Content/Home";
import { fetchHome, saveHomeSection } from "@/services/content";
import { useDirtyStore } from "@/store/dirty";
import { fireEvent, renderWithProviders, screen, waitFor, within } from "@/test/utils";

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

const mockedFetchHome = vi.mocked(fetchHome);
const mockedSaveSection = vi.mocked(saveHomeSection);

const HOME = {
  hero: {
    eyebrow: "GLOBAL AI-POWERED MARTECH SOLUTIONS",
    title: "全球智能营销科技服务商",
    titleEn: "GLOBAL AI-POWERED MARTECH SOLUTIONS",
    description: "Facebook、Google、TikTok 等 50+ 资源",
    primaryCta: { label: "免费开户", href: "/cases" },
    secondaryCta: { label: "预约咨询", href: "#contact" },
    marquee: ["Facebook", "Google"],
    stats: [{ value: "2017", label: "成立年份" }],
  },
  media: {
    title: "覆盖全球 50+ 海外主流媒体资源",
    subtitle: "TikTok、Google 官方一级代理",
    benefits: [{ title: "官方认证代理资质", description: "Meta、Google 等" }],
    partners: [{ name: "SmartNews", mark: "Smartnews", category: "Content" }],
    cta: { label: "立即开户", href: "#contact" },
  },
  flow: {
    eyebrow: "FLOW AI SYSTEM",
    title: "AI 智能广告系统",
    description: "滚动查看四大能力",
    orbit: [{ label: "大模型" }],
    features: [{ title: "一键生成广告素材", mark: "Flow Creative", description: "智能解析", points: "解析 / 提炼" }],
    cta: { label: "马上体验", href: "#contact" },
  },
  clients: {
    title: "10000+ 客户选择",
    subtitle: "覆盖游戏、APP、电商",
    industries: [{ key: "ecommerce", name: "电商", description: "全链路增长", stat: "单日增量突破 10000 人次" }],
    logos: [{ name: "4399游戏", industry: "game" }],
  },
  strength: {
    title: "让出海，更简单！",
    description: "专注于效果类营销解决方案",
    nodes: [{ city: "总部上海", role: "全球总部", x: "82", y: "42", major: "yes" }],
    stats: [{ value: "2017", suffix: "", label: "成立年份" }],
    cta: { label: "联系我们", href: "#contact" },
  },
  honors: {
    title: "企业荣誉 实力见证",
    subtitle: "权威资质与行业认可",
    groups: [{ key: "qualification", title: "权威资质", items: [{ title: "国家高新技术企业", issuer: "国家级", year: "2021" }] }],
  },
  updatedAt: "2024-05-01T00:00:00.000Z",
};

beforeEach(() => {
  useDirtyStore.getState().reset();
  mockedFetchHome.mockReset();
  mockedSaveSection.mockReset();
  mockedFetchHome.mockResolvedValue(HOME as never);
});

describe("首页内容页", () => {
  it("H1 渲染 6 个板块 Tab 并默认展示 Hero 区", async () => {
    renderWithProviders(<HomeContentPage />);

    expect(screen.getByTestId("page-title")).toHaveTextContent("首页内容");
    for (const label of ["Hero 区", "媒体资源区", "Flow AI 区", "客户选择区", "公司实力区", "企业荣誉区"]) {
      expect(screen.getByRole("tab", { name: label })).toBeInTheDocument();
    }

    await waitFor(() => expect(screen.getByLabelText("主标题")).toHaveValue(HOME.hero.title));
    expect(screen.getByLabelText("眉标（英文短语）")).toHaveValue(HOME.hero.eyebrow);
    expect(screen.getByDisplayValue("Facebook")).toBeInTheDocument();
  });

  it("H2 按板块局部保存：仅提交当前 Tab 并调用对应接口", async () => {
    mockedSaveSection.mockResolvedValue(HOME as never);

    renderWithProviders(<HomeContentPage />);
    await waitFor(() => expect(screen.getByLabelText("主标题")).toHaveValue(HOME.hero.title));

    fireEvent.change(screen.getByLabelText("主标题"), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText("主标题"), { target: { value: "新的首屏标题" } });
    const heroPanel = screen.getByTestId("home-hero");
    fireEvent.click(within(heroPanel).getByTestId("content-save"));

    await waitFor(() => expect(mockedSaveSection).toHaveBeenCalledTimes(1));
    expect(mockedSaveSection.mock.calls[0][0]).toBe("hero");
    expect(mockedSaveSection.mock.calls[0][1]).toMatchObject({ title: "新的首屏标题" });
    expect(await screen.findByText("已保存")).toBeInTheDocument();
  });

  it("H3 切换到其他板块可分别编辑与保存", async () => {
    mockedSaveSection.mockResolvedValue(HOME as never);

    renderWithProviders(<HomeContentPage />);
    await waitFor(() => expect(screen.getByLabelText("主标题")).toHaveValue(HOME.hero.title));

    fireEvent.click(screen.getByRole("tab", { name: "媒体资源区" }));
    const panel = await screen.findByTestId("home-media");
    await waitFor(() => expect(within(panel).getAllByLabelText("标题")[0]).toHaveValue(HOME.media.title));

    fireEvent.click(within(panel).getByRole("button", { name: /添加媒体/ }));
    fireEvent.change(within(panel).getAllByLabelText("名称")[1], { target: { value: "Bing" } });
    fireEvent.click(within(panel).getByTestId("content-save"));

    await waitFor(() => expect(mockedSaveSection).toHaveBeenCalled());
    expect(mockedSaveSection.mock.calls[0][0]).toBe("media");
    const payload = mockedSaveSection.mock.calls[0][1] as unknown as { partners: unknown[] };
    expect(payload.partners).toHaveLength(2);
  }, 90000);

  it("H4 不同板块的未保存状态互不覆盖（可同时登记）", async () => {

    renderWithProviders(<HomeContentPage />);
    await waitFor(() => expect(screen.getByLabelText("主标题")).toHaveValue(HOME.hero.title));

    fireEvent.change(screen.getByLabelText("主标题"), { target: { value: "改过的首屏标题" } });
    expect(Object.values(useDirtyStore.getState().entries)).toContain("首页内容 · Hero 区");

    fireEvent.click(screen.getByRole("tab", { name: "企业荣誉区" }));
    const honorsPanel = await screen.findByTestId("home-honors");
    await waitFor(() => expect(within(honorsPanel).getByLabelText("标题")).toHaveValue(HOME.honors.title));

    fireEvent.change(within(honorsPanel).getByLabelText("标题"), { target: { value: "新的荣誉标题" } });
    expect(Object.values(useDirtyStore.getState().entries)).toEqual(
      expect.arrayContaining(["首页内容 · Hero 区", "首页内容 · 企业荣誉区"]),
    );
  }, 60000);

  it("H5 加载失败展示错误提示，重试会重新请求", async () => {
    mockedFetchHome.mockRejectedValueOnce(new Error("网络异常，请稍后重试"));

    renderWithProviders(<HomeContentPage />);

    expect(await screen.findByText("内容加载失败")).toBeInTheDocument();

    mockedFetchHome.mockResolvedValue(HOME as never);
    fireEvent.click(screen.getByTestId("content-retry"));

    await waitFor(() => expect(screen.getByLabelText("主标题")).toHaveValue(HOME.hero.title));
    expect(mockedFetchHome).toHaveBeenCalledTimes(2);
  });

  it("H6 保存失败时展示后端错误信息", async () => {
    mockedSaveSection.mockRejectedValue(new Error("参数校验失败"));

    renderWithProviders(<HomeContentPage />);
    await waitFor(() => expect(screen.getByLabelText("主标题")).toHaveValue(HOME.hero.title));

    fireEvent.click(within(screen.getByTestId("home-hero")).getByTestId("content-save"));

    expect(await screen.findByText("参数校验失败")).toBeInTheDocument();
  });
});
