import { Button, Typography } from "antd";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="adfly-notfound">
      <span className="adfly-notfound-code">404</span>
      <Typography.Title level={4} style={{ margin: 0 }}>
        页面不存在
      </Typography.Title>
      <Typography.Text type="secondary">请检查访问地址，或返回概览继续操作。</Typography.Text>
      <Button type="primary" onClick={() => navigate("/dashboard")}>
        返回概览
      </Button>
    </div>
  );
}
