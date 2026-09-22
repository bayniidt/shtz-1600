import { EyeOutlined } from "@ant-design/icons";
import { Alert, App, Button, Card, Col, Form, Input, Modal, Row, Select, Skeleton, Space, Switch } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ArrayEditor from "@/components/ArrayEditor";
import ImagePicker from "@/components/ImagePicker";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import PageContainer from "@/components/PageContainer";
import StringListInput from "@/components/StringListInput";
import { toFrontendUrl } from "@/config/frontend";
import {
  UNSAVED_CONFIRM_CONTENT,
  UNSAVED_CONFIRM_TITLE,
  useUnsavedChanges,
} from "@/hooks/useUnsavedChanges";
import { buildLocalizedPayload, getLocalizedValues, type Locale } from "@/types/i18n";
import { createCase, fetchCase, updateCase } from "@/services/cases";
import {
  emptyCaseItem,
  INDUSTRY_OPTIONS,
  type CaseBlock,
  type CaseItem,
  type CaseStat,
} from "@/types/cases";

interface StatsEditorProps {
  value?: CaseStat[];
  onChange?: (next: CaseStat[]) => void;
  disabled?: boolean;
}

function StatsEditor({ value, onChange, disabled = false }: StatsEditorProps) {
  return (
    <ArrayEditor<CaseStat>
      value={value}
      onChange={onChange}
      disabled={disabled}
      addText="添加指标"
      emptyText="暂无核心指标，点击下方按钮添加"
      minItems={0}
      maxItems={24}
      createItem={() => ({ value: "", unit: "", label: "" })}
      itemTitle={(item, index) => item.label || `指标 ${index + 1}`}
      itemRender={(item, index, patch) => (
        <Row gutter={8}>
          <Col span={6}>
            <Input
              value={item.value}
              placeholder="数值"
              disabled={disabled}
              aria-label={`指标 ${index + 1} 数值`}
              onChange={(event) => patch({ value: event.target.value })}
            />
          </Col>
          <Col span={6}>
            <Input
              value={item.unit ?? ""}
              placeholder="单位"
              disabled={disabled}
              aria-label={`指标 ${index + 1} 单位`}
              onChange={(event) => patch({ unit: event.target.value })}
            />
          </Col>
          <Col span={12}>
            <Input
              value={item.label}
              placeholder="说明"
              disabled={disabled}
              aria-label={`指标 ${index + 1} 说明`}
              onChange={(event) => patch({ label: event.target.value })}
            />
          </Col>
        </Row>
      )}
    />
  );
}

interface BlocksEditorProps {
  value?: CaseBlock[];
  onChange?: (next: CaseBlock[]) => void;
  disabled?: boolean;
}

function BlocksEditor({ value, onChange, disabled = false }: BlocksEditorProps) {
  return (
    <ArrayEditor<CaseBlock>
      value={value}
      onChange={onChange}
      disabled={disabled}
      addText="添加板块"
      emptyText="暂无内容板块，点击下方按钮添加"
      minItems={0}
      maxItems={100}
      createItem={() => ({ key: "", title: "", body: [], points: [] })}
      itemTitle={(item, index) => item.title || `板块 ${index + 1}`}
      itemRender={(item, index, patch) => (
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Row gutter={8}>
            <Col span={8}>
              <Input
                value={item.key}
                placeholder="板块标识（如 background）"
                disabled={disabled}
                aria-label={`板块 ${index + 1} 标识`}
                onChange={(event) => patch({ key: event.target.value })}
              />
            </Col>
            <Col span={16}>
              <Input
                value={item.title}
                placeholder="板块标题"
                disabled={disabled}
                aria-label={`板块 ${index + 1} 标题`}
                onChange={(event) => patch({ title: event.target.value })}
              />
            </Col>
          </Row>
          <StringListInput
            value={item.body}
            onChange={(next) => patch({ body: next })}
            addText="添加段落"
            placeholder="正文段落"
            disabled={disabled}
          />
          <StringListInput
            value={item.points ?? []}
            onChange={(next) => patch({ points: next })}
            addText="添加要点"
            placeholder="要点（可选）"
            disabled={disabled}
          />
        </Space>
      )}
    />
  );
}

export interface CaseEditorPageProps {
  /** 以 Modal 形式渲染，供客户案例列表直接打开编辑。 */
  dialog?: boolean;
  open?: boolean;
  caseId?: string;
  onClose?: () => void;
  onSaved?: () => void;
}

/** 新建 / 编辑案例（复用同一组件，路由与对话框两种入口兼容）。 */
export default function CaseEditorPage({
  dialog = false,
  open = true,
  caseId,
  onClose,
  onSaved,
}: CaseEditorPageProps) {
  const routeParams = useParams();
  const id = caseId ?? routeParams.id;
  const editing = Boolean(id);
  const navigate = useNavigate();
  const { message, modal } = App.useApp();
  const [form] = Form.useForm<CaseItem>();
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [locale, setLocale] = useState<Locale>("zh");
  const [source, setSource] = useState<CaseItem | null>(null);
  const [drafts, setDrafts] = useState<Partial<Record<Locale, Record<string, unknown>>>>({});

  useUnsavedChanges(dirty, "客户案例", "cases-editor");

  useEffect(() => {
    if (!editing) {
      const empty = emptyCaseItem();
      setSource(empty);
      setDrafts({});
      form.resetFields();
      form.setFieldsValue(empty);
      setError(null);
      setDirty(false);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    fetchCase(id!)
      .then((data) => {
        if (!active) return;
        setSource(data);
        setDrafts((current) => {
          const next = { ...current };
          delete next[locale];
          return next;
        });
        form.setFieldsValue(getLocalizedValues(data, locale) as Partial<CaseItem>);
        setError(null);
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : "案例加载失败，请稍后重试");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [editing, id, form]);

  const handleLocaleChange = useCallback(
    (nextLocale: Locale) => {
      if (nextLocale === locale) return;
      const nextDrafts = { ...drafts };
      if (dirty) nextDrafts[locale] = form.getFieldsValue(true) as Record<string, unknown>;
      const nextValues = nextDrafts[nextLocale] ?? getLocalizedValues(source ?? emptyCaseItem(), nextLocale);
      setDrafts(nextDrafts);
      setLocale(nextLocale);
      setDirty(false);
      form.resetFields();
      form.setFieldsValue(nextValues as Partial<CaseItem>);
    },
    [dirty, drafts, form, locale, source],
  );

  const handleFinish = useCallback(
    async (values: CaseItem) => {
      setSaving(true);
      try {
        const payload = buildLocalizedPayload(source ?? emptyCaseItem(), locale, values) as unknown as CaseItem;
        if (editing) {
          const saved = await updateCase(id!, { ...payload, id: id! });
          setSource(saved);
          message.success("案例已保存");
        } else {
          const saved = await createCase(payload);
          setSource(saved);
          message.success("案例已创建");
        }
        setDrafts({});
        setDirty(false);
        if (dialog) {
          onSaved?.();
          onClose?.();
        } else {
          navigate("/cases");
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
      else navigate("/cases");
      return;
    }
    modal.confirm({
      title: UNSAVED_CONFIRM_TITLE,
      content: `客户案例${UNSAVED_CONFIRM_CONTENT}`,
      okText: "放弃修改并离开",
      cancelText: "留在本页",
      okButtonProps: { danger: true },
      onOk: () => {
        if (dialog) onClose?.();
        else navigate("/cases");
      },
    });
  }, [dialog, dirty, modal, navigate, onClose]);

  const toolbar = (
    <Space>
      <LanguageSwitcher value={locale} onChange={handleLocaleChange} />
      {editing && (
        <Button
          icon={<EyeOutlined />}
          href={toFrontendUrl(`/cases/${id}`)}
          target="_blank"
          rel="noopener noreferrer"
        >
          前台预览
        </Button>
      )}
      <Button onClick={handleCancel} data-testid="case-cancel">
        取消
      </Button>
      <Button type="primary" loading={saving} onClick={() => void form.submit()} data-testid="case-save">
        保存
      </Button>
    </Space>
  );

  const content = (
    <>
      {error && (
          <Alert
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
            message="案例加载失败"
            description={error}
          />
        )}

      {dirty && (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
            message="有未保存的修改，离开本页前请先保存"
            data-testid="case-dirty-tip"
          />
        )}

      <Card size="small" data-testid="case-editor-card">
        {loading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : (
          <Form
              form={form}
              layout="vertical"
              initialValues={emptyCaseItem()}
              disabled={saving}
              onFinish={(values) => void handleFinish(values)}
              onValuesChange={() => setDirty(true)}
              scrollToFirstError
              data-testid="case-form"
            >
              <Card size="small" className="adfly-subcard" title="基本信息">
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      name="id"
                      label="案例 ID（slug）"
                      rules={[{ required: true, message: "案例 ID 不能为空" }]}
                    >
                      <Input placeholder="case-001" disabled={editing} />
                    </Form.Item>
                  </Col>
                  <Col span={16}>
                    <Form.Item
                      name="title"
                      label="案例标题"
                      rules={[{ required: true, message: "案例标题不能为空" }]}
                    >
                      <Input placeholder="案例标题" />
                    </Form.Item>
                  </Col>

                  <Col span={8}>
                    <Form.Item
                      name="client"
                      label="客户名称"
                      rules={[{ required: true, message: "客户名称不能为空" }]}
                    >
                      <Input placeholder="客户名称" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="industry" label="行业" rules={[{ required: true, message: "请选择行业" }]}>
                      <Select options={INDUSTRY_OPTIONS} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="year" label="年份">
                      <Input placeholder="2024" />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item name="region" label="投放区域">
                      <Input placeholder="日本 / 欧美" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="featured" label="首页置顶" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>

                  <Col span={24}>
                    <Form.Item name="cover" label="封面图">
                      <ImagePicker placeholder="/images/case-001.png" />
                    </Form.Item>
                  </Col>

                  <Col span={24}>
                    <Form.Item name="summary" label="案例简介">
                      <Input.TextArea rows={3} placeholder="一句话说明案例背景与成效" />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item name="awards" label="所获奖项">
                      <StringListInput addText="添加奖项" placeholder="年度大奖" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="tags" label="标签">
                      <StringListInput addText="添加标签" placeholder="日本 / 游戏" />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              <Card size="small" className="adfly-subcard" title="核心指标（stats）">
                <Form.Item name="stats" style={{ marginBottom: 0 }}>
                  <StatsEditor disabled={saving} />
                </Form.Item>
              </Card>

              <Card size="small" className="adfly-subcard" title="内容板块（blocks）">
                <Form.Item name="blocks" style={{ marginBottom: 0 }}>
                  <BlocksEditor disabled={saving} />
                </Form.Item>
              </Card>
          </Form>
        )}
      </Card>
    </>
  );

  if (dialog) {
    return (
      <Modal
        open={open}
        title={editing ? "编辑客户案例" : "新建客户案例"}
        width={1040}
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
        data-testid="case-editor-dialog"
      >
        {content}
      </Modal>
    );
  }

  return (
    <div data-testid="case-editor">
      <PageContainer
        title={editing ? "编辑案例" : "新建案例"}
        subTitle={editing ? `业务主键：${id}` : "业务主键（id）创建后不可修改"}
        extra={toolbar}
      >
        {content}
      </PageContainer>
    </div>
  );
}
