import { ArrowDownOutlined, ArrowUpOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Empty, Space, Tooltip, Typography } from "antd";
import type { ReactNode } from "react";

export interface ArrayEditorProps<T> {
  /** antd Form.Item 注入 */
  value?: T[];
  onChange?: (next: T[]) => void;
  /** 点击「添加」时生成新条目 */
  createItem: () => T;
  /** 渲染单条内容，patch 用于局部更新（浅合并） */
  itemRender: (item: T, index: number, patch: (changes: Partial<T>) => void) => ReactNode;
  /** 卡片标题，默认「条目 N」 */
  itemTitle?: (item: T, index: number) => ReactNode;
  addText?: string;
  emptyText?: string;
  minItems?: number;
  maxItems?: number;
  /** 是否允许上下拖动排序（使用按钮，无动画） */
  sortable?: boolean;
  disabled?: boolean;
}

/**
 * 通用数组编辑器：新增 / 删除 / 排序，可作为 antd Form.Item 的受控子组件使用。
 * 后台所有「列表型」字段（导航、荣誉、城市、职位、案例图集…）统一使用该组件。
 */
export default function ArrayEditor<T>({
  value,
  onChange,
  createItem,
  itemRender,
  itemTitle,
  addText = "添加一条",
  emptyText = "暂无数据，请点击下方按钮添加",
  minItems = 0,
  maxItems,
  sortable = true,
  disabled = false,
}: ArrayEditorProps<T>) {
  const items = value ?? [];

  const commit = (next: T[]) => onChange?.(next);

  const updateAt = (index: number, changes: Partial<T>) => {
    commit(items.map((item, i) => (i === index ? { ...item, ...changes } : item)));
  };

  const removeAt = (index: number) => {
    commit(items.filter((_, i) => i !== index));
  };

  const add = () => {
    commit([...items, createItem()]);
  };

  const move = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    commit(next);
  };

  const canRemove = !disabled && items.length > minItems;
  const canAdd = !disabled && (maxItems === undefined || items.length < maxItems);

  return (
    <div className="adfly-array-editor" data-testid="array-editor">
      {items.length === 0 && (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyText} style={{ marginBottom: 12 }} />
      )}

      {items.map((item, index) => (
        <Card
          key={index}
          size="small"
          style={{ marginBottom: 12 }}
          title={
            <Typography.Text strong>
              {itemTitle ? itemTitle(item, index) : `条目 ${index + 1}`}
            </Typography.Text>
          }
          extra={
            <Space size={4}>
              {sortable && (
                <>
                  <Tooltip title="上移">
                    <Button
                      size="small"
                      type="text"
                      aria-label={`上移第 ${index + 1} 条`}
                      icon={<ArrowUpOutlined />}
                      disabled={disabled || index === 0}
                      onClick={() => move(index, -1)}
                    />
                  </Tooltip>
                  <Tooltip title="下移">
                    <Button
                      size="small"
                      type="text"
                      aria-label={`下移第 ${index + 1} 条`}
                      icon={<ArrowDownOutlined />}
                      disabled={disabled || index === items.length - 1}
                      onClick={() => move(index, 1)}
                    />
                  </Tooltip>
                </>
              )}
              <Tooltip title={canRemove ? "删除" : `至少保留 ${minItems} 条`}>
                <Button
                  size="small"
                  type="text"
                  danger
                  aria-label={`删除第 ${index + 1} 条`}
                  icon={<DeleteOutlined />}
                  disabled={!canRemove}
                  onClick={() => removeAt(index)}
                />
              </Tooltip>
            </Space>
          }
        >
          <div data-testid={`array-item-${index}`}>{itemRender(item, index, (changes) => updateAt(index, changes))}</div>
        </Card>
      ))}

      <Button
        type="dashed"
        block
        icon={<PlusOutlined />}
        disabled={!canAdd}
        onClick={add}
        style={{ marginTop: items.length === 0 ? 0 : 4 }}
      >
        {maxItems !== undefined && items.length >= maxItems ? `已达上限 ${maxItems} 条` : addText}
      </Button>
    </div>
  );
}
