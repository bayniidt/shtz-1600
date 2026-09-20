import { beforeEach, describe, expect, it, vi } from "vitest";

import Dashboard from "@/pages/Dashboard";
import { fetchDashboardStats } from "@/services/dashboard";
import { renderWithProviders, screen } from "@/test/utils";

vi.mock("@/services/dashboard", () => ({
  fetchDashboardStats: vi.fn(),
}));

const mockedFetchDashboardStats = vi.mocked(fetchDashboardStats);

beforeEach(() => {
  vi.clearAllMocks();
  mockedFetchDashboardStats.mockResolvedValue({ cases: 8, cities: 7, positions: 79, hot: 9 });
});

describe("概览页", () => {
  it("加载并展示实时统计数据", async () => {
    renderWithProviders(<Dashboard />);

    expect(await screen.findByText("数据统计来自实时接口")).toBeInTheDocument();
    expect(await screen.findByText("8")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("79")).toBeInTheDocument();
    expect(screen.getByText("9")).toBeInTheDocument();
    expect(mockedFetchDashboardStats).toHaveBeenCalledTimes(1);
  });

  it("统计接口失败时展示错误状态而不是伪造 0", async () => {
    mockedFetchDashboardStats.mockRejectedValue(new Error("统计服务不可用"));

    renderWithProviders(<Dashboard />);

    expect(await screen.findByText("统计数据加载失败")).toBeInTheDocument();
    expect(screen.getAllByText("—")).toHaveLength(4);
  });
});
