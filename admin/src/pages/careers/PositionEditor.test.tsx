import { beforeEach, describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router-dom";

import PositionEditorPage from "@/pages/careers/PositionEditor";
import { createCareerPosition, fetchCareerCities, fetchCareerPosition, updateCareerPosition } from "@/services/careers";
import { fireEvent, renderWithProviders, screen, waitFor } from "@/test/utils";

vi.mock("@/services/careers", () => ({
  createCareerPosition: vi.fn(),
  fetchCareerCities: vi.fn(),
  fetchCareerPosition: vi.fn(),
  updateCareerPosition: vi.fn(),
}));

const mockedCreate = vi.mocked(createCareerPosition);
const mockedFetchCities = vi.mocked(fetchCareerCities);
const mockedFetchPosition = vi.mocked(fetchCareerPosition);
const mockedUpdate = vi.mocked(updateCareerPosition);
const CITY = { id: "shanghai", name: "上海", nameEn: "Shanghai", code: "CT_125", summary: "总部", featured: true };
const POSITION = {
  id: "position-001", title: "广告优化师", cityId: "shanghai", extraCities: "", type: "全职", department: "投放中心",
  tags: "Meta", urgent: false, hot: true, publishedAt: "2026-01-01", summary: "负责投放优化", description: "",
  requirement: "", bonus: "", applyUrl: "",
};

function renderEditor(route: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/careers/positions/new" element={<PositionEditorPage />} />
      <Route path="/careers/positions/:id/edit" element={<PositionEditorPage />} />
      <Route path="/careers" element={null} />
    </Routes>,
    { route },
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedFetchCities.mockResolvedValue({ items: [CITY], total: 1, page: 1, pageSize: 100 });
  mockedFetchPosition.mockResolvedValue(POSITION);
  mockedCreate.mockResolvedValue(POSITION);
  mockedUpdate.mockResolvedValue(POSITION);
});

describe("招聘职位编辑页", () => {
  it("E3 编辑职位加载主城市与基本字段", async () => {
    renderEditor("/careers/positions/position-001/edit");
    expect(await screen.findByDisplayValue("广告优化师")).toBeInTheDocument();
    expect(screen.getByText("主归属城市")).toBeInTheDocument();
    expect(mockedFetchCities).toHaveBeenCalledWith({ page: 1, pageSize: 100 });
    expect(mockedFetchPosition).toHaveBeenCalledWith("position-001");
  });

  it("E4 新建职位可提交标题与主城市", async () => {
    renderEditor("/careers/positions/new");
    fireEvent.change(await screen.findByLabelText("职位 ID（slug）"), { target: { value: "position-new" } });
    fireEvent.change(screen.getByLabelText("职位名称"), { target: { value: "新职位" } });
    fireEvent.mouseDown(screen.getAllByRole("combobox")[0]);
    fireEvent.click(await screen.findByText("上海（shanghai）"));
    fireEvent.click(screen.getByTestId("position-save"));
    await waitFor(() => expect(mockedCreate).toHaveBeenCalledWith(expect.objectContaining({ id: "position-new", title: "新职位", extraCities: "" })));
  });
});
