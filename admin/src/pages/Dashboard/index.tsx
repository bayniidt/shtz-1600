import {
  ArrowRightOutlined,
  FileTextOutlined,
  FireOutlined,
  FolderOpenOutlined,
  GlobalOutlined,
  PlusOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Alert, Button, Card, Col, Flex, List, Row, Space, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { fetchDashboardStats, type DashboardStats } from "@/services/dashboard";
import { useAuthStore } from "@/store/auth";
import { useThemeStore } from "@/store/theme";

const STAT_META = [
  { key: "cases", title: "客户案例", icon: <FolderOpenOutlined /> },
  { key: "cities", title: "招聘城市", icon: <GlobalOutlined /> },
  { key: "positions", title: "在招职位", icon: <TeamOutlined /> },
  { key: "hot", title: "热招职位", icon: <FireOutlined /> },
] as const;

const ENTRIES = [
  {
    title: "内容管理",
    desc: "站点、首页、关于我们与招聘内容",
    path: "/content",
    icon: <FileTextOutlined />,
  },
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

  const specs = [
    { label: "Theme", value: theme.brand.colorPrimary },
    { label: "Sider", value: `${theme.layout.siderWidth}px` },
    { label: "Header", value: `${theme.layout.headerHeight}px` },
    { label: "Radius", value: `${theme.typography.borderRadius}px` },
    { label: "Runtime", value: import.meta.env.DEV ? "development" : "production" },
  ];

  return (
    <Flex vertical gap={16} className="adfly-dashboard">
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={16}>
          <Card className="adfly-hero" styles={{ body: { padding: 28 } }}>
            <Space direction="vertical" size={10}>
              <span className="adfly-hero-eyebrow">ADFLY ADMIN · OVERVIEW</span>
              <Typography.Title level={3} style={{ margin: 0 }}>
                你好，{user?.username ?? "admin"} 👋
              </Typography.Title>
              <Typography.Text className="adfly-hero-sub">
                ADFLY 管理后台。左侧菜单可进入各内容模块，所有修改即时生效于前台。
              </Typography.Text>
            </Space>

            <Flex align="center" justify="space-between" gap={16} wrap>
              <Space size={8} wrap>
                <Tag color={theme.brand.colorPrimary}>当前主题色 {theme.brand.colorPrimary}</Tag>
                <Tag>数据统计来自实时接口</Tag>
              </Space>

              <Space wrap>
                <Button
                  className="adfly-hero-ghost"
                  icon={<FileTextOutlined />}
                  onClick={() => navigate("/content")}
                >
                  编辑内容
                </Button>
                <Button
                  className="adfly-hero-primary"
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate("/cases/new")}
                >
                  新建案例
                </Button>
              </Space>
            </Flex>
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <Card
            className="adfly-panel"
            title="系统信息"
            extra={import.meta.env.DEV ? "DEV" : "PROD"}
            style={{ height: "100%" }}
          >
            <div className="adfly-spec">
              {specs.map((item) => (
                <div className="adfly-spec-row" key={item.label}>
                  <span className="adfly-spec-label">{item.label}</span>
                  <span className="adfly-spec-value">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {statsError ? (
        <Alert type="error" showIcon message="统计数据加载失败" description={statsError} />
      ) : null}

      <Card className="adfly-strip" styles={{ body: { padding: 0 } }}>
        <Row>
          {STAT_META.map((item) => (
            <Col xs={12} lg={6} key={item.key}>
              <div className="adfly-strip-cell" data-testid={`dashboard-stat-${item.key}`}>
                <div className="adfly-strip-label">
                  {item.title}
                  <span className="adfly-strip-icon">{item.icon}</span>
                </div>
                <div
                  className={
                    statsLoading && !stats ? "adfly-strip-value is-loading" : "adfly-strip-value"
                  }
                >
                  {stats ? stats[item.key] : "—"}
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      <Card title="快捷入口" className="adfly-panel" styles={{ body: { padding: 16 } }}>
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, xl: 3 }}
          dataSource={ENTRIES}
          renderItem={(item) => (
            <List.Item>
              <Card hoverable className="adfly-entry-card" onClick={() => navigate(item.path)}>
                <Flex align="center" justify="space-between" gap={12}>
                  <Space size={12} align="center">
                    <span className="adfly-entry-icon">{item.icon}</span>
                    <Space direction="vertical" size={2}>
                      <Typography.Text strong>{item.title}</Typography.Text>
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {item.desc}
                      </Typography.Text>
                    </Space>
                  </Space>
                  <ArrowRightOutlined className="adfly-entry-arrow" />
                </Flex>
              </Card>
            </List.Item>
          )}
        />
      </Card>
    </Flex>
  );
}
