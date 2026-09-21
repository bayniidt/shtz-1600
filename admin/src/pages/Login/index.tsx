import { LockOutlined, SafetyCertificateOutlined, UserOutlined } from "@ant-design/icons";
import { App as AntdApp, Button, Card, Divider, Flex, Form, Input, Space, Tag, Typography } from "antd";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { ApiRequestError } from "@/services/request";
import { useAuthStore } from "@/store/auth";
import { useThemeStore } from "@/store/theme";

interface LoginForm {
  username: string;
  password: string;
}

const POINTS = [
  "内容、案例与招聘一体化管理",
  "改动即时同步到前台站点",
  "登录状态由 JWT 统一鉴权",
];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = AntdApp.useApp();

  const token = useAuthStore((state) => state.token);
  const signingIn = useAuthStore((state) => state.signingIn);
  const signIn = useAuthStore((state) => state.signIn);
  const theme = useThemeStore((state) => state.theme);

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const handleSubmit = async (values: LoginForm) => {
    try {
      const user = await signIn(values.username.trim(), values.password);
      message.success(`欢迎回来，${user.username}`);
      navigate(from, { replace: true });
    } catch (error) {
      const text = error instanceof ApiRequestError ? error.message : "登录失败，请稍后重试";
      message.error(text);
    }
  };

  return (
    <div className="adfly-login" style={{ background: theme.layout.bodyBg }}>
      <Card className="adfly-login-card" styles={{ body: { padding: 0 } }}>
        <div className="adfly-login-grid">
          <aside className="adfly-login-brand">
            <Flex align="center" gap={10}>
              <span className="adfly-brand-mark">A</span>
              <span className="adfly-brand-text">
                ADFLY
                <span className="adfly-brand-sub">Admin Console</span>
              </span>
            </Flex>

            <Typography.Title level={3} className="adfly-login-headline">
              全球智能营销科技服务商
              <br />
              内容管理后台
            </Typography.Title>

            <Typography.Text className="adfly-login-sub">
              统一维护站点文案、客户案例与招聘信息，改动保存后即时生效于前台站点。
            </Typography.Text>

            <Space direction="vertical" size={12} className="adfly-login-points">
              {POINTS.map((point) => (
                <Space key={point} size={10} align="center">
                  <span className="adfly-login-point-square" />
                  <Typography.Text className="adfly-login-point">{point}</Typography.Text>
                </Space>
              ))}
            </Space>

            <Tag className="adfly-login-badge" icon={<SafetyCertificateOutlined />}>
              JWT 鉴权 · 操作留痕
            </Tag>
          </aside>

          <section className="adfly-login-form">
            <Typography.Title level={4} style={{ marginBottom: 0 }}>
              登录
            </Typography.Title>
            <span className="adfly-login-caption">管理后台 · Admin Console</span>

            <Form<LoginForm>
              layout="vertical"
              size="large"
              requiredMark={false}
              initialValues={{ username: "", password: "" }}
              onFinish={handleSubmit}
            >
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: "请输入用户名" }]}
              >
                <Input prefix={<UserOutlined />} placeholder="admin" autoComplete="username" />
              </Form.Item>

              <Form.Item
                name="password"
                label="密码"
                rules={[{ required: true, message: "请输入密码" }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="••••••"
                  autoComplete="current-password"
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button type="primary" htmlType="submit" block loading={signingIn}>
                  登录
                </Button>
              </Form.Item>
            </Form>

            <Divider plain className="adfly-login-divider">
              仅限内部使用
            </Divider>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              © 2026 ADFLY · 遇到问题请联系系统管理员
            </Typography.Text>
          </section>
        </div>
      </Card>
    </div>
  );
}
