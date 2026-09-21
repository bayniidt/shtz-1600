import { Alert, Card, Progress, Space, Tag, Typography } from "antd";
import type { FormInstance } from "antd";
import { useEffect, useMemo, type ReactNode } from "react";

import ContentForm from "@/components/ContentForm";
import type { FieldSpec } from "@/types/field-spec";
import { getLocalizedFormValues, getTranslationProgress, type ViewMode } from "@/types/i18n";

interface BilingualContentFormProps {
  fields: FieldSpec[];
  value: Record<string, unknown>;
  zhForm: FormInstance<Record<string, unknown>>;
  enForm: FormInstance<Record<string, unknown>>;
  viewMode: ViewMode;
  disabled?: boolean;
  onValuesChange: () => void;
  valueKey?: string | number;
  testId?: string;
}

function defaultShared(field: FieldSpec): boolean {
  return (
    field.localization === "shared" ||
    field.localization === "source-only" ||
    (field.kind === "link" && field.name.endsWith(".href")) ||
    ["number", "select", "switch", "image"].includes(field.kind)
  );
}

function statusTag(value: Record<string, unknown>, field: FieldSpec): ReactNode {
  const progress = getTranslationProgress(value, [field]);
  if (progress.total === 0) return <Tag color="default">无需翻译</Tag>;
  if (progress.done === progress.total) return <Tag color="success">已翻译</Tag>;
  return <Tag color="warning">前台将显示中文</Tag>;
}

/** 双语内容工作台：中文维护主结构，英文只编辑翻译字段。 */
export default function BilingualContentForm({
  fields,
  value,
  zhForm,
  enForm,
  viewMode,
  disabled = false,
  onValuesChange,
  valueKey,
  testId,
}: BilingualContentFormProps) {
  const zhInitial = useMemo(() => getLocalizedFormValues(value, "zh", fields), [fields, value]);
  const enInitial = useMemo(() => getLocalizedFormValues(value, "en", fields), [fields, value]);
  const progress = getTranslationProgress(value, fields);

  useEffect(() => {
    zhForm.resetFields();
    enForm.resetFields();
    zhForm.setFieldsValue(zhInitial as never);
    enForm.setFieldsValue(enInitial as never);
  }, [enForm, valueKey, zhForm, zhInitial, enInitial]);

  const englishLabel = (field: FieldSpec) => (
    <Space size={6}>
      <span>English · {field.label}</span>
      {statusTag(value, field)}
    </Space>
  );

  const renderZh = viewMode !== "en";
  const renderEn = viewMode !== "zh";

  return (
    <div data-testid={testId ? `${testId}-bilingual-form` : "bilingual-content-form"}>
      {progress.total > 0 && (
        <Alert
          type={progress.done === progress.total ? "success" : "info"}
          showIcon
          style={{ marginBottom: 16 }}
          message={
            <Space>
              <span>English 翻译进度</span>
              <Progress
                percent={progress.percent}
                size="small"
                style={{ width: 160 }}
                format={() => `${progress.done}/${progress.total}`}
              />
            </Space>
          }
          description={
            progress.done === progress.total
              ? "当前模块双语内容已完成。"
              : "英文缺失字段会在前台回退显示中文。"
          }
        />
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            viewMode === "bilingual" ? "minmax(0, 1fr) minmax(0, 1fr)" : "minmax(0, 1fr)",
          gap: 16,
          alignItems: "start",
        }}
      >
        {renderZh && (
          <Card
            size="small"
            title={<Typography.Text strong>中文主语言</Typography.Text>}
            extra={<Tag color="blue">结构与共享字段</Tag>}
            data-testid={testId ? `${testId}-zh` : "bilingual-zh"}
          >
            <ContentForm
              fields={fields}
              initialValue={zhInitial}
              form={zhForm}
              formName={`${testId ?? "bilingual"}-zh`}
              disabled={disabled}
              testId="content-form"
              onValuesChange={onValuesChange}
            />
          </Card>
        )}

        {renderEn && (
          <Card
            size="small"
            title={<Typography.Text strong>English 翻译</Typography.Text>}
            extra={<Tag color="gold">只编辑翻译字段</Tag>}
            data-testid={testId ? `${testId}-en` : "bilingual-en"}
          >
            <ContentForm
              fields={fields}
              initialValue={enInitial}
              form={enForm}
              formName={`${testId ?? "bilingual"}-en`}
              disabled={disabled}
              skipRequiredValidation
              lockStructure
              labelFor={englishLabel}
              isShared={defaultShared}
              hideShared
              testId="content-form-en"
              onValuesChange={onValuesChange}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
