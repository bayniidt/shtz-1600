import { describe, expect, it, vi } from "vitest";

import ContentEditor from "@/components/ContentEditor";
import type { FieldSpec } from "@/types/field-spec";
import { useDirtyStore } from "@/store/dirty";
import { fireEvent, renderWithProviders, screen, waitFor } from "@/test/utils";

const FIELDS: FieldSpec[] = [
  { kind: "text", name: "title", label: "标题" },
  { kind: "text", name: "logoText", label: "Logo 主标识", required: false },
];

const VALUE = { title: "全球智能营销科技服务商", logoText: "ADFLY", updatedAt: "2024-05-01T00:00:00.000Z" };

function setup(overrides: Partial<React.ComponentProps<typeof ContentEditor>> = {}) {
  const onSave = vi.fn().mockResolvedValue(undefined);
  const props = {
    title: "站点与导航",
    subTitle: "站点基础信息",
    pageLabel: "站点与导航",
    fields: FIELDS,
    value: VALUE as Record<string, unknown> | null,
    onSave,
    testId: "site-content",
    ...overrides,
  } as React.ComponentProps<typeof ContentEditor>;

  const result = renderWithProviders(<ContentEditor {...props} />);
  return { ...result, onSave, props };
}

describe("ContentEditor", () => {
  it("E1 渲染页面容器、标题与保存/还原按钮", () => {
    setup();

    expect(screen.getByTestId("page-title")).toHaveTextContent("站点与导航");
    expect(screen.getByTestId("page-subtitle")).toHaveTextContent("站点基础信息");
    expect(screen.getByTestId("content-save")).toBeInTheDocument();
    expect(screen.getByTestId("content-reset")).toBeDisabled();
    expect(screen.getByTestId("site-content")).toBeInTheDocument();
  });

  it("E2 loading 或 value 为空时展示骨架屏，保存按钮禁用", () => {
    setup({ value: null, loading: true });

    expect(screen.getByTestId("content-save")).toBeDisabled();
    expect(screen.queryByTestId("content-form")).not.toBeInTheDocument();
  });

  it("E3 提交时把表单值交给 onSave 并提示「已保存」", async () => {
    const { onSave } = setup();

    fireEvent.click(screen.getByTestId("content-save"));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave.mock.calls[0][0]).toMatchObject({ title: "全球智能营销科技服务商" });
    expect(await screen.findByText("已保存")).toBeInTheDocument();
  });

  it("E4 保存失败时提示错误信息", async () => {
    setup({ onSave: vi.fn().mockRejectedValue(new Error("参数校验失败")) });

    fireEvent.click(screen.getByTestId("content-save"));

    expect(await screen.findByText("参数校验失败")).toBeInTheDocument();
  });

  it("E5 非 Error 异常时给出兜底提示", async () => {
    setup({ onSave: vi.fn().mockRejectedValue("boom") });

    fireEvent.click(screen.getByTestId("content-save"));

    expect(await screen.findByText("保存失败，请稍后重试")).toBeInTheDocument();
  });

  it("E6 改动字段后出现未保存提示、登记 dirty，并可二次确认还原", async () => {
    setup();

    expect(useDirtyStore.getState().entries).toEqual({});

    fireEvent.change(screen.getByLabelText("标题"), { target: { value: "！" } });

    expect(await screen.findByTestId("content-dirty-tip")).toBeInTheDocument();
    expect(Object.values(useDirtyStore.getState().entries)).toEqual(["站点与导航"]);

    fireEvent.click(screen.getByTestId("content-reset"));
    fireEvent.click(await screen.findByRole("button", { name: "确认还原" }));

    await waitFor(() => expect(screen.queryByTestId("content-dirty-tip")).not.toBeInTheDocument());
    expect(screen.getByLabelText("标题")).toHaveValue("全球智能营销科技服务商");
    expect(await screen.findByText("已还原为上次保存的内容")).toBeInTheDocument();
    expect(useDirtyStore.getState().entries).toEqual({});
  });

  it("E7 保存成功后清掉未保存标记", async () => {
    const { props } = setup();
    const updated = { ...VALUE, title: "新标题", updatedAt: "2024-06-01T00:00:00.000Z" };

    fireEvent.change(screen.getByLabelText("标题"), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText("标题"), { target: { value: "新标题" } });
    fireEvent.click(screen.getByTestId("content-save"));

    await waitFor(() => expect(props.onSave).toHaveBeenCalled());
    renderWithProviders(<ContentEditor {...props} value={updated} />);
    await waitFor(() => expect(screen.queryAllByTestId("content-dirty-tip")).toHaveLength(0));
  });

  it("E8 加载失败展示错误 Alert，可点击重新加载", async () => {
    const onReload = vi.fn();
    setup({ value: null, error: "网络异常，请稍后重试", onReload });

    expect(screen.getByText("内容加载失败")).toBeInTheDocument();
    expect(screen.getByText("网络异常，请稍后重试")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("content-retry"));
    expect(onReload).toHaveBeenCalledTimes(1);
  });

  it("E9 compact 模式不渲染 PageContainer，头部展示描述与操作区", () => {
    setup({ compact: true, dirtyId: "home-hero", testId: "home-hero", pageLabel: "首页内容 · Hero 区" });

    expect(screen.queryByTestId("page-container")).not.toBeInTheDocument();
    expect(screen.getByTestId("home-hero")).toBeInTheDocument();
    expect(screen.getByTestId("home-hero-card")).toBeInTheDocument();
    expect(screen.getByText("站点基础信息")).toBeInTheDocument();
    expect(screen.getByTestId("content-save")).toBeInTheDocument();
  });

  it("E10 extra 插槽内容渲染在操作区", () => {
    setup({ extra: <button type="button">预览</button> });
    expect(screen.getByRole("button", { name: "预览" })).toBeInTheDocument();
  });
});
