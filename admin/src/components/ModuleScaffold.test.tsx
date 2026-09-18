import { describe, expect, it } from "vitest";

import ModuleScaffold from "@/components/ModuleScaffold";
import { MODULE_BLUEPRINTS } from "@/config/endpoints";
import { renderWithProviders, screen } from "@/test/utils";

describe("ModuleScaffold", () => {
  it("展示模块标题、实现阶段与接口清单", () => {
    renderWithProviders(<ModuleScaffold moduleKeys={["cases"]} />);

    expect(screen.getByTestId("page-title")).toHaveTextContent("客户案例");
    expect(screen.getByText(/接口已实现，当前页面仅展示接口蓝图/)).toBeInTheDocument();
    expect(screen.getByTestId("module-card-cases")).toBeInTheDocument();

    // 清单数量与蓝图一致
    const expected = MODULE_BLUEPRINTS.cases.endpoints.length;
    expect(screen.getByText(`当前路由共 ${expected} 个接口`)).toBeInTheDocument();
    // GET / PUT / DELETE 共用同一路径
    expect(screen.getAllByText("/api/v1/cases/{id}").length).toBeGreaterThanOrEqual(3);
  });

  it("支持一个路由聚合多个模块（招聘管理 = 城市 + 职位）", () => {
    renderWithProviders(
      <ModuleScaffold moduleKeys={["careersCities", "careersPositions"]} title="招聘管理" />,
    );

    expect(screen.getByTestId("page-title")).toHaveTextContent("招聘管理");
    expect(screen.getByTestId("module-card-careersCities")).toBeInTheDocument();
    expect(screen.getByTestId("module-card-careersPositions")).toBeInTheDocument();

    const total =
      MODULE_BLUEPRINTS.careersCities.endpoints.length +
      MODULE_BLUEPRINTS.careersPositions.endpoints.length;
    expect(screen.getByTestId("module-endpoint-total")).toHaveTextContent(`共 ${total} 个接口`);
    expect(screen.getByText(/接口已实现，当前页面仅展示接口蓝图/)).toBeInTheDocument();
  });

  it("区分公开接口与需登录接口", () => {
    renderWithProviders(<ModuleScaffold moduleKeys={["site"]} />);
    expect(screen.getByText("公开")).toBeInTheDocument();
    expect(screen.getByText("需登录")).toBeInTheDocument();
  });
});
