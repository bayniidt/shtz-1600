import { beforeEach, describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router-dom";

import CityEditorPage from "@/pages/careers/CityEditor";
import { createCareerCity, fetchCareerCity, updateCareerCity } from "@/services/careers";
import { fireEvent, renderWithProviders, screen, waitFor } from "@/test/utils";

vi.mock("@/services/careers", () => ({
  createCareerCity: vi.fn(),
  fetchCareerCity: vi.fn(),
  updateCareerCity: vi.fn(),
}));

const mockedCreate = vi.mocked(createCareerCity);
const mockedFetch = vi.mocked(fetchCareerCity);
const mockedUpdate = vi.mocked(updateCareerCity);
const CITY = { id: "shanghai", name: "上海", nameEn: "Shanghai", code: "CT_125", summary: "总部", featured: true };

function renderEditor(route: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/careers/cities/new" element={<CityEditorPage />} />
      <Route path="/careers/cities/:id/edit" element={<CityEditorPage />} />
      <Route path="/careers" element={null} />
    </Routes>,
    { route },
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedCreate.mockResolvedValue(CITY);
  mockedFetch.mockResolvedValue({ ...CITY, positions: [] });
  mockedUpdate.mockResolvedValue(CITY);
});

describe("招聘城市编辑页", () => {
  it("E1 新建城市提交表单", async () => {
    renderEditor("/careers/cities/new");
    fireEvent.change(screen.getByLabelText("城市 ID（slug）"), { target: { value: "shanghai" } });
    fireEvent.change(screen.getByLabelText("城市名称"), { target: { value: "上海" } });
    fireEvent.click(screen.getByTestId("city-save"));
    await waitFor(() => expect(mockedCreate).toHaveBeenCalledWith(expect.objectContaining({ id: "shanghai", name: "上海" })));
  });

  it("E2 编辑城市可提交新的 id 并加载关联职位", async () => {
    renderEditor("/careers/cities/shanghai/edit");
    expect(await screen.findByDisplayValue("上海")).toBeInTheDocument();
    expect(screen.getByText("修改城市 ID 会同步更新职位归属和附加城市")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("城市 ID（slug）"), { target: { value: "shanghai-hq" } });
    fireEvent.click(screen.getByTestId("city-save"));
    await waitFor(() => expect(mockedUpdate).toHaveBeenCalledWith("shanghai", expect.objectContaining({ id: "shanghai-hq" })));
  });
});
