import { beforeEach, describe, expect, it, vi } from "vitest";

import SiteContentPage from "@/pages/Content/Site";
import { fetchSite, saveSite } from "@/services/content";
import { useDirtyStore } from "@/store/dirty";
import { fireEvent, renderWithProviders, screen, waitFor } from "@/test/utils";

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

const mockedFetch = vi.mocked(fetchSite);
const mockedSave = vi.mocked(saveSite);

const SITE = {
  name: "上海翼投智能科技有限公司",
  nameEn: "Shanghai ADFLY Intelligent Technology Co., Ltd.",
  logoText: "ADFLY",
  logoSub: "翼投智能",
  nav: [{ label: "服务与产品", href: "/" }],
  contactEmail: "master@adflymobile.com",
  businessEmail: "market@adflymobile.com",
  phone: "+86 21 5436 8877",
  address: "上海市徐汇区宜山路425号光启城710室",
  icp: "沪ICP备18047852号-1",
  seo: { title: "ADFLY 翼投智能", description: "全球化营销", keywords: "出海营销" },
  footerLinks: [{ label: "服务与产品", href: "/" }],
  updatedAt: "2024-05-01T00:00:00.000Z",
};

beforeEach(() => {
  useDirtyStore.getState().reset();
  mockedFetch.mockReset();
  mockedSave.mockReset();
  mockedFetch.mockResolvedValue(SITE as never);
});

describe("站点与导航页", () => {
  it("P1 加载站点配置并回填到表单", async () => {
    renderWithProviders(<SiteContentPage />);

    expect(screen.getByTestId("page-title")).toHaveTextContent("站点与导航");
    await waitFor(() => expect(screen.getByLabelText("公司名称")).toHaveValue(SITE.name));
    expect(screen.getByLabelText("英文名称")).toHaveValue(SITE.nameEn);
    expect(screen.getByLabelText("SEO 标题")).toHaveValue(SITE.seo.title);
    // 「文案」同时存在于导航与页脚链接中
    expect(screen.getAllByLabelText("文案")[0]).toHaveValue("服务与产品");
    expect(screen.getAllByLabelText("文案")).toHaveLength(2);
  });

  it("P2 保存时提交完整文档并提示成功", async () => {
    mockedSave.mockResolvedValue({ ...SITE, name: "ADFLY 新名称" } as never);

    renderWithProviders(<SiteContentPage />);
    await waitFor(() => expect(screen.getByLabelText("公司名称")).toHaveValue(SITE.name));

    fireEvent.change(screen.getByLabelText("公司名称"), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText("公司名称"), { target: { value: "ADFLY 新名称" } });
    fireEvent.click(screen.getByTestId("content-save"));

    await waitFor(() => expect(mockedSave).toHaveBeenCalledTimes(1));
    expect(mockedSave.mock.calls[0][0]).toMatchObject({
      name: "ADFLY 新名称",
      nav: SITE.nav,
      seo: SITE.seo,
      footerLinks: SITE.footerLinks,
    });
    expect(await screen.findByText("已保存")).toBeInTheDocument();
  });

  it("P3 加载失败展示错误提示且不渲染表单", async () => {
    mockedFetch.mockRejectedValue(new Error("网络异常，请稍后重试"));

    renderWithProviders(<SiteContentPage />);

    expect(await screen.findByText("内容加载失败")).toBeInTheDocument();
    expect(screen.queryByTestId("content-form")).not.toBeInTheDocument();
  });

  it("P4 保存接口报错时提示后端错误且保留用户输入", async () => {
    mockedSave.mockRejectedValue(new Error("参数校验失败"));

    renderWithProviders(<SiteContentPage />);
    await waitFor(() => expect(screen.getByLabelText("公司名称")).toHaveValue(SITE.name));

    fireEvent.change(screen.getByLabelText("公司名称"), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText("公司名称"), { target: { value: "待保存" } });
    fireEvent.click(screen.getByTestId("content-save"));

    expect(await screen.findByText("参数校验失败")).toBeInTheDocument();
    expect(screen.getByLabelText("公司名称")).toHaveValue("待保存");
  });

  it("P5 可新增页脚链接并随表单一起提交", async () => {
    mockedSave.mockResolvedValue(SITE as never);

    renderWithProviders(<SiteContentPage />);
    await waitFor(() => expect(screen.getByLabelText("公司名称")).toHaveValue(SITE.name));

    fireEvent.click(screen.getByRole("button", { name: /添加页脚链接/ }));

    const labels = screen.getAllByLabelText("文案");
    const hrefs = screen.getAllByLabelText("链接");
    fireEvent.change(labels[labels.length - 1], { target: { value: "隐私政策" } });
    fireEvent.change(hrefs[hrefs.length - 1], { target: { value: "/privacy" } });

    fireEvent.click(screen.getByTestId("content-save"));

    await waitFor(() => expect(mockedSave).toHaveBeenCalled());
    const payload = mockedSave.mock.calls[0][0] as unknown as { footerLinks: unknown[] };
    expect(payload.footerLinks).toHaveLength(2);
    expect(payload.footerLinks[1]).toMatchObject({ label: "隐私政策", href: "/privacy" });
  }, 60000);

  it("P6 必填字段为空（如导航链接）时阻止提交并提示", async () => {

    renderWithProviders(<SiteContentPage />);
    await waitFor(() => expect(screen.getByLabelText("公司名称")).toHaveValue(SITE.name));

    fireEvent.click(screen.getByRole("button", { name: /添加导航项/ }));
    fireEvent.click(screen.getByTestId("content-save"));

    expect(await screen.findByText("文案不能为空")).toBeInTheDocument();
    expect(mockedSave).not.toHaveBeenCalled();
  }, 60000);
});
