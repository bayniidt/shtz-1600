import { ArrowDownOutlined, ArrowUpOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, InputNumber, Row, Select, Space, Switch, Tooltip, Typography } from "antd";
import type { FormInstance } from "antd";
import { Fragment, type ReactNode } from "react";

import ImagePicker from "@/components/ImagePicker";
import StringListInput from "@/components/StringListInput";
import { emptyItemOf, type FieldSpec, type GroupListField } from "@/types/field-spec";

type NamePath = (string | number)[];

const RULES_LABEL = (label: string) => `${label}不能为空`;

interface RenderOptions {
  disabled?: boolean;
  skipRequiredValidation?: boolean;
  namePrefix?: NamePath;
  labelFor?: (field: FieldSpec, path: NamePath) => ReactNode;
  isShared?: (field: FieldSpec, path: NamePath) => boolean;
  hideShared?: boolean;
  lockStructure?: boolean;
}

function rulesOf(field: FieldSpec, skipRequiredValidation = false) {
  if (skipRequiredValidation) return [];
  if (field.kind === "link") {
    return [];
  }
  if (field.required === false) return [];
  const required = field.required ?? !["switch", "stringList", "groupList", "number", "image"].includes(field.kind);
  return required ? [{ required: true, message: RULES_LABEL(field.label) }] : [];
}

/** 渲染单个标量字段（不含对象数组）。 */
function renderScalar(field: FieldSpec, path: NamePath, options: RenderOptions): ReactNode {
  if (options.hideShared && options.isShared?.(field, path) === true) return null;
  const name = [...(options.namePrefix ?? []), ...path, field.name];
  const label = options.labelFor?.(field, path) ?? field.label;
  const disabled = options.disabled || options.isShared?.(field, path) === true;

  switch (field.kind) {
    case "text":
      return (
        <Form.Item name={name} label={label} rules={rulesOf(field, options.skipRequiredValidation)} extra={field.hint}>
          <Input disabled={disabled} placeholder={field.placeholder} maxLength={field.maxLength} allowClear />
        </Form.Item>
      );
    case "textarea":
      return (
        <Form.Item name={name} label={label} rules={rulesOf(field, options.skipRequiredValidation)} extra={field.hint}>
          <Input.TextArea disabled={disabled} rows={field.rows ?? 3} placeholder={field.placeholder} maxLength={field.maxLength} />
        </Form.Item>
      );
    case "number":
      return (
        <Form.Item name={name} label={label} rules={rulesOf(field, options.skipRequiredValidation)} extra={field.hint}>
          <InputNumber disabled={disabled} min={field.min} max={field.max} step={field.step} style={{ width: "100%" }} />
        </Form.Item>
      );
    case "select":
      return (
        <Form.Item name={name} label={label} rules={rulesOf(field, options.skipRequiredValidation)} extra={field.hint}>
          <Select disabled={disabled} options={field.options} />
        </Form.Item>
      );
    case "switch":
      return (
        <Form.Item name={name} label={label} valuePropName="checked" extra={field.hint}>
          <Switch disabled={disabled} />
        </Form.Item>
      );
    case "image":
      return (
        <Form.Item name={name} label={label} rules={rulesOf(field, options.skipRequiredValidation)} extra={field.hint}>
          <ImagePicker disabled={disabled} placeholder={field.placeholder} />
        </Form.Item>
      );
    case "stringList":
      return (
        <Form.Item name={name} label={label} extra={field.hint}>
          <StringListInput disabled={disabled} addText={field.addText} placeholder={field.placeholder} />
        </Form.Item>
      );
    case "link":
      const sharedHref = options.isShared?.({ ...field, name: `${field.name}.href` }, path) === true;
      return (
        <Form.Item label={label} extra={field.hint} style={{ marginBottom: 0 }}>
          <Row gutter={8}>
            {!options.hideShared || !sharedHref ? <Col span={12}>
              <Form.Item
                name={[...name, "label"]}
                rules={options.skipRequiredValidation ? [] : [{ required: true, message: "按钮文案不能为空" }]}
              >
                <Input disabled={disabled} placeholder="按钮文案" aria-label={`${field.label}-文案`} allowClear />
              </Form.Item>
            </Col> : null}
            <Col span={12}>
              <Form.Item
                name={[...name, "href"]}
                rules={options.skipRequiredValidation ? [] : [{ required: true, message: "链接不能为空" }]}
              >
                <Input
                  disabled={disabled || options.isShared?.({ ...field, name: `${field.name}.href` }, path) === true}
                  placeholder="/cases 或 #contact"
                  aria-label={`${field.label}-链接`}
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>
      );
    case "object":
      return renderObject(field.fields, label, field.hint, path.concat(field.name), options);
    case "groupList":
      return renderGroupList(field, path, options);
    default:
      return null;
  }
}

/** 嵌套对象：卡片包裹，子字段路径追加对象名。 */
function renderObject(
  fields: FieldSpec[],
  label: ReactNode,
  hint: string | undefined,
  path: NamePath,
  options: RenderOptions,
): ReactNode {
  return (
    <Form.Item label={label} extra={hint} style={{ marginBottom: 12 }}>
      <Card size="small" data-testid="object-group">
        <Row gutter={16}>
          {fields.map((child) => (
            <Fragment key={child.name}>{renderField(child, path, options)}</Fragment>
          ))}
        </Row>
      </Card>
    </Form.Item>
  );
}

/** 对象数组：Form.List + 卡片，支持添加 / 删除 / 上移下移（无动画）。 */
function renderGroupList(field: GroupListField, path: NamePath, options: RenderOptions): ReactNode {
  return (
    <Form.Item label={field.label} extra={field.hint} style={{ marginBottom: 12 }}>
      <Form.List name={[...path, field.name]} data-testid={`group-list-${field.name}`}>
        {(fields, { add, remove, move }) => (
          <div data-testid={`group-list-${field.name}`}>
            {fields.map((current, index) => (
              <Card
                key={current.key}
                size="small"
                className="adfly-array-item"
                style={{ marginBottom: 12 }}
                title={
                  <Space size={8} align="center">
                    <span className="adfly-array-index">{String(index + 1).padStart(2, "0")}</span>
                    <Typography.Text strong>
                      {field.itemTitle ?? "条目"} {index + 1}
                    </Typography.Text>
                  </Space>
                }
                extra={
                  options.lockStructure ? null : (
                  <Space size={4}>
                    <Tooltip title="上移">
                      <Button
                        size="small"
                        type="text"
                        aria-label={`上移第 ${index + 1} 条`}
                        icon={<ArrowUpOutlined />}
                        disabled={index === 0}
                        onClick={() => move(index, index - 1)}
                      />
                    </Tooltip>
                    <Tooltip title="下移">
                      <Button
                        size="small"
                        type="text"
                        aria-label={`下移第 ${index + 1} 条`}
                        icon={<ArrowDownOutlined />}
                        disabled={index === fields.length - 1}
                        onClick={() => move(index, index + 1)}
                      />
                    </Tooltip>
                    <Tooltip
                      title={
                        field.min !== undefined && fields.length <= field.min
                          ? `至少保留 ${field.min} 条`
                          : "删除"
                      }
                    >
                      <Button
                        size="small"
                        type="text"
                        danger
                        aria-label={`删除第 ${index + 1} 条`}
                        icon={<DeleteOutlined />}
                        disabled={field.min !== undefined && fields.length <= field.min}
                        onClick={() => remove(current.name)}
                      />
                    </Tooltip>
                  </Space>
                  )
                }
              >
                <Row gutter={16}>
                  {field.fields.map((child) => (
                    <Fragment key={child.name}>{renderField(child, [current.name], options)}</Fragment>
                  ))}
                </Row>
              </Card>
            ))}

            {!options.lockStructure && (
              <Button
                type="dashed"
                block
                className="adfly-add-btn"
                icon={<PlusOutlined />}
                disabled={field.max !== undefined && fields.length >= field.max}
                onClick={() => add(emptyItemOf(field.fields))}
              >
                {field.max !== undefined && fields.length >= field.max
                  ? `已达上限 ${field.max} 条`
                  : (field.addText ?? "添加一条")}
              </Button>
            )}
          </div>
        )}
      </Form.List>
    </Form.Item>
  );
}

/** 递归渲染字段：标量直接渲染，数组/分组包一层栅格。 */
export function renderField(field: FieldSpec, path: NamePath, options: RenderOptions = {}): ReactNode {
  const span = field.span ?? 24;
  return <Col span={span}>{renderScalar(field, path, options)}</Col>;
}

export interface ContentFormProps {
  fields: FieldSpec[];
  initialValue: Record<string, unknown>;
  /** 表单实例（由外层 ContentEditor 注入，便于「还原 / 保存」） */
  form?: FormInstance<Record<string, unknown>>;
  /** 表单名称：为字段 id 加前缀，避免同一页面多个表单 id 冲突 */
  formName?: string;
  /** 提交回调（校验通过后触发） */
  onFinish?: (values: Record<string, unknown>) => void;
  onValuesChange?: () => void;
  disabled?: boolean;
  /** 英文译文允许逐步补齐，保存时不阻断空字段。 */
  skipRequiredValidation?: boolean;
  formKey?: string | number;
  namePrefix?: NamePath;
  labelFor?: (field: FieldSpec, path: NamePath) => ReactNode;
  isShared?: (field: FieldSpec, path: NamePath) => boolean;
  hideShared?: boolean;
  lockStructure?: boolean;
  testId?: string;
}

/** 由字段描述生成的内容表单（无动画）。 */
export default function ContentForm({
  fields,
  initialValue,
  form,
  formName,
  onFinish,
  onValuesChange,
  disabled = false,
  skipRequiredValidation = false,
  formKey,
  namePrefix,
  labelFor,
  isShared,
  hideShared = false,
  lockStructure = false,
  testId = "content-form",
}: ContentFormProps) {
  return (
    <Form
      key={formKey}
      form={form}
      name={formName}
      layout="vertical"
      initialValues={initialValue}
      disabled={disabled}
      onValuesChange={onValuesChange}
      onFinish={onFinish}
      scrollToFirstError
      data-testid={testId}
    >
      <Row gutter={16}>
        {fields.map((field) => (
          <Fragment key={field.name}>
            {renderField(field, [], { disabled, skipRequiredValidation, namePrefix, labelFor, isShared, hideShared, lockStructure })}
          </Fragment>
        ))}
      </Row>
    </Form>
  );
}
