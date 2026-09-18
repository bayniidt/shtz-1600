import { App, Button, Card, ColorPicker, Divider, Form, Input, InputNumber, Popconfirm, Space, Typography } from "antd";

import PageContainer from "@/components/PageContainer";
import { DEFAULT_ADMIN_THEME, type AdminTheme } from "@/config/theme";
import { resetTheme, updateTheme } from "@/services/settings";
import { useThemeStore } from "@/store/theme";
import { useState } from "react";

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
            <Button danger loading={resetting} data-testid="theme-reset">
              恢复默认
            </Button>
          </Popconfirm>
          <Button type="primary" loading={saving} onClick={() => void handleSave()} data-testid="theme-save">
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
        style={{ maxWidth: 720 }}
      >
        <Card size="small" title="品牌色（与前台一致）">
          <Space size={24} wrap>
            <Form.Item name={["brand", "colorPrimary"]} label="主色" rules={[{ required: true }]}>
              <ColorPicker showText />
            </Form.Item>
            <Form.Item name={["brand", "colorPrimaryStrong"]} label="主色（深）">
              <ColorPicker showText />
            </Form.Item>
            <Form.Item name={["brand", "colorPrimarySoft"]} label="主色（浅底）">
              <ColorPicker showText />
            </Form.Item>
            <Form.Item name={["brand", "colorAccent"]} label="强调色">
              <ColorPicker showText />
            </Form.Item>
          </Space>
        </Card>

        <Divider />

        <Card size="small" title="语义色">
          <Space size={24} wrap>
            <Form.Item name={["semantic", "colorSuccess"]} label="成功">
              <ColorPicker showText />
            </Form.Item>
            <Form.Item name={["semantic", "colorWarning"]} label="警告">
              <ColorPicker showText />
            </Form.Item>
            <Form.Item name={["semantic", "colorError"]} label="错误">
              <ColorPicker showText />
            </Form.Item>
            <Form.Item name={["semantic", "colorInfo"]} label="信息">
              <ColorPicker showText />
            </Form.Item>
          </Space>
        </Card>

        <Divider />

        <Card size="small" title="布局">
          <Space size={24} wrap>
            <Form.Item name={["layout", "headerHeight"]} label="顶栏高度 (px)">
              <InputNumber min={48} max={96} />
            </Form.Item>
            <Form.Item name={["layout", "siderWidth"]} label="侧边栏宽度 (px)">
              <InputNumber min={160} max={320} />
            </Form.Item>
            <Form.Item name={["layout", "headerBg"]} label="顶栏背景">
              <ColorPicker showText />
            </Form.Item>
            <Form.Item name={["layout", "siderBg"]} label="侧边栏背景">
              <ColorPicker showText />
            </Form.Item>
            <Form.Item name={["layout", "bodyBg"]} label="内容区背景">
              <ColorPicker showText />
            </Form.Item>
          </Space>
        </Card>

        <Divider />

        <Card size="small" title="排版">
          <Form.Item name={["typography", "fontFamily"]} label="字体">
            <Input placeholder="Montserrat, 'Noto Sans SC', sans-serif" />
          </Form.Item>
          <Space size={24} wrap>
            <Form.Item name={["typography", "fontSize"]} label="基准字号 (px)">
              <InputNumber min={12} max={18} />
            </Form.Item>
            <Form.Item name={["typography", "borderRadius"]} label="圆角 (px)">
              <InputNumber min={0} max={16} />
            </Form.Item>
          </Space>
        </Card>

        <Divider />

        <Card size="small" title="实时预览">
          <Space direction="vertical" size={8} style={{ width: "100%" }}>
            <Typography.Text type="secondary">
              当前主色：{theme.brand.colorPrimary} · 强调色：{theme.brand.colorAccent}
            </Typography.Text>
            <Space size={8} wrap>
              <Button type="primary">主按钮</Button>
              <Button>次按钮</Button>
              <span
                data-testid="theme-preview-primary"
                style={{
                  display: "inline-block",
                  width: 120,
                  height: 12,
                  borderRadius: 6,
                  background: theme.brand.colorPrimary,
                }}
              />
              <span
                data-testid="theme-preview-accent"
                style={{
                  display: "inline-block",
                  width: 120,
                  height: 12,
                  borderRadius: 6,
                  background: theme.brand.colorAccent,
                }}
              />
            </Space>
          </Space>
        </Card>
      </Form>
    </PageContainer>
  );
}
