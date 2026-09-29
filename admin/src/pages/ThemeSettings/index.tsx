import {
  BgColorsOutlined,
  ColumnWidthOutlined,
  FontSizeOutlined,
  ReloadOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import {
  App,
  Button,
  Card,
  Col,
  ColorPicker,
  Divider,
  Flex,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Progress,
  Row,
  Space,
  Tag,
  Typography,
} from "antd";
import { useState } from "react";

import PageContainer from "@/components/PageContainer";
import { DEFAULT_ADMIN_THEME, type AdminTheme } from "@/config/theme";
import { resetTheme, updateTheme } from "@/services/settings";
import { useThemeStore } from "@/store/theme";

const BRAND_PRESETS = [
  { label: "品牌色", colors: ["#eb3407", "#b72805", "#fff0eb", "#070301"] },
  { label: "常用", colors: ["#1677ff", "#00aa88", "#7c3aed", "#f59e0b", "#ef4444"] },
];

/** 主题设置：颜色 / 布局尺寸 / 排版，保存后立即生效（无需刷新）。 */
export default function ThemeSettings() {
  const { message } = App.useApp();
  const [form] = Form.useForm<AdminTheme>();
  const theme = useThemeStore((state) => state.theme);
  const applyRemote = useThemeStore((state) => state.applyRemote);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleSave = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const saved = await updateTheme(values);
      applyRemote(saved);
      message.success("主题已保存并生效");
    } catch (error) {
      message.error(error instanceof Error ? error.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      const restored = await resetTheme();
      const next = applyRemote(Object.keys(restored ?? {}).length > 0 ? restored : DEFAULT_ADMIN_THEME);
      form.setFieldsValue(next);
      message.success("已恢复默认主题");
    } catch (error) {
      message.error(error instanceof Error ? error.message : "重置失败");
    } finally {
      setResetting(false);
    }
  };

  return (
    <PageContainer
      title="主题设置"
      subTitle="后台主题色与布局参数，保存后立即生效；品牌色与前台 web 保持一致。"
      extra={
        <Space>
          <Popconfirm
            title="恢复默认主题"
            description="将品牌色、语义色与布局参数重置为系统默认值，确认继续？"
            okText="确认重置"
            cancelText="取消"
            onConfirm={() => void handleReset()}
          >
            <Button icon={<ReloadOutlined />} danger loading={resetting} data-testid="theme-reset">
              恢复默认
            </Button>
          </Popconfirm>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={() => void handleSave()}
            data-testid="theme-save"
          >
            保存
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={theme}
        onFinish={() => void handleSave()}
        data-testid="theme-settings-form"
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} xl={15}>
            <Flex vertical gap={16}>
              <Card
                className="adfly-panel"
                title={
                  <Space size={8}>
                    <BgColorsOutlined />
                    品牌色（与前台一致）
                  </Space>
                }
              >
                <Row gutter={[16, 0]}>
                  <Col xs={24} sm={12}>
                    <Form.Item name={["brand", "colorPrimary"]} label="主色" rules={[{ required: true }]}>
                      <ColorPicker showText presets={BRAND_PRESETS} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name={["brand", "colorPrimaryStrong"]} label="主色（深）">
                      <ColorPicker showText />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name={["brand", "colorPrimarySoft"]} label="主色（浅底）">
                      <ColorPicker showText />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name={["brand", "colorAccent"]} label="强调色">
                      <ColorPicker showText />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              <Card className="adfly-panel" title="语义色">
                <Row gutter={[16, 0]}>
                  <Col xs={24} sm={12}>
                    <Form.Item name={["semantic", "colorSuccess"]} label="成功">
                      <ColorPicker showText />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name={["semantic", "colorWarning"]} label="警告">
                      <ColorPicker showText />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name={["semantic", "colorError"]} label="错误">
                      <ColorPicker showText />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name={["semantic", "colorInfo"]} label="信息">
                      <ColorPicker showText />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              <Card
                className="adfly-panel"
                title={
                  <Space size={8}>
                    <ColumnWidthOutlined />
                    布局
                  </Space>
                }
              >
                <Row gutter={[16, 0]}>
                  <Col xs={24} sm={12}>
                    <Form.Item name={["layout", "headerHeight"]} label="顶栏高度">
                      <InputNumber min={48} max={96} addonAfter="px" style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name={["layout", "siderWidth"]} label="侧边栏宽度">
                      <InputNumber min={160} max={320} addonAfter="px" style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item name={["layout", "headerBg"]} label="顶栏背景">
                      <ColorPicker showText />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item name={["layout", "siderBg"]} label="侧边栏背景">
                      <ColorPicker showText />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item name={["layout", "bodyBg"]} label="内容区背景">
                      <ColorPicker showText />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              <Card
                className="adfly-panel"
                title={
                  <Space size={8}>
                    <FontSizeOutlined />
                    排版
                  </Space>
                }
              >
                <Form.Item
                  name={["typography", "fontFamily"]}
                  label="字体"
                  tooltip="CSS font-family，多个字体用逗号分隔"
                >
                  <Input placeholder="Montserrat, 'Noto Sans SC', sans-serif" />
                </Form.Item>
                <Row gutter={[16, 0]}>
                  <Col xs={24} sm={12}>
                    <Form.Item name={["typography", "fontSize"]} label="基准字号">
                      <InputNumber min={12} max={18} addonAfter="px" style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name={["typography", "borderRadius"]} label="圆角">
                      <InputNumber min={0} max={16} addonAfter="px" style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Flex>
          </Col>

          <Col xs={24} xl={9}>
            <Card className="adfly-panel adfly-preview" title="实时预览">
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <Flex gap={12}>
                  <div className="adfly-preview-swatch">
                    <span
                      className="adfly-preview-bar"
                      data-testid="theme-preview-primary"
                      style={{ background: theme.brand.colorPrimary }}
                    />
                    <Typography.Text type="secondary">主色 {theme.brand.colorPrimary}</Typography.Text>
                  </div>
                  <div className="adfly-preview-swatch">
                    <span
                      className="adfly-preview-bar"
                      data-testid="theme-preview-accent"
                      style={{ background: theme.brand.colorAccent }}
                    />
                    <Typography.Text type="secondary">强调色 {theme.brand.colorAccent}</Typography.Text>
                  </div>
                </Flex>

                <Divider style={{ margin: 0 }} />

                <Space size={8} wrap>
                  <Button type="primary" size="small">
                    主按钮
                  </Button>
                  <Button size="small">次按钮</Button>
                  <Button type="link" size="small">
                    链接
                  </Button>
                  <Tag color={theme.brand.colorPrimary}>标签</Tag>
                  <Tag color="success">成功</Tag>
                  <Tag color="warning">警告</Tag>
                </Space>

                <div>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    进度条
                  </Typography.Text>
                  <Progress percent={72} strokeColor={theme.brand.colorPrimary} />
                </div>

                <div className="adfly-spec">
                  {[
                    { label: "Font", value: theme.typography.fontFamily.split(",")[0] },
                    { label: "Base", value: `${theme.typography.fontSize}px` },
                    { label: "Radius", value: `${theme.typography.borderRadius}px` },
                    { label: "Header", value: `${theme.layout.headerHeight}px` },
                    { label: "Sider", value: `${theme.layout.siderWidth}px` },
                  ].map((item) => (
                    <div className="adfly-spec-row" key={item.label}>
                      <span className="adfly-spec-label">{item.label}</span>
                      <span className="adfly-spec-value">{item.value}</span>
                    </div>
                  ))}
                </div>

                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  保存后立即应用于顶栏、侧边栏、按钮与表格等全部 antd 组件。
                </Typography.Text>
              </Space>
            </Card>
          </Col>
        </Row>
      </Form>
    </PageContainer>
  );
}
