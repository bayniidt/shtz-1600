import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { App as AntdApp, Button, Card, Form, Input, Typography } from "antd";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { ApiRequestError } from "@/services/request";
import { useAuthStore } from "@/store/auth";
import { useThemeStore } from "@/store/theme";

interface LoginForm {
  username: string;
  password: string;
}

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
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ background: theme.layout.bodyBg }}
    >
      <Card
        style={{ width: 400, boxShadow: "0 8px 30px rgba(16, 42, 67, 0.06)" }}
        styles={{ body: { padding: 32 } }}
      >
        <div className="adfly-logo" style={{ fontSize: 24, marginBottom: 4 }}>
          ADFLY
        </div>
        <Typography.Text type="secondary" style={{ display: "block", marginBottom: 24 }}>
          管理后台 · Admin Console
        </Typography.Text>

        <Form<LoginForm>
          layout="vertical"
          initialValues={{ username: "", password: "" }}
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: "请输入用户名" }]}
          >
            <Input size="large" prefix={<UserOutlined />} placeholder="admin" autoComplete="username" />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              placeholder="••••••"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={signingIn}
              style={{ background: theme.brand.colorPrimary }}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
