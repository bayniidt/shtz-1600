import { PlusOutlined } from "@ant-design/icons";
import type { ActionType, ProColumns } from "@ant-design/pro-components";
import { ProTable } from "@ant-design/pro-components";
import { Alert, App, Button, Card, Col, Empty, Popconfirm, Row, Space, Tag, Typography } from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import PageContainer from "@/components/PageContainer";
import {
  deleteCareerCity,
  deleteCareerPosition,
  fetchCareerCities,
  fetchCareerPositions,
} from "@/services/careers";
import { flagValue, type CareerCity, type CareerPosition } from "@/types/careers";

interface PositionQueryParams {
  current?: number;
  pageSize?: number;
  cityId?: string;
  hot?: string;
  urgent?: string;
  keyword?: string;
}

/** 招聘管理总览：城市卡片、职位列表及城市删除回退提示。 */
export default function CareersOverviewPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const actionRef = useRef<ActionType>(null);
  const [cities, setCities] = useState<CareerCity[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [citiesError, setCitiesError] = useState<string | null>(null);

  const loadCities = useCallback(async () => {
    setCitiesLoading(true);
    try {
      const result = await fetchCareerCities({ page: 1, pageSize: 100 });
      setCities(result.items);
      setCitiesError(null);
    } catch (error) {
      setCitiesError(error instanceof Error ? error.message : "城市加载失败，请稍后重试");
    } finally {
      setCitiesLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCities();
  }, [loadCities]);

  const cityNames = useMemo(() => new Map(cities.map((city) => [city.id, city.name])), [cities]);

  const positionRequest = useCallback(async (params: PositionQueryParams) => {
    const result = await fetchCareerPositions({
      page: params.current ?? 1,
      pageSize: params.pageSize ?? 10,
      cityId: params.cityId || undefined,
      hot: params.hot || undefined,
      urgent: params.urgent || undefined,
      keyword: params.keyword || undefined,
    });
    return { data: result.items, success: true, total: result.total };
  }, []);

  const handleDeleteCity = useCallback(
    async (city: CareerCity) => {
      const fallback = cities.find((item) => item.id !== city.id);
      try {
        await deleteCareerCity(city.id, fallback?.id);
        message.success("城市已删除，关联职位已回退");
        await loadCities();
        actionRef.current?.reload();
      } catch (error) {
        message.error(error instanceof Error ? error.message : "删除失败，请稍后重试");
      }
    },
    [cities, loadCities, message],
  );

  const handleDeletePosition = useCallback(
    async (position: CareerPosition) => {
      try {
        await deleteCareerPosition(position.id);
        message.success("职位已删除");
        actionRef.current?.reload();
        void loadCities();
      } catch (error) {
        message.error(error instanceof Error ? error.message : "删除失败，请稍后重试");
      }
    },
    [loadCities, message],
  );

  const columns: ProColumns<CareerPosition>[] = [
    {
      title: "职位名称",
      dataIndex: "title",
      ellipsis: true,
      hideInSearch: true,
      render: (_, record) => <Link to={`/careers/positions/${record.id}/edit`}>{record.title}</Link>,
    },
    {
      title: "城市",
      dataIndex: "cityId",
      valueType: "select",
      valueEnum: Object.fromEntries(cities.map((city) => [city.id, { text: city.name }])),
      render: (_, record) => (
        <Space size={4} wrap>
          <Tag color="blue">{cityNames.get(record.cityId) ?? record.cityId}</Tag>
          {record.extraCities
            .split(/[\/,\n]+/)
            .filter((id) => id && id !== record.cityId)
            .map((id) => <Tag key={id}>{cityNames.get(id) ?? id}</Tag>)}
        </Space>
      ),
    },
    { title: "类型", dataIndex: "type", width: 90, hideInSearch: true },
    { title: "部门", dataIndex: "department", width: 130, ellipsis: true, hideInSearch: true },
    { title: "标签", dataIndex: "tags", width: 160, ellipsis: true, hideInSearch: true },
    {
      title: "热招",
      dataIndex: "hot",
      width: 80,
      valueEnum: { all: { text: "全部" }, true: { text: "热招" }, false: { text: "普通" } },
      render: (_, record) => (flagValue(record.hot) ? <Tag color="red">热招</Tag> : <Tag>普通</Tag>),
    },
    {
      title: "急招",
      dataIndex: "urgent",
      width: 80,
      valueEnum: { all: { text: "全部" }, true: { text: "急招" }, false: { text: "普通" } },
      render: (_, record) => (flagValue(record.urgent) ? <Tag color="orange">急招</Tag> : <Tag>普通</Tag>),
    },
    { title: "发布日期", dataIndex: "publishedAt", width: 120, hideInSearch: true },
    {
      title: "关键词",
      dataIndex: "keyword",
      hideInTable: true,
      fieldProps: { placeholder: "搜索职位 / 部门 / 简介" },
    },
    {
      title: "操作",
      valueType: "option",
      width: 150,
      render: (_, record) => (
        <Space size={4}>
          <Link to={`/careers/positions/${record.id}/edit`}>
            <Button size="small" type="link" aria-label="编辑职位">编辑</Button>
          </Link>
          <Popconfirm
            title="确认删除该职位？"
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
            onConfirm={() => void handleDeletePosition(record)}
          >
            <Button size="small" type="link" danger aria-label="删除职位">删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div data-testid="careers-overview">
      <PageContainer
        title="招聘管理"
        subTitle="城市归属、职位维护与职位数量聚合"
        extra={
          <Space>
            <Button onClick={() => navigate("/careers/cities/new")} data-testid="city-create">新建城市</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/careers/positions/new")} data-testid="position-create">
              新建职位
            </Button>
          </Space>
        }
      >
        <Card title="招聘城市" loading={citiesLoading} style={{ marginBottom: 16 }}>
          {citiesError ? <Alert type="error" message="城市加载失败" description={citiesError} showIcon /> : null}
          {!citiesLoading && !cities.length && !citiesError ? <Empty description="暂无招聘城市" /> : null}
          <Row gutter={[12, 12]}>
            {cities.map((city) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={city.id}>
                <Card
                  size="small"
                  data-testid={`city-card-${city.id}`}
                  title={<Link to={`/careers/cities/${city.id}/edit`}>{city.name || city.id}</Link>}
                  extra={flagValue(city.featured) ? <Tag color="gold">重点</Tag> : null}
                >
                  <Typography.Text type="secondary">{city.nameEn || city.id}</Typography.Text>
                  <Typography.Paragraph ellipsis={{ rows: 2 }} style={{ minHeight: 44, margin: "8px 0" }}>
                    {city.summary || "暂无城市简介"}
                  </Typography.Paragraph>
                  <Space>
                    <Tag color="blue">{city.positionsCount ?? 0} 个职位</Tag>
                    <Popconfirm
                      title="确认删除该城市？"
                      description={(city.positionsCount ?? 0) > 0 ? "关联职位将自动回退到其他城市。" : undefined}
                      okText="删除"
                      cancelText="取消"
                      okButtonProps={{ danger: true }}
                      onConfirm={() => void handleDeleteCity(city)}
                    >
                      <Button size="small" type="link" danger aria-label={`删除城市 ${city.name}`}>删除</Button>
                    </Popconfirm>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        <Card title="职位列表" data-testid="position-list">
          <ProTable<CareerPosition>
            rowKey="id"
            actionRef={actionRef}
            columns={columns}
            request={positionRequest}
            search={{ labelWidth: "auto", defaultCollapsed: false }}
            pagination={{ defaultPageSize: 10, showSizeChanger: true }}
            options={false}
            scroll={{ x: 1200 }}
          />
        </Card>
      </PageContainer>
    </div>
  );
}
