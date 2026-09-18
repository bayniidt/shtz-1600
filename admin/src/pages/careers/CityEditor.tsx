import { Alert, App, Button, Card, Form, Input, Skeleton, Space, Switch, Table } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import PageContainer from "@/components/PageContainer";
import { UNSAVED_CONFIRM_CONTENT, UNSAVED_CONFIRM_TITLE, useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { createCareerCity, fetchCareerCity, updateCareerCity } from "@/services/careers";
import { emptyCareerCity, flagValue, type CareerCity, type CareerPosition } from "@/types/careers";

/** 城市编辑：城市 id 可修改，保存时由后端联动职位引用。 */
export default function CityEditorPage() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const { message, modal } = App.useApp();
  const [form] = Form.useForm<CareerCity>();
  const [positions, setPositions] = useState<CareerPosition[]>([]);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  useUnsavedChanges(dirty, "招聘城市", "careers-city-editor");

  useEffect(() => {
    if (!editing) {
      form.setFieldsValue(emptyCareerCity());
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    fetchCareerCity(id!)
      .then((data) => {
        if (!active) return;
        form.setFieldsValue({ ...data, featured: flagValue(data.featured) });
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

  const handleFinish = useCallback(
    async (values: CareerCity) => {
      setSaving(true);
      try {
        if (editing) {
          await updateCareerCity(id!, values);
          message.success("城市已保存，职位归属已同步");
        } else {
          await createCareerCity(values);
          message.success("城市已创建");
        }
        setDirty(false);
        navigate("/careers");
      } catch (saveError) {
        message.error(saveError instanceof Error ? saveError.message : "保存失败，请稍后重试");
      } finally {
        setSaving(false);
      }
    },
    [editing, id, message, navigate],
  );

  const handleCancel = useCallback(() => {
    if (!dirty) {
      navigate("/careers");
      return;
    }
    modal.confirm({
      title: UNSAVED_CONFIRM_TITLE,
      content: `招聘城市${UNSAVED_CONFIRM_CONTENT}`,
      okText: "放弃修改并离开",
      cancelText: "留在本页",
      okButtonProps: { danger: true },
      onOk: () => navigate("/careers"),
    });
  }, [dirty, modal, navigate]);

  return (
    <div data-testid="city-editor">
      <PageContainer
        title={editing ? "编辑招聘城市" : "新建招聘城市"}
        subTitle={editing ? `当前城市：${id}` : "城市 ID 创建后可通过编辑页修改并联动职位"}
        extra={
          <Space>
            <Button onClick={handleCancel} data-testid="city-cancel">取消</Button>
            <Button type="primary" loading={saving} onClick={() => void form.submit()} data-testid="city-save">保存</Button>
          </Space>
        }
      >
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
      </PageContainer>
    </div>
  );
}
