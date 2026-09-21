import { Alert, App, Button, Card, Form, Popconfirm, Segmented, Skeleton, Space, Typography } from "antd";
import type { FormInstance } from "antd";
import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";

import ContentForm from "@/components/ContentForm";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import PageContainer from "@/components/PageContainer";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import type { FieldSpec } from "@/types/field-spec";
import {
  buildBilingualPayload,
  buildLocalizedPayload,
  getLocalizedFormValues,
  getLocalizedValues,
  type Locale,
  type ViewMode,
} from "@/types/i18n";
import BilingualContentForm from "@/components/BilingualContentForm";

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
  onDirtyChange?: (dirty: boolean) => void;
  onReload?: () => void;
  extra?: ReactNode;
  footer?: ReactNode;
  /** 内嵌在 Tabs 中时使用：不渲染 PageContainer */
  compact?: boolean;
  /** 使用中英对照工作台，中文维护结构，英文只维护译文。 */
  bilingual?: boolean;
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
  onDirtyChange,
  onReload,
  extra,
  footer,
  compact = false,
  bilingual = false,
  dirtyId,
  testId,
}: ContentEditorProps) {
  const { message, modal } = App.useApp();
  const [form] = Form.useForm<Record<string, unknown>>();
  const [zhForm] = Form.useForm<Record<string, unknown>>();
  const [enForm] = Form.useForm<Record<string, unknown>>();
  const [dirty, setDirty] = useState(false);
  const [locale, setLocale] = useState<Locale>("zh");
  const [viewMode, setViewMode] = useState<ViewMode>("bilingual");
  const [drafts, setDrafts] = useState<Partial<Record<Locale, Record<string, unknown>>>>({});
  const lastReportedDirty = useRef<boolean | undefined>(undefined);
  const autoId = useId();
  const dirtyKey = dirtyId ?? autoId;
  // 字段 id 前缀，保证同一页面多个表单（首页 6 个 Tab）互不冲突
  const formName = dirtyKey.replace(/[^a-zA-Z0-9_-]/g, "-");
  const localizedValue = useMemo(() => {
    if (drafts[locale]) return drafts[locale];
    return getLocalizedValues(value ?? {}, locale);
  }, [drafts, locale, value]);

  useUnsavedChanges(dirty, pageLabel, dirtyKey);

  // 服务端返回新数据（保存成功或重新加载）时清掉未保存标记
  useEffect(() => {
    setDirty(false);
  }, [value]);

  useEffect(() => {
    if (lastReportedDirty.current === dirty) return;
    lastReportedDirty.current = dirty;
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  const handleFinish = async (values: Record<string, unknown>) => {
    try {
      await onSave(buildLocalizedPayload(value ?? {}, locale, values));
      setDrafts((current) => {
        const next = { ...current };
        delete next[locale];
        return next;
      });
      setDirty(false);
      message.success("已保存");
    } catch (saveError) {
      message.error(saveError instanceof Error ? saveError.message : "保存失败，请稍后重试");
    }
  };

  const handleBilingualFinish = async () => {
    try {
      const zhValues = await zhForm.validateFields();
      const enValues = enForm.getFieldsValue(true) as Record<string, unknown>;
      await onSave(buildBilingualPayload(value ?? {}, fields, zhValues, enValues));
      setDirty(false);
      message.success("已保存");
    } catch (saveError) {
      if (saveError && typeof saveError === "object" && "errorFields" in saveError) return;
      message.error(saveError instanceof Error ? saveError.message : "保存失败，请稍后重试");
    }
  };

  const handleLocaleChange = useCallback(
    (nextLocale: Locale) => {
      if (nextLocale === locale) return;
      const nextDrafts = { ...drafts };
      if (dirty) nextDrafts[locale] = form.getFieldsValue(true) as Record<string, unknown>;
      const nextValues = nextDrafts[nextLocale] ?? getLocalizedValues(value ?? {}, nextLocale);
      setDrafts(nextDrafts);
      setLocale(nextLocale);
      setDirty(false);
      form.resetFields();
      form.setFieldsValue(nextValues as never);
    },
    [dirty, drafts, form, locale, value],
  );

  const handleReset = () => {
    if (bilingual) {
      const zhValues = getLocalizedFormValues(value ?? {}, "zh", fields);
      const enValues = getLocalizedFormValues(value ?? {}, "en", fields);
      zhForm.resetFields();
      enForm.resetFields();
      zhForm.setFieldsValue(zhValues as never);
      enForm.setFieldsValue(enValues as never);
      setDirty(false);
      message.info("已还原为上次保存的内容");
      return;
    }
    form.resetFields();
    setDirty(false);
    message.info("已还原为上次保存的内容");
  };

  const formInstance = form as FormInstance<Record<string, unknown>>;

  const handleClose = () => {
    if (!onCancel) return;
    if (!dirty) {
      onCancel();
      return;
    }
    modal.confirm({
      title: "仍有未保存的修改",
      content: `关闭${pageLabel}前，是否放弃当前中英文修改？`,
      okText: "放弃并关闭",
      cancelText: "继续编辑",
      okButtonProps: { danger: true },
      onOk: onCancel,
    });
  };

  const saveButton = (
    <Button
      type="primary"
      loading={saving}
      disabled={!value}
      data-testid="content-save"
      onClick={() => void (bilingual ? handleBilingualFinish() : formInstance.submit())}
    >
      {bilingual ? "保存全部修改" : "保存"}
    </Button>
  );

  const cancelButton = onCancel ? (
    <Button onClick={handleClose} data-testid="content-cancel">
      取消
    </Button>
  ) : null;

  const toolbar = (
    <Space>
      {bilingual ? (
        <Segmented
          aria-label="语言视图"
          value={viewMode}
          options={[
            { label: "中英对照", value: "bilingual" },
            { label: "仅中文", value: "zh" },
            { label: "仅 English", value: "en" },
          ]}
          onChange={(next) => setViewMode(next as ViewMode)}
        />
      ) : (
        <LanguageSwitcher value={locale} onChange={handleLocaleChange} />
      )}
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
      {(!bilingual || !compact) && cancelButton}
      {(!bilingual || !compact) && saveButton}
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
        ) : bilingual ? (
            <BilingualContentForm
              fields={fields}
              value={value}
              zhForm={zhForm}
              enForm={enForm}
              viewMode={viewMode}
              disabled={saving}
              valueKey={value.updatedAt as string | number | undefined}
              onValuesChange={() => setDirty(true)}
              testId={testId}
            />
          ) : (
            <ContentForm
              form={formInstance}
              formName={formName}
              fields={fields}
              initialValue={localizedValue}
              disabled={saving}
              formKey={`${pageLabel}-${String(value?.updatedAt ?? "new")}-${locale}`}
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
        {bilingual && (
          <div
            style={{
              position: "sticky",
              bottom: 0,
              zIndex: 4,
              display: "flex",
              justifyContent: "flex-end",
              padding: "12px 0 4px",
              background: "linear-gradient(transparent, var(--ant-color-bg-container, #fff) 35%)",
            }}
          >
            <Space>
              {cancelButton}
              {saveButton}
            </Space>
          </div>
        )}
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
