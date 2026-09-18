import { Alert, Card, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";

import PageContainer from "@/components/PageContainer";
import { METHOD_COLORS, MODULE_BLUEPRINTS, type EndpointDoc, type ModuleKey } from "@/config/endpoints";

export interface ModuleScaffoldProps {
  /** 该路由包含的模块（例如招聘管理 = 城市 + 职位） */
  moduleKeys: ModuleKey[];
  /** 覆盖页面标题（默认取模块标题） */
  title?: string;
}

const columns: ColumnsType<EndpointDoc> = [
  {
    title: "方法",
    dataIndex: "method",
    width: 96,
    render: (method: EndpointDoc["method"]) => <Tag color={METHOD_COLORS[method]}>{method}</Tag>,
  },
  {
    title: "接口路径",
    dataIndex: "path",
    width: 260,
    render: (path: string) => <Typography.Text code>{`/api/v1${path}`}</Typography.Text>,
  },
  { title: "说明", dataIndex: "label" },
  {
    title: "鉴权",
    dataIndex: "auth",
    width: 110,
    render: (auth: boolean) =>
      auth ? <Tag color="gold">需登录</Tag> : <Tag color="default">公开</Tag>,
  },
];

/**
 * 模块骨架页：展示尚未接入可视化页面的接口清单与实现计划。
 * 已实现模块仍可用于查看接口蓝图，但真实业务路由应优先使用对应页面。
 */
export default function ModuleScaffold({ moduleKeys, title }: ModuleScaffoldProps) {
  const blueprints = moduleKeys.map((key) => MODULE_BLUEPRINTS[key]);
  const pageTitle = title ?? blueprints.map((item) => item.title).join(" · ");
  const stages = [...new Set(blueprints.map((item) => item.stage))].join(" / ");
  const total = blueprints.reduce((sum, item) => sum + item.endpoints.length, 0);
  const allImplemented = blueprints.every((item) => item.implemented);

  return (
    <PageContainer title={pageTitle} subTitle={blueprints.map((item) => item.description).join(" ")}>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Alert
          type={allImplemented ? "success" : "info"}
          showIcon
          message={allImplemented ? "接口已实现，当前页面仅展示接口蓝图" : `接口骨架已就绪，业务实现计划：${stages}`}
          description={
            allImplemented
              ? "写操作接口已受 JWT 保护；请从真实业务路由进入编辑页面。"
              : "写操作接口已受 JWT 保护。未实现接口统一返回 501 / code=5001。"
          }
        />
        {blueprints.map((blueprint) => (
          <Card
            key={blueprint.key}
            size="small"
            title={`${blueprint.title} · 接口清单（${blueprint.endpoints.length}）`}
            data-testid={`module-card-${blueprint.key}`}
          >
            <Table<EndpointDoc>
              rowKey={(record) => `${record.method} ${record.path}`}
              size="small"
              columns={columns}
              dataSource={blueprint.endpoints}
              pagination={false}
            />
          </Card>
        ))}
        <Typography.Text type="secondary" data-testid="module-endpoint-total">
          当前路由共 {total} 个接口
        </Typography.Text>
      </Space>
    </PageContainer>
  );
}
