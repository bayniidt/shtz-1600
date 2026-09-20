import { App, Alert, Button, Card, Form, Popconfirm, Skeleton, Space, Typography } from "antd";
import type { FormInstance } from "antd";
import { useEffect, useId, useState, type ReactNode } from "react";

import ContentForm from "@/components/ContentForm";
import PageContainer from "@/components/PageContainer";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import type { FieldSpec } from "@/types/field-spec";

export interface ContentEditorProps {
  title: string;
  subTitle?: string;
  /** 未保存提示中显示的页面名 */
  pageLabel: string;
  fields: FieldSpec[];
  value: Record<string, unknown> | null;
  loading?: boolean;
  saving?: boolean;
  /** 加载失败信息（存在时展示 Alert 且禁用保存） */
  error?: string | null;
  onSave: (values: Record<string, unknown>) => Promise<void> | void;
  onCancel?: () => void;
  onReload?: () => void;
  extra?: ReactNode;
  footer?: ReactNode;
  /** 内嵌在 Tabs 中时使用：不渲染 PageContainer */
  compact?: boolean;
  /** 未保存登记 id（同一页面多个编辑器需显式指定） */
  dirtyId?: string;
  testId?: string;
}

/**
 * 内容编辑页统一外壳：
 * 加载态 / 错误态 / 保存与还原按钮 / 「已保存」提示 / 离开前未保存确认。
 * 表单结构由 `fields` 描述驱动。
 */
export default function ContentEditor({
  title,
  subTitle,
  pageLabel,
  fields,
  value,
  loading = false,
  saving = false,
  error = null,
  onSave,
  onCancel,
  onReload,
  extra,
  footer,
  compact = false,
  dirtyId,
  testId,
}: ContentEditorProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm<Record<string, unknown>>();
  const [dirty, setDirty] = useState(false);
  const autoId = useId();
  const dirtyKey = dirtyId ?? autoId;
  // 字段 id 前缀，保证同一页面多个表单（首页 6 个 Tab）互不冲突
  const formName = dirtyKey.replace(/[^a-zA-Z0-9_-]/g, "-");

  useUnsavedChanges(dirty, pageLabel, dirtyKey);

  // 服务端返回新数据（保存成功或重新加载）时清掉未保存标记
  useEffect(() => {
    setDirty(false);
  }, [value]);

  const handleFinish = async (values: Record<string, unknown>) => {
    try {
      await onSave(values);
      setDirty(false);
      message.success("已保存");
    } catch (saveError) {
      message.error(saveError instanceof Error ? saveError.message : "保存失败，请稍后重试");
    }
  };

  const handleReset = () => {
    form.resetFields();
    setDirty(false);
    message.info("已还原为上次保存的内容");
  };

  const formInstance = form as FormInstance<Record<string, unknown>>;

  const toolbar = (
    <Space>
      {extra}
      <Popconfirm
        title="还原未保存的修改？"
        description="当前表单内容将恢复为上次保存的版本。"
        okText="确认还原"
        cancelText="取消"
        disabled={!dirty}
        onConfirm={handleReset}
      >
        <Button disabled={!value || !dirty} data-testid="content-reset">
          还原
        </Button>
      </Popconfirm>
      {onCancel ? (
        <Button onClick={onCancel} data-testid="content-cancel">
          取消
        </Button>
      ) : null}
      <Button
        type="primary"
        loading={saving}
        disabled={!value}
        data-testid="content-save"
        onClick={() => void formInstance.submit()}
      >
        保存
      </Button>
    </Space>
  );

  const body = (
    <>
      {error && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          message="内容加载失败"
          description={error}
          action={
            onReload ? (
              <Button size="small" onClick={onReload} data-testid="content-retry">
                重新加载
              </Button>
            ) : null
          }
        />
      )}

      {dirty && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="有未保存的修改，离开本页前请先保存"
          data-testid="content-dirty-tip"
        />
      )}

      <Card size="small" data-testid={testId ? `${testId}-card` : "content-editor-card"}>
        {loading || !value ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : (
          <ContentForm
            form={formInstance}
            formName={formName}
            fields={fields}
            initialValue={value}
            disabled={saving}
            formKey={`${pageLabel}-${String(value.updatedAt ?? "new")}`}
            onFinish={(values) => void handleFinish(values)}
            onValuesChange={() => setDirty(true)}
          />
        )}
      </Card>

      {footer && <div style={{ marginTop: 16 }}>{footer}</div>}
    </>
  );

  if (compact) {
    return (
      <div data-testid={testId ?? "content-editor"}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            position: "sticky",
            top: 0,
            zIndex: 3,
            background: "var(--ant-color-bg-container, #fff)",
            padding: "8px 0",
            marginBottom: 12,
            borderBottom: "1px solid var(--ant-color-border-secondary, #f0f0f0)",
          }}
        >
          <Typography.Text type="secondary">{subTitle}</Typography.Text>
          <div>{toolbar}</div>
        </div>
        {body}
      </div>
    );
  }

  return (
    <div data-testid={testId ?? "content-editor"}>
      <PageContainer title={title} subTitle={subTitle} extra={toolbar}>
        {body}
      </PageContainer>
    </div>
  );
}
