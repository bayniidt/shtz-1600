import { beforeEach, describe, expect, it, vi } from "vitest";

import CaseListPage from "@/pages/cases/CaseList";
import { deleteCase, fetchCases, toggleCaseFeatured } from "@/services/cases";
import { CASE_ITEM_FIXTURE, CASE_ITEMS_FIXTURE } from "@/test/fixtures/content";
import { fireEvent, renderWithProviders, screen, waitFor } from "@/test/utils";

vi.mock("@/services/cases", () => ({
  fetchCases: vi.fn(),
  deleteCase: vi.fn(),
  toggleCaseFeatured: vi.fn(),
}));

const mockedFetchCases = vi.mocked(fetchCases);
const mockedDeleteCase = vi.mocked(deleteCase);
const mockedToggleCaseFeatured = vi.mocked(toggleCaseFeatured);

const LIST_RESULT = { items: CASE_ITEMS_FIXTURE, total: 2, page: 1, pageSize: 10 };

beforeEach(() => {
  vi.clearAllMocks();
  mockedFetchCases.mockResolvedValue(LIST_RESULT);
  mockedDeleteCase.mockResolvedValue({ id: "case-001", success: true });
  mockedToggleCaseFeatured.mockResolvedValue({ ...CASE_ITEM_FIXTURE, featured: false });
});

describe("客户案例列表页", () => {
  it("L1 渲染列表并展示标题、客户与行业", async () => {
    renderWithProviders(<CaseListPage />, { route: "/cases" });

    expect(screen.getByTestId("page-title")).toHaveTextContent("客户案例");
    expect(screen.getByTestId("case-create")).toBeInTheDocument();

    expect(await screen.findByText("游戏出海长线买量")).toBeInTheDocument();
    expect(screen.getByText("电商独立站增长")).toBeInTheDocument();
    expect(screen.getByText("测试游戏")).toBeInTheDocument();
    expect(mockedFetchCases).toHaveBeenCalledTimes(1);
  });

  it("L2 点击「取消置顶」切换 featured 并刷新列表", async () => {
    renderWithProviders(<CaseListPage />, { route: "/cases" });

    const toggle = await screen.findByRole("button", { name: "取消置顶" });
    fireEvent.click(toggle);

    await waitFor(() => expect(mockedToggleCaseFeatured).toHaveBeenCalledWith("case-001", false));
    await waitFor(() => expect(mockedFetchCases).toHaveBeenCalledTimes(2));
  });

  it("L3 删除案例前弹确认，确认后调用删除接口并刷新", async () => {
    renderWithProviders(<CaseListPage />, { route: "/cases" });

    const deleteButtons = await screen.findAllByRole("button", { name: /删\s*除/ });
    fireEvent.click(deleteButtons[0]);

    expect(await screen.findByText("确认删除该案例？")).toBeInTheDocument();

    const confirmButtons = await screen.findAllByRole("button", { name: /删\s*除/ });
    fireEvent.click(confirmButtons[confirmButtons.length - 1]);

    await waitFor(() => expect(mockedDeleteCase).toHaveBeenCalledWith("case-001"));
    await waitFor(() => expect(mockedFetchCases).toHaveBeenCalledTimes(2));
  });

  it("L4 加载失败时 ProTable 展示空态且不崩溃", async () => {
    mockedFetchCases.mockRejectedValue(new Error("网络异常"));
    renderWithProviders(<CaseListPage />, { route: "/cases" });

    // ProTable 请求失败仍应渲染表格容器
    expect(await screen.findByTestId("page-title")).toHaveTextContent("客户案例");
    expect(screen.getByTestId("case-list")).toBeInTheDocument();
  });

  it("L5 新建案例使用对话框，不跳转到独立编辑页", async () => {
    renderWithProviders(<CaseListPage />, { route: "/cases" });
    fireEvent.click(screen.getByTestId("case-create"));

    expect(await screen.findByTestId("case-editor-dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("案例 ID（slug）")).toBeInTheDocument();
    expect(screen.getByTestId("case-save")).toBeInTheDocument();
    expect(screen.getByTestId("page-title")).toHaveTextContent("客户案例");
  });
});
