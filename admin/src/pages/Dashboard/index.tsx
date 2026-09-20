import {
  FileTextOutlined,
  FolderOpenOutlined,
  GlobalOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Alert, Card, Col, List, Row, Space, Statistic, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { fetchDashboardStats, type DashboardStats } from "@/services/dashboard";
import { useAuthStore } from "@/store/auth";
import { useThemeStore } from "@/store/theme";

const STAT_META = [
  { key: "cases", title: "客户案例", suffix: "个" },
  { key: "cities", title: "招聘城市", suffix: "个" },
  { key: "positions", title: "在招职位", suffix: "个" },
  { key: "hot", title: "热招职位", suffix: "个" },
] as const;

const ENTRIES = [
  { title: "站点与导航", desc: "品牌信息 / 联系方式 / SEO / 导航", path: "/content/site", icon: <GlobalOutlined /> },
  { title: "首页内容", desc: "首页 6 大板块文案与素材", path: "/content/home", icon: <FileTextOutlined /> },
  { title: "客户案例", desc: "案例列表与详情 CRUD", path: "/cases", icon: <FolderOpenOutlined /> },
  { title: "招聘管理", desc: "招聘城市与岗位管理", path: "/careers", icon: <TeamOutlined /> },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const theme = useThemeStore((state) => state.theme);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setStatsLoading(true);
    void fetchDashboardStats()
      .then((nextStats) => {
        if (!active) return;
        setStats(nextStats);
        setStatsError(null);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setStatsError(error instanceof Error ? error.message : "统计数据加载失败，请稍后重试");
      })
      .finally(() => {
        if (active) setStatsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <Space direction="vertical" size={20} style={{ width: "100%" }}>
      <Card>
        <Typography.Title level={4} style={{ marginBottom: 4 }}>
          你好，{user?.username ?? "admin"} 👋
        </Typography.Title>
        <Typography.Text type="secondary">
          ADFLY 管理后台。左侧菜单可进入各内容模块，所有修改即时生效于前台。
        </Typography.Text>
        <div style={{ marginTop: 12 }}>
          <Tag color={theme.brand.colorPrimary}>当前主题色 {theme.brand.colorPrimary}</Tag>
          <Tag>数据统计来自实时接口</Tag>
        </div>
      </Card>

      {statsError ? (
        <Alert type="error" showIcon message="统计数据加载失败" description={statsError} />
      ) : null}

      <Row gutter={16}>
        {STAT_META.map((item) => (
          <Col xs={24} sm={12} lg={6} key={item.key}>
            <Card loading={statsLoading && !stats} data-testid={`dashboard-stat-${item.key}`}>
              <Statistic
                title={item.title}
                value={stats ? stats[item.key] : "—"}
                suffix={item.suffix}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="快捷入口">
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, lg: 4 }}
          dataSource={ENTRIES}
          renderItem={(item) => (
            <List.Item>
              <Card hoverable onClick={() => navigate(item.path)}>
                <Space direction="vertical" size={4}>
                  <Space>
                    <span style={{ color: theme.brand.colorPrimary, fontSize: 18 }}>{item.icon}</span>
                    <Typography.Text strong>{item.title}</Typography.Text>
                  </Space>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {item.desc}
                  </Typography.Text>
                </Space>
              </Card>
            </List.Item>
          )}
        />
      </Card>
    </Space>
  );
}
