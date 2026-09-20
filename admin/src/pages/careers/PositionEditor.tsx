import { Alert, App, Button, Card, Form, Input, Modal, Select, Skeleton, Space, Switch } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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

type PositionFormValues = Omit<CareerPosition, "extraCities"> & { extraCities: string[] };

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
          form.setFieldsValue({
            ...position,
            extraCities: splitCityIds(position.extraCities),
            hot: flagValue(position.hot),
            urgent: flagValue(position.urgent),
          });
        } else {
          form.resetFields();
          form.setFieldsValue({ ...emptyCareerPosition(), extraCities: [] });
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

  const handleFinish = useCallback(
    async (values: PositionFormValues) => {
      const payload: CareerPosition = { ...values, extraCities: values.extraCities.join("/") };
      setSaving(true);
      try {
        if (editing) {
          await updateCareerPosition(id!, payload);
          message.success("职位已保存");
        } else {
          await createCareerPosition(payload);
          message.success("职位已创建");
        }
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
    [dialog, editing, id, message, navigate, onClose, onSaved],
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
              <Form.Item name="summary" label="职位简介"><Input.TextArea rows={3} /></Form.Item>
              <Form.Item name="description" label="职位职责"><Input.TextArea rows={7} /></Form.Item>
              <Form.Item name="requirement" label="任职要求"><Input.TextArea rows={7} /></Form.Item>
              <Form.Item name="bonus" label="加分项"><Input.TextArea rows={5} /></Form.Item>
              <Form.Item name="applyUrl" label="投递链接"><Input /></Form.Item>
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
