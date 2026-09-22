import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Input, Space } from "antd";

export interface StringListInputProps {
  /** antd Form.Item 注入 */
  value?: string[];
  onChange?: (next: string[]) => void;
  addText?: string;
  placeholder?: string;
  disabled?: boolean;
  /** 新增条目时的初始值 */
  createValue?: string;
}

/** 字符串数组编辑器：用于 marquee、标签等「纯文本列表」字段。 */
export default function StringListInput({
  value,
  onChange,
  addText = "添加一项",
  placeholder,
  disabled = false,
  createValue = "",
}: StringListInputProps) {
  const items = value ?? [];

  const update = (index: number, next: string) => {
    onChange?.(items.map((item, i) => (i === index ? next : item)));
  };

  const remove = (index: number) => {
    onChange?.(items.filter((_, i) => i !== index));
  };

  return (
    <div data-testid="string-list">
      {items.length === 0 && (
        <div className="adfly-empty">
          <span>暂无内容</span>
        </div>
      )}

      <Space direction="vertical" size={8} style={{ width: "100%" }}>
        {items.map((item, index) => (
          <Space.Compact key={index} style={{ width: "100%" }}>
            <Input
              value={item}
              disabled={disabled}
              placeholder={placeholder}
              aria-label={`第 ${index + 1} 项`}
              onChange={(event) => update(index, event.target.value)}
            />
            <Button
              icon={<DeleteOutlined />}
              disabled={disabled}
              aria-label={`删除第 ${index + 1} 项`}
              onClick={() => remove(index)}
            />
          </Space.Compact>
        ))}
      </Space>

      <Button
        type="dashed"
        block
        className="adfly-add-btn"
        icon={<PlusOutlined />}
        disabled={disabled}
        style={{ marginTop: items.length === 0 ? 0 : 8 }}
        onClick={() => onChange?.([...items, createValue])}
      >
        {addText}
      </Button>
    </div>
  );
}
