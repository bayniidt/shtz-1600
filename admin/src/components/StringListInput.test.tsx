import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import StringListInput from "@/components/StringListInput";
import { fireEvent, renderWithProviders, screen } from "@/test/utils";

/** 受控包装：方便断言 onChange 结果 */
function Harness({ initial = [], onChangeSpy }: { initial?: string[]; onChangeSpy?: (v: string[]) => void }) {
  const [value, setValue] = useState<string[]>(initial);
  return (
    <StringListInput
      value={value}
      placeholder="输入媒体名"
      addText="添加媒体"
      onChange={(next) => {
        setValue(next);
        onChangeSpy?.(next);
      }}
    />
  );
}

describe("StringListInput", () => {
  it("L1 空列表展示提示与添加按钮", () => {
    renderWithProviders(<StringListInput value={[]} onChange={vi.fn()} />);
    expect(screen.getByTestId("string-list")).toBeInTheDocument();
    expect(screen.getByText("暂无内容")).toBeInTheDocument();
  });

  it("L2 渲染已有条目", () => {
    renderWithProviders(<StringListInput value={["Facebook", "Google"]} onChange={vi.fn()} />);
    expect(screen.getByDisplayValue("Facebook")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Google")).toBeInTheDocument();
  });

  it("L3 点击添加追加空条目并回调", async () => {
    const onChange = vi.fn();
    renderWithProviders(<StringListInput value={["A"]} onChange={onChange} addText="添加媒体" />);

    fireEvent.click(screen.getByRole("button", { name: /添加媒体/ }));
    expect(onChange).toHaveBeenCalledWith(["A", ""]);
  });

  it("L4 createValue 支持自定义新增初始值", async () => {
    const onChange = vi.fn();
    renderWithProviders(<StringListInput value={[]} onChange={onChange} createValue="新项" addText="添加" />);

    fireEvent.click(screen.getByRole("button", { name: /添加/ }));
    expect(onChange).toHaveBeenCalledWith(["新项"]);
  });

  it("L5 编辑条目只更新对应下标", async () => {
    const onChange = vi.fn();
    renderWithProviders(<Harness initial={["A", "B"]} onChangeSpy={onChange} />);

    const second = screen.getByLabelText("第 2 项");
    fireEvent.change(second, { target: { value: "" } });
    fireEvent.change(second, { target: { value: "C" } });

    expect(onChange).toHaveBeenLastCalledWith(["A", "C"]);
  });

  it("L6 删除条目移除对应下标", async () => {
    const onChange = vi.fn();
    renderWithProviders(<Harness initial={["A", "B", "C"]} onChangeSpy={onChange} />);

    fireEvent.click(screen.getByLabelText("删除第 2 项"));
    expect(onChange).toHaveBeenLastCalledWith(["A", "C"]);
  });

  it("L7 disabled 时禁止添加 / 编辑 / 删除", () => {
    renderWithProviders(<StringListInput value={["A"]} onChange={vi.fn()} disabled addText="添加" />);

    expect(screen.getByRole("button", { name: /添加/ })).toBeDisabled();
    expect(screen.getByDisplayValue("A")).toBeDisabled();
    expect(screen.getByLabelText("删除第 1 项")).toBeDisabled();
  });

  it("L8 value 为 undefined 时按空数组处理", () => {
    renderWithProviders(<StringListInput onChange={vi.fn()} />);
    expect(screen.getByText("暂无内容")).toBeInTheDocument();
  });
});
