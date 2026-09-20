import { beforeEach, describe, expect, it, vi } from "vitest";

import CareersOverviewPage from "@/pages/careers/CareersOverview";
import { deleteCareerCity, deleteCareerPosition, fetchCareerCities, fetchCareerPositions } from "@/services/careers";
import { fireEvent, renderWithProviders, screen, waitFor } from "@/test/utils";

vi.mock("@/services/careers", () => ({
  deleteCareerCity: vi.fn(),
  deleteCareerPosition: vi.fn(),
  fetchCareerCities: vi.fn(),
  fetchCareerPositions: vi.fn(),
}));

const mockedFetchCities = vi.mocked(fetchCareerCities);
const mockedFetchPositions = vi.mocked(fetchCareerPositions);
const mockedDeleteCity = vi.mocked(deleteCareerCity);
const mockedDeletePosition = vi.mocked(deleteCareerPosition);

const CITIES = [
  { id: "shanghai", name: "上海", nameEn: "Shanghai", code: "CT_125", summary: "集团总部", featured: true, positionsCount: 1 },
  { id: "shenzhen", name: "深圳", nameEn: "Shenzhen", code: "CT_128", summary: "华南中心", featured: false, positionsCount: 0 },
];
const POSITION = {
  id: "position-001",
  title: "广告优化师",
  cityId: "shanghai",
  extraCities: "",
  type: "全职",
  department: "投放中心",
  tags: "Meta",
  urgent: false,
  hot: true,
  publishedAt: "2026-01-01",
  summary: "负责投放优化",
  description: "",
  requirement: "",
  bonus: "",
  applyUrl: "",
};

beforeEach(() => {
  vi.clearAllMocks();
  mockedFetchCities.mockResolvedValue({ items: CITIES, total: 2, page: 1, pageSize: 100 });
  mockedFetchPositions.mockResolvedValue({ items: [POSITION], total: 1, page: 1, pageSize: 10 });
  mockedDeleteCity.mockResolvedValue({ id: "shanghai", success: true });
  mockedDeletePosition.mockResolvedValue({ id: "position-001", success: true });
});

describe("招聘管理总览", () => {
  it("L1 以表格渲染城市和职位列表", async () => {
    renderWithProviders(<CareersOverviewPage />, { route: "/careers" });
    expect(screen.getByTestId("page-title")).toHaveTextContent("招聘管理");
    expect(await screen.findByText("上海")).toBeInTheDocument();
    expect(screen.getByText("广告优化师")).toBeInTheDocument();
    expect(mockedFetchCities).toHaveBeenCalled();
    expect(mockedFetchPositions).toHaveBeenCalled();
  });

  it("L2 删除城市时传入其他城市作为职位回退城市", async () => {
    renderWithProviders(<CareersOverviewPage />, { route: "/careers" });
    await screen.findByText("上海");
    fireEvent.click(screen.getByRole("button", { name: "删除城市 上海" }));
    const confirmButtons = await screen.findAllByRole("button", { name: /删\s*除/ });
    fireEvent.click(confirmButtons[confirmButtons.length - 1]);
    await waitFor(() => expect(mockedDeleteCity).toHaveBeenCalledWith("shanghai", "shenzhen"));
  });

  it("L3 删除职位后刷新列表", async () => {
    renderWithProviders(<CareersOverviewPage />, { route: "/careers" });
    await screen.findByText("广告优化师");
    fireEvent.click(screen.getByRole("button", { name: "删除职位" }));
    const confirmButtons = await screen.findAllByRole("button", { name: /删\s*除/ });
    fireEvent.click(confirmButtons[confirmButtons.length - 1]);
    await waitFor(() => expect(mockedDeletePosition).toHaveBeenCalledWith("position-001"));
  });

  it("L4 新建城市使用对话框，不离开列表页", async () => {
    renderWithProviders(<CareersOverviewPage />, { route: "/careers" });
    fireEvent.click(screen.getByTestId("city-create"));

    expect(await screen.findByTestId("city-editor-dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("城市 ID（slug）")).toBeInTheDocument();
    expect(screen.getByTestId("page-title")).toHaveTextContent("招聘管理");
  });
});
