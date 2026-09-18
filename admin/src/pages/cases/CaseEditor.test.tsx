import { beforeEach, describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router-dom";

import CaseEditorPage from "@/pages/cases/CaseEditor";
import { createCase, fetchCase, updateCase } from "@/services/cases";
import { CASE_ITEM_FIXTURE } from "@/test/fixtures/content";
import { fireEvent, renderWithProviders, screen, waitFor } from "@/test/utils";

vi.mock("@/services/cases", () => ({
  createCase: vi.fn(),
  fetchCase: vi.fn(),
  updateCase: vi.fn(),
}));

const mockedCreateCase = vi.mocked(createCase);
const mockedFetchCase = vi.mocked(fetchCase);
const mockedUpdateCase = vi.mocked(updateCase);

function renderEditor(route: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/cases/new" element={<CaseEditorPage />} />
      <Route path="/cases/:id/edit" element={<CaseEditorPage />} />
      <Route path="/cases" element={null} />
    </Routes>,
    { route },
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedCreateCase.mockResolvedValue(CASE_ITEM_FIXTURE);
  mockedFetchCase.mockResolvedValue(CASE_ITEM_FIXTURE);
  mockedUpdateCase.mockResolvedValue(CASE_ITEM_FIXTURE);
});

describe("客户案例编辑页", () => {
  it("E1 新建案例可填写基本信息、stats 与 blocks 并提交", async () => {
    renderEditor("/cases/new");

    fireEvent.change(screen.getByLabelText("案例 ID（slug）"), { target: { value: "case-new" } });
    fireEvent.change(screen.getByLabelText("案例标题"), { target: { value: "新案例标题" } });
    fireEvent.change(screen.getByLabelText("客户名称"), { target: { value: "新客户" } });

    fireEvent.click(screen.getByRole("button", { name: /添加指标/ }));
    fireEvent.change(screen.getByLabelText("指标 1 数值"), { target: { value: "120" } });
    fireEvent.change(screen.getByLabelText("指标 1 说明"), { target: { value: "转化提升" } });

    fireEvent.click(screen.getByRole("button", { name: /添加板块/ }));
    fireEvent.change(screen.getByLabelText("板块 1 标识"), { target: { value: "result" } });
    fireEvent.change(screen.getByLabelText("板块 1 标题"), { target: { value: "项目成果" } });

    fireEvent.click(screen.getByTestId("case-save"));

    await waitFor(() => expect(mockedCreateCase).toHaveBeenCalledTimes(1));
    expect(mockedCreateCase).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "case-new",
        title: "新案例标题",
        client: "新客户",
        stats: [{ value: "120", unit: "", label: "转化提升" }],
        blocks: [{ key: "result", title: "项目成果", body: [], points: [] }],
      }),
    );
  });

  it("E2 编辑案例加载详情、修改标题并保存", async () => {
    renderEditor("/cases/case-001/edit");

    expect(await screen.findByDisplayValue("游戏出海长线买量")).toBeInTheDocument();
    expect(mockedFetchCase).toHaveBeenCalledWith("case-001");

    fireEvent.change(screen.getByLabelText("案例标题"), { target: { value: "改后的案例标题" } });
    fireEvent.click(screen.getByTestId("case-save"));

    await waitFor(() => expect(mockedUpdateCase).toHaveBeenCalledTimes(1));
    expect(mockedUpdateCase).toHaveBeenCalledWith(
      "case-001",
      expect.objectContaining({ id: "case-001", title: "改后的案例标题" }),
    );
  });

  it("E3 编辑页可打开前台预览", async () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    renderEditor("/cases/case-001/edit");

    await screen.findByDisplayValue("游戏出海长线买量");
    fireEvent.click(screen.getByRole("button", { name: /前台预览/ }));

    expect(open).toHaveBeenCalledWith("/cases/case-001", "_blank", "noopener");
    open.mockRestore();
  });

  it("E4 详情加载失败时展示错误提示", async () => {
    mockedFetchCase.mockRejectedValue(new Error("案例接口不可用"));
    renderEditor("/cases/missing/edit");

    expect(await screen.findByText("案例加载失败")).toBeInTheDocument();
    expect(screen.getByText("案例接口不可用")).toBeInTheDocument();
  });
});
