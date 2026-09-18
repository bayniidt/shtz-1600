import { beforeEach, describe, expect, it, vi } from "vitest";

import CareersContentPage from "@/pages/Content/CareersContent";
import { fetchCareersContent, saveCareersContent } from "@/services/content";
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

const mockedFetch = vi.mocked(fetchCareersContent);
const mockedSave = vi.mocked(saveCareersContent);

const CAREERS = {
  heroTitle: "加入 ADFLY",
  heroSubtitle: "与全球营销专家一起成长",
  heroDescription: "我们是一支专注出海的团队",
  citiesEyebrow: "OUR OFFICES",
  citiesTitle: "全球化办公地点",
  citiesDescription: "覆盖上海、深圳、北京等地",
  cultureTitle: "我们的文化",
  culture: [{ title: "客户为先", description: "从客户角度出发" }],
  benefitsTitle: "福利待遇",
  benefits: [{ group: "基础福利", items: "五险一金 / 年终奖金" }],
  jobsEyebrow: "OPEN POSITIONS",
  jobsTitle: "热招职位",
  portalUrl: "https://adflymobile.com/jobs",
  applyEmail: "hr@adflymobile.com",
  updatedAt: "2024-05-01T00:00:00.000Z",
};

beforeEach(() => {
  useDirtyStore.getState().reset();
  mockedFetch.mockReset();
  mockedSave.mockReset();
  mockedFetch.mockResolvedValue(CAREERS as never);
});

describe("招聘内容页", () => {
  it("P1 加载招聘文案并回填", async () => {
    renderWithProviders(<CareersContentPage />);

    expect(screen.getByTestId("page-title")).toHaveTextContent("招聘内容");
    await waitFor(() => expect(screen.getByLabelText("首屏标题")).toHaveValue(CAREERS.heroTitle));
    expect(screen.getByLabelText("招聘系统地址")).toHaveValue(CAREERS.portalUrl);
    expect(screen.getByLabelText("简历投递邮箱")).toHaveValue(CAREERS.applyEmail);
  });

  it("P2 保存文案时提交完整文档且不影响城市/职位", async () => {
    mockedSave.mockResolvedValue({ ...CAREERS, heroTitle: "加入我们" } as never);

    renderWithProviders(<CareersContentPage />);
    await waitFor(() => expect(screen.getByLabelText("首屏标题")).toHaveValue(CAREERS.heroTitle));

    fireEvent.change(screen.getByLabelText("首屏标题"), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText("首屏标题"), { target: { value: "加入我们" } });
    fireEvent.click(screen.getByTestId("content-save"));

    await waitFor(() => expect(mockedSave).toHaveBeenCalledTimes(1));
    const payload = mockedSave.mock.calls[0][0] as unknown as Record<string, unknown>;
    expect(payload.heroTitle).toBe("加入我们");
    expect(payload).not.toHaveProperty("cities");
    expect(payload).not.toHaveProperty("positions");
    expect(await screen.findByText("已保存")).toBeInTheDocument();
  });

  it("P3 可编辑文化与福利分组", async () => {
    mockedSave.mockResolvedValue(CAREERS as never);

    renderWithProviders(<CareersContentPage />);
    await waitFor(() => expect(screen.getByLabelText("首屏标题")).toHaveValue(CAREERS.heroTitle));

    fireEvent.click(screen.getByRole("button", { name: /添加分组/ }));
    const groups = screen.getAllByLabelText("分组名称");
    fireEvent.change(groups[groups.length - 1], { target: { value: "进阶福利" } });

    fireEvent.click(screen.getByTestId("content-save"));

    await waitFor(() => expect(mockedSave).toHaveBeenCalled());
    const payload = mockedSave.mock.calls[0][0] as unknown as { benefits: unknown[] };
    expect(payload.benefits).toHaveLength(2);
    expect(payload.benefits[1]).toMatchObject({ group: "进阶福利" });
  }, 60000);

  it("P4 加载失败展示错误提示", async () => {
    mockedFetch.mockRejectedValue(new Error("网络异常，请稍后重试"));

    renderWithProviders(<CareersContentPage />);

    expect(await screen.findByText("内容加载失败")).toBeInTheDocument();
  });

  it("P5 改动后出现未保存提示，保存成功后消失", async () => {
    mockedSave.mockResolvedValue(CAREERS as never);

    renderWithProviders(<CareersContentPage />);
    await waitFor(() => expect(screen.getByLabelText("首屏标题")).toHaveValue(CAREERS.heroTitle));

    fireEvent.change(screen.getByLabelText("首屏标题"), { target: { value: "！" } });
    expect(await screen.findByTestId("content-dirty-tip")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("content-save"));
    await waitFor(() => expect(mockedSave).toHaveBeenCalled());
    await waitFor(() => expect(screen.queryByTestId("content-dirty-tip")).not.toBeInTheDocument());
  });
});
