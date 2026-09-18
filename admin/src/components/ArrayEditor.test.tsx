import { Input } from "antd";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import ArrayEditor from "@/components/ArrayEditor";
import { renderWithProviders, screen, userEvent } from "@/test/utils";

interface Item {
  name: string;
}

interface HarnessProps {
  initial?: Item[];
  emptyText?: string;
  addText?: string;
  minItems?: number;
  maxItems?: number;
  sortable?: boolean;
  disabled?: boolean;
  itemTitle?: (item: Item, index: number) => string;
}

function Harness({
  initial = [],
  emptyText,
  addText,
  minItems,
  maxItems,
  sortable,
  disabled,
  itemTitle,
}: HarnessProps) {
  const [value, setValue] = useState<Item[]>(initial);
  return (
    <div>
      <ArrayEditor<Item>
        value={value}
        onChange={setValue}
        createItem={() => ({ name: `新条目` })}
        itemRender={(item, index, patch) => (
          <Input
            aria-label={`name-${index}`}
            value={item.name}
            onChange={(event) => patch({ name: event.target.value })}
          />
        )}
        emptyText={emptyText}
        addText={addText}
        minItems={minItems}
        maxItems={maxItems}
        sortable={sortable}
        disabled={disabled}
        itemTitle={itemTitle}
      />
      <span data-testid="count">{value.length}</span>
      <span data-testid="snapshot">{JSON.stringify(value)}</span>
    </div>
  );
}

describe("ArrayEditor", () => {
  it("空列表展示提示语与添加按钮", () => {
    renderWithProviders(<Harness emptyText="还没有内容" />);
    expect(screen.getByText("还没有内容")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /添加一条/ })).toBeInTheDocument();
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("点击添加会追加新条目", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Harness addText="新增荣誉" />);
    await user.click(screen.getByRole("button", { name: /新增荣誉/ }));
    await user.click(screen.getByRole("button", { name: /新增荣誉/ }));
    expect(screen.getByTestId("count")).toHaveTextContent("2");
    expect(screen.getByText("条目 1")).toBeInTheDocument();
    expect(screen.getByText("条目 2")).toBeInTheDocument();
  });

  it("itemRender 的 patch 会局部更新对应条目", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Harness initial={[{ name: "A" }, { name: "B" }]} />);
    await user.type(screen.getByLabelText("name-1"), "X");
    expect(screen.getByTestId("snapshot")).toHaveTextContent('{"name":"BX"}');
  });

  it("删除按钮移除对应条目", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Harness initial={[{ name: "A" }, { name: "B" }]} />);
    await user.click(screen.getByLabelText("删除第 1 条"));
    expect(screen.getByTestId("snapshot")).toHaveTextContent('[{"name":"B"}]');
  });

  it("支持上下移动排序，边界按钮禁用", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Harness initial={[{ name: "A" }, { name: "B" }, { name: "C" }]} />);

    expect(screen.getByLabelText("上移第 1 条")).toBeDisabled();
    expect(screen.getByLabelText("下移第 3 条")).toBeDisabled();

    await user.click(screen.getByLabelText("下移第 1 条"));
    expect(screen.getByTestId("snapshot")).toHaveTextContent('[{"name":"B"},{"name":"A"},{"name":"C"}]');

    await user.click(screen.getByLabelText("上移第 3 条"));
    expect(screen.getByTestId("snapshot")).toHaveTextContent('[{"name":"B"},{"name":"C"},{"name":"A"}]');
  });

  it("sortable=false 时不渲染排序按钮", () => {
    renderWithProviders(<Harness initial={[{ name: "A" }]} sortable={false} />);
    expect(screen.queryByLabelText("上移第 1 条")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("下移第 1 条")).not.toBeInTheDocument();
  });

  it("minItems 限制最少条数（删除按钮禁用）", () => {
    renderWithProviders(<Harness initial={[{ name: "A" }]} minItems={1} />);
    expect(screen.getByLabelText("删除第 1 条")).toBeDisabled();
  });

  it("maxItems 限制最多条数（添加按钮禁用并提示上限）", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Harness initial={[{ name: "A" }]} maxItems={2} />);
    const add = screen.getByRole("button", { name: /添加一条/ });
    await user.click(add);
    expect(screen.getByTestId("count")).toHaveTextContent("2");
    expect(screen.getByRole("button", { name: /已达上限 2 条/ })).toBeDisabled();
  });

  it("disabled=true 时禁止一切编辑", () => {
    renderWithProviders(<Harness initial={[{ name: "A" }]} disabled />);
    expect(screen.getByLabelText("删除第 1 条")).toBeDisabled();
    expect(screen.getByRole("button", { name: /添加一条/ })).toBeDisabled();
  });

  it("未传入 value 时按空数组处理，onChange 可选", () => {
    const onChange = vi.fn();
    renderWithProviders(
      <ArrayEditor<Item>
        onChange={onChange}
        createItem={() => ({ name: "x" })}
        itemRender={(item) => <span>{item.name}</span>}
        emptyText="空"
      />,
    );
    expect(screen.getByText("空")).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("支持自定义 itemTitle", () => {
    renderWithProviders(
      <Harness initial={[{ name: "A" }]} itemTitle={(item, index) => `${index + 1}#${item.name}`} />,
    );
    expect(screen.getByText("1#A")).toBeInTheDocument();
  });
});
