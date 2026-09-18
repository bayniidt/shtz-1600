import { beforeEach, describe, expect, it, vi } from "vitest";

import AboutContentPage from "@/pages/Content/About";
import { fetchAbout, saveAbout } from "@/services/content";
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

const mockedFetch = vi.mocked(fetchAbout);
const mockedSave = vi.mocked(saveAbout);

const ABOUT = {
  heroEyebrow: "ABOUT ADFLY",
  heroTitle: "全球成功，从这里开始",
  heroDescription: "上海翼投智能科技有限公司成立于 2017 年",
  stats: [{ value: "2017", unit: "年", label: "公司成立" }],
  visionTitle: "用数智有效联结 中国企业和全球消费者",
  visionText: "我们拥有 ADFLYMIND 数字化广告系统",
  values: [{ title: "使命", description: "帮助客户走向全球" }],
  timeline: [{ period: "2017", title: "ADFLY 正式成立", description: "组建出海效果营销团队" }],
  team: [{ name: "莫夏芸", role: "董事长 / CEO", bio: "连续创业者", avatar: "/images/adfly/new_team_1.png" }],
  teamIntro: "核心成员来自于猎豹、网易、恺英",
  offices: [{ city: "上海", label: "总部", address: "上海市徐汇区宜山路425号" }],
  updatedAt: "2024-05-01T00:00:00.000Z",
};

beforeEach(() => {
  useDirtyStore.getState().reset();
  mockedFetch.mockReset();
  mockedSave.mockReset();
  mockedFetch.mockResolvedValue(ABOUT as never);
});

describe("关于我们页", () => {
  it("P1 加载内容并回填核心字段", async () => {
    renderWithProviders(<AboutContentPage />);

    expect(screen.getByTestId("page-title")).toHaveTextContent("关于我们");
    await waitFor(() => expect(screen.getByLabelText("主标题")).toHaveValue(ABOUT.heroTitle));
    expect(screen.getByLabelText("愿景标题")).toHaveValue(ABOUT.visionTitle);
    expect(screen.getByLabelText("姓名")).toHaveValue("莫夏芸");
    expect(screen.getByLabelText("城市")).toHaveValue("上海");
  });

  it("P2 保存时提交完整文档", async () => {
    mockedSave.mockResolvedValue({ ...ABOUT, heroTitle: "新标题" } as never);

    renderWithProviders(<AboutContentPage />);
    await waitFor(() => expect(screen.getByLabelText("主标题")).toHaveValue(ABOUT.heroTitle));

    fireEvent.change(screen.getByLabelText("主标题"), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText("主标题"), { target: { value: "新标题" } });
    fireEvent.click(screen.getByTestId("content-save"));

    await waitFor(() => expect(mockedSave).toHaveBeenCalledTimes(1));
    expect(mockedSave.mock.calls[0][0]).toMatchObject({ heroTitle: "新标题", team: ABOUT.team });
    expect(await screen.findByText("已保存")).toBeInTheDocument();
  });

  it("P3 可添加团队与里程碑条目", async () => {
    mockedSave.mockResolvedValue(ABOUT as never);

    renderWithProviders(<AboutContentPage />);
    await waitFor(() => expect(screen.getByLabelText("主标题")).toHaveValue(ABOUT.heroTitle));

    fireEvent.click(screen.getByRole("button", { name: /添加成员/ }));
    fireEvent.click(screen.getByRole("button", { name: /添加里程碑/ }));

    const names = screen.getAllByLabelText("姓名");
    fireEvent.change(names[names.length - 1], { target: { value: "新成员" } });
    const titles = screen.getAllByLabelText("标题");
    fireEvent.change(titles[titles.length - 1], { target: { value: "2024 里程碑" } });

    fireEvent.click(screen.getByTestId("content-save"));

    await waitFor(() => expect(mockedSave).toHaveBeenCalled());
    const payload = mockedSave.mock.calls[0][0] as unknown as { team: unknown[]; timeline: unknown[] };
    expect(payload.team).toHaveLength(2);
    expect(payload.timeline).toHaveLength(2);
    expect(payload.team[1]).toMatchObject({ name: "新成员" });
  }, 120000);

  it("P4 加载失败展示错误提示", async () => {
    mockedFetch.mockRejectedValue(new Error("网络异常，请稍后重试"));

    renderWithProviders(<AboutContentPage />);

    expect(await screen.findByText("内容加载失败")).toBeInTheDocument();
    expect(screen.queryByTestId("content-form")).not.toBeInTheDocument();
  });

  it("P5 保存失败展示提示且保留表单内容", async () => {
    mockedSave.mockRejectedValue(new Error("参数校验失败"));

    renderWithProviders(<AboutContentPage />);
    await waitFor(() => expect(screen.getByLabelText("主标题")).toHaveValue(ABOUT.heroTitle));

    fireEvent.change(screen.getByLabelText("主标题"), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText("主标题"), { target: { value: "未保存标题" } });
    fireEvent.click(screen.getByTestId("content-save"));

    expect(await screen.findByText("参数校验失败")).toBeInTheDocument();
    expect(screen.getByLabelText("主标题")).toHaveValue("未保存标题");
  });
});
