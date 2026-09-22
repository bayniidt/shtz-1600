import { Alert, App, Button, Card, Form, Input, Modal, Select, Skeleton, Space, Switch } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import PageContainer from "@/components/PageContainer";
import { UNSAVED_CONFIRM_CONTENT, UNSAVED_CONFIRM_TITLE, useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import {
  createCareerPosition,
  fetchCareerCities,
  fetchCareerPosition,
  updateCareerPosition,
} from "@/services/careers";
import {
  emptyCareerPosition,
  flagValue,
  splitCityIds,
  type CareerCity,
  type CareerPosition,
} from "@/types/careers";
import { buildLocalizedPayload, getLocalizedValues, type Locale } from "@/types/i18n";

type PositionFormValues = Omit<CareerPosition, "extraCities"> & { extraCities: string[] };

function toPositionFormValues(value: CareerPosition): PositionFormValues {
  return {
    ...value,
    extraCities: splitCityIds(value.extraCities),
    hot: flagValue(value.hot),
    urgent: flagValue(value.urgent),
  };
}

export interface PositionEditorPageProps {
  dialog?: boolean;
  open?: boolean;
  positionId?: string;
  onClose?: () => void;
  onSaved?: () => void;
}

/** 职位编辑：主城市单选，附加城市多选并在保存时回写为 / 分隔 id。 */
export default function PositionEditorPage({
  dialog = false,
  open = true,
  positionId,
  onClose,
  onSaved,
}: PositionEditorPageProps) {
  const routeParams = useParams();
  const id = positionId ?? routeParams.id;
  const editing = Boolean(id);
  const navigate = useNavigate();
  const { message, modal } = App.useApp();
  const [form] = Form.useForm<PositionFormValues>();
  const [cities, setCities] = useState<CareerCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [locale, setLocale] = useState<Locale>("zh");
  const [source, setSource] = useState<CareerPosition | null>(null);
  const [drafts, setDrafts] = useState<Partial<Record<Locale, Record<string, unknown>>>>({});

  useUnsavedChanges(dirty, "招聘职位", "careers-position-editor");

  useEffect(() => {
    let active = true;
    setLoading(true);
    const cityRequest = fetchCareerCities({ page: 1, pageSize: 100 });
    const positionRequest = editing ? fetchCareerPosition(id!) : Promise.resolve(null);
    Promise.all([cityRequest, positionRequest])
      .then(([cityResult, position]) => {
        if (!active) return;
        setCities(cityResult.items);
        if (position) {
          setSource(position);
          setDrafts({});
          form.setFieldsValue({
            ...toPositionFormValues(getLocalizedValues(position, locale) as unknown as CareerPosition),
          });
        } else {
          const empty = emptyCareerPosition();
          setSource(empty);
          setDrafts({});
          form.resetFields();
          form.setFieldsValue({ ...empty, extraCities: [] });
        }
        setError(null);
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : "职位加载失败，请稍后重试");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [editing, form, id]);

  const handleLocaleChange = useCallback(
    (nextLocale: Locale) => {
      if (nextLocale === locale) return;
      const nextDrafts = { ...drafts };
      if (dirty) nextDrafts[locale] = form.getFieldsValue(true) as Record<string, unknown>;
      const nextValues = nextDrafts[nextLocale]
        ? (nextDrafts[nextLocale] as Partial<PositionFormValues>)
        : toPositionFormValues(getLocalizedValues(source ?? emptyCareerPosition(), nextLocale) as unknown as CareerPosition);
      setDrafts(nextDrafts);
      setLocale(nextLocale);
      setDirty(false);
      form.resetFields();
      form.setFieldsValue(nextValues);
    },
    [dirty, drafts, form, locale, source],
  );

  const handleFinish = useCallback(
    async (values: PositionFormValues) => {
      const valuesForPayload = { ...values, extraCities: values.extraCities.join("/") };
      const payload = buildLocalizedPayload(
        source ?? emptyCareerPosition(),
        locale,
        valuesForPayload,
      ) as unknown as CareerPosition;
      setSaving(true);
      try {
        if (editing) {
          const saved = await updateCareerPosition(id!, payload);
          setSource(saved);
          message.success("职位已保存");
        } else {
          const saved = await createCareerPosition(payload);
          setSource(saved);
          message.success("职位已创建");
        }
        setDrafts((current) => {
          const next = { ...current };
          delete next[locale];
          return next;
        });
        setDirty(false);
        if (dialog) {
          onSaved?.();
          onClose?.();
        } else {
          navigate("/careers");
        }
      } catch (saveError) {
        message.error(saveError instanceof Error ? saveError.message : "保存失败，请稍后重试");
      } finally {
        setSaving(false);
      }
    },
    [dialog, editing, id, locale, message, navigate, onClose, onSaved, source],
  );

  const handleCancel = useCallback(() => {
    if (!dirty) {
      if (dialog) onClose?.();
      else navigate("/careers");
      return;
    }
    modal.confirm({
      title: UNSAVED_CONFIRM_TITLE,
      content: `招聘职位${UNSAVED_CONFIRM_CONTENT}`,
      okText: "放弃修改并离开",
      cancelText: "留在本页",
      okButtonProps: { danger: true },
      onOk: () => {
        if (dialog) onClose?.();
        else navigate("/careers");
      },
    });
  }, [dialog, dirty, modal, navigate, onClose]);

  const toolbar = (
    <Space>
      <LanguageSwitcher value={locale} onChange={handleLocaleChange} />
      <Button onClick={handleCancel} data-testid="position-cancel">取消</Button>
      <Button type="primary" loading={saving} onClick={() => void form.submit()} data-testid="position-save">保存</Button>
    </Space>
  );

  const content = (
    <>
      {loading ? <Skeleton active /> : null}
      {error ? <Alert type="error" message="职位加载失败" description={error} showIcon /> : null}
      {!loading && !error ? (
          <Card>
            <Form<PositionFormValues>
              form={form}
              layout="vertical"
              onValuesChange={() => setDirty(true)}
              onFinish={(values) => void handleFinish(values)}
            >
              <div className="adfly-field-grid">
              <Form.Item name="id" label="职位 ID（slug）" rules={[{ required: true, message: "请输入职位 ID" }]}>
                <Input disabled={editing} placeholder="如 position-001" />
              </Form.Item>
              <Form.Item name="title" label="职位名称" rules={[{ required: true, message: "请输入职位名称" }]}>
                <Input />
              </Form.Item>
              <Form.Item name="cityId" label="主归属城市" rules={[{ required: true, message: "请选择主归属城市" }]}>
                <Select showSearch optionFilterProp="label" options={cities.map((city) => ({ value: city.id, label: `${city.name}（${city.id}）` }))} />
              </Form.Item>
              <Form.Item name="extraCities" label="附加城市">
                <Select
                  mode="multiple"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={cities.map((city) => ({ value: city.id, label: `${city.name}（${city.id}）` }))}
                />
              </Form.Item>
              <Form.Item name="type" label="职位类型"><Input /></Form.Item>
              <Form.Item name="department" label="部门"><Input /></Form.Item>
              <Form.Item name="tags" label="标签（/ 分隔）"><Input /></Form.Item>
              <Space size={32}>
                <Form.Item name="hot" label="热招" valuePropName="checked"><Switch /></Form.Item>
                <Form.Item name="urgent" label="急招" valuePropName="checked"><Switch /></Form.Item>
              </Space>
              <Form.Item name="publishedAt" label="发布日期"><Input placeholder="如 2026-09-18" /></Form.Item>
              <Form.Item name="summary" label="职位简介" className="adfly-field-full">
                <Input.TextArea rows={3} />
              </Form.Item>
              <Form.Item name="description" label="职位职责" className="adfly-field-full">
                <Input.TextArea rows={7} />
              </Form.Item>
              <Form.Item name="requirement" label="任职要求" className="adfly-field-full">
                <Input.TextArea rows={7} />
              </Form.Item>
              <Form.Item name="bonus" label="加分项" className="adfly-field-full">
                <Input.TextArea rows={5} />
              </Form.Item>
              <Form.Item name="applyUrl" label="投递链接" className="adfly-field-full">
                <Input />
              </Form.Item>
              </div>
            </Form>
          </Card>
      ) : null}
    </>
  );

  if (dialog) {
    return (
      <Modal
        open={open}
        title={editing ? "编辑招聘职位" : "新建招聘职位"}
        width={900}
        centered
        destroyOnHidden
        footer={toolbar}
        styles={{
          body: {
            maxHeight: "calc(100vh - 220px)",
            overflowY: "auto",
            paddingRight: 4,
          },
        }}
        onCancel={handleCancel}
        data-testid="position-editor-dialog"
      >
        {content}
      </Modal>
    );
  }

  return (
    <div data-testid="position-editor">
      <PageContainer
        title={editing ? "编辑招聘职位" : "新建招聘职位"}
        subTitle={editing ? `业务主键：${id}` : "职位 ID 创建后不可修改"}
        extra={toolbar}
      >
        {content}
      </PageContainer>
    </div>
  );
}
