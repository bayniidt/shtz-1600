import { Alert, App, Button, Card, Form, Input, Modal, Skeleton, Space, Switch, Table } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import PageContainer from "@/components/PageContainer";
import { UNSAVED_CONFIRM_CONTENT, UNSAVED_CONFIRM_TITLE, useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { createCareerCity, fetchCareerCity, updateCareerCity } from "@/services/careers";
import { emptyCareerCity, flagValue, type CareerCity, type CareerPosition } from "@/types/careers";
import { buildLocalizedPayload, getLocalizedValues, type Locale } from "@/types/i18n";

export interface CityEditorPageProps {
  dialog?: boolean;
  open?: boolean;
  cityId?: string;
  onClose?: () => void;
  onSaved?: () => void;
}

/** 城市编辑：城市 id 可修改，保存时由后端联动职位引用。 */
export default function CityEditorPage({
  dialog = false,
  open = true,
  cityId,
  onClose,
  onSaved,
}: CityEditorPageProps) {
  const routeParams = useParams();
  const id = cityId ?? routeParams.id;
  const editing = Boolean(id);
  const navigate = useNavigate();
  const { message, modal } = App.useApp();
  const [form] = Form.useForm<CareerCity>();
  const [positions, setPositions] = useState<CareerPosition[]>([]);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [locale, setLocale] = useState<Locale>("zh");
  const [source, setSource] = useState<CareerCity | null>(null);
  const [drafts, setDrafts] = useState<Partial<Record<Locale, Record<string, unknown>>>>({});

  useUnsavedChanges(dirty, "招聘城市", "careers-city-editor");

  useEffect(() => {
    if (!editing) {
      const empty = emptyCareerCity();
      setSource(empty);
      setDrafts({});
      form.resetFields();
      form.setFieldsValue(empty);
      setPositions([]);
      setError(null);
      setDirty(false);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    fetchCareerCity(id!)
      .then((data) => {
        if (!active) return;
        setSource(data);
        setDrafts((current) => {
          const next = { ...current };
          delete next[locale];
          return next;
        });
        form.setFieldsValue({
          ...getLocalizedValues(data, locale),
          featured: flagValue(data.featured),
        } as Partial<CareerCity>);
        setPositions(data.positions ?? []);
        setError(null);
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : "城市加载失败，请稍后重试");
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
      const nextValues = nextDrafts[nextLocale] ?? getLocalizedValues(source ?? emptyCareerCity(), nextLocale);
      setDrafts(nextDrafts);
      setLocale(nextLocale);
      setDirty(false);
      form.resetFields();
      form.setFieldsValue({ ...nextValues, featured: flagValue(nextValues.featured as boolean | string) });
    },
    [dirty, drafts, form, locale, source],
  );

  const handleFinish = useCallback(
    async (values: CareerCity) => {
      setSaving(true);
      try {
        const payload = buildLocalizedPayload(source ?? emptyCareerCity(), locale, values) as unknown as CareerCity;
        if (editing) {
          const saved = await updateCareerCity(id!, payload);
          setSource(saved);
          message.success("城市已保存，职位归属已同步");
        } else {
          const saved = await createCareerCity(payload);
          setSource(saved);
          message.success("城市已创建");
        }
        setDrafts({});
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
      content: `招聘城市${UNSAVED_CONFIRM_CONTENT}`,
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
      <Button onClick={handleCancel} data-testid="city-cancel">取消</Button>
      <Button type="primary" loading={saving} onClick={() => void form.submit()} data-testid="city-save">保存</Button>
    </Space>
  );

  const content = (
    <>
      {loading ? <Skeleton active /> : null}
      {error ? <Alert type="error" message="城市加载失败" description={error} showIcon /> : null}
      {!loading && !error ? (
          <>
            {editing ? (
              <Alert
                type="warning"
                showIcon
                message="修改城市 ID 会同步更新职位归属和附加城市"
                description="请确认新的 ID 未被其他城市使用；保存成功后旧 ID 将不再可用。"
                style={{ marginBottom: 16 }}
              />
            ) : null}
            <Card>
              <Form<CareerCity>
                form={form}
                layout="vertical"
                onValuesChange={() => setDirty(true)}
                onFinish={(values) => void handleFinish(values)}
              >
                <Form.Item name="id" label="城市 ID（slug）" rules={[{ required: true, message: "请输入城市 ID" }]}>
                  <Input placeholder="如 shanghai" />
                </Form.Item>
                <Form.Item name="name" label="城市名称" rules={[{ required: true, message: "请输入城市名称" }]}>
                  <Input placeholder="如 上海" />
                </Form.Item>
                <Form.Item name="nameEn" label="英文名称"><Input placeholder="如 Shanghai" /></Form.Item>
                <Form.Item name="code" label="城市编码"><Input placeholder="如 CT_125" /></Form.Item>
                <Form.Item name="summary" label="城市简介"><Input.TextArea rows={3} /></Form.Item>
                <Form.Item name="featured" label="重点城市" valuePropName="checked">
                  <Switch checkedChildren="重点" unCheckedChildren="普通" />
                </Form.Item>
              </Form>
            </Card>
            {editing ? (
              <Card title={`关联职位（${positions.length}）`} style={{ marginTop: 16 }}>
                <Table<CareerPosition>
                  rowKey="id"
                  dataSource={positions}
                  pagination={false}
                  columns={[
                    { title: "职位名称", dataIndex: "title" },
                    { title: "主城市", dataIndex: "cityId" },
                    { title: "发布日期", dataIndex: "publishedAt" },
                  ]}
                />
              </Card>
            ) : null}
          </>
      ) : null}
    </>
  );

  if (dialog) {
    return (
      <Modal
        open={open}
        title={editing ? "编辑招聘城市" : "新建招聘城市"}
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
        data-testid="city-editor-dialog"
      >
        {content}
      </Modal>
    );
  }

  return (
    <div data-testid="city-editor">
      <PageContainer
        title={editing ? "编辑招聘城市" : "新建招聘城市"}
        subTitle={editing ? `当前城市：${id}` : "城市 ID 创建后可通过编辑页修改并联动职位"}
        extra={toolbar}
      >
        {content}
      </PageContainer>
    </div>
  );
}
