import { Button } from "antd";
import { describe, expect, it } from "vitest";

import PageContainer from "@/components/PageContainer";
import { renderWithProviders, screen } from "@/test/utils";

describe("PageContainer", () => {
  it("渲染标题与子内容", () => {
    renderWithProviders(
      <PageContainer title="客户案例">
        <div data-testid="body">内容区</div>
      </PageContainer>,
    );
    expect(screen.getByTestId("page-title")).toHaveTextContent("客户案例");
    expect(screen.getByTestId("body")).toBeInTheDocument();
    expect(screen.queryByTestId("page-subtitle")).not.toBeInTheDocument();
    expect(screen.queryByTestId("page-extra")).not.toBeInTheDocument();
  });

  it("渲染副标题与右上角操作区", () => {
    renderWithProviders(
      <PageContainer title="主题设置" subTitle="保存后立即生效" extra={<Button>保存</Button>}>
        <span />
      </PageContainer>,
    );
    expect(screen.getByTestId("page-subtitle")).toHaveTextContent("保存后立即生效");
    expect(screen.getByTestId("page-extra")).toContainElement(screen.getByRole("button", { name: /保\s*存/ }));
  });
});
