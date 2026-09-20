import { PlusOutlined } from "@ant-design/icons";
import type { ActionType, ProColumns } from "@ant-design/pro-components";
import { ProTable } from "@ant-design/pro-components";
import { Alert, App, Button, Card, Popconfirm, Space, Table, Tag } from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import PageContainer from "@/components/PageContainer";
import CityEditorPage from "@/pages/careers/CityEditor";
import PositionEditorPage from "@/pages/careers/PositionEditor";
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

/** 招聘管理总览：城市表格、职位列表及城市删除回退提示。 */
export default function CareersOverviewPage() {
  const { message } = App.useApp();
  const actionRef = useRef<ActionType>(null);
  const [cities, setCities] = useState<CareerCity[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [citiesError, setCitiesError] = useState<string | null>(null);
  const [cityEditorOpen, setCityEditorOpen] = useState(false);
  const [cityEditorId, setCityEditorId] = useState<string | undefined>();
  const [positionEditorOpen, setPositionEditorOpen] = useState(false);
  const [positionEditorId, setPositionEditorId] = useState<string | undefined>();

  const openCityEditor = useCallback((id?: string) => {
    setCityEditorId(id);
    setCityEditorOpen(true);
  }, []);

  const openPositionEditor = useCallback((id?: string) => {
    setPositionEditorId(id);
    setPositionEditorOpen(true);
  }, []);

  const closeCityEditor = useCallback(() => setCityEditorOpen(false), []);
  const closePositionEditor = useCallback(() => setPositionEditorOpen(false), []);

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

  const cityColumns = [
    { title: "城市 ID", dataIndex: "id", width: 150, ellipsis: true },
    { title: "城市名称", dataIndex: "name", width: 140 },
    { title: "英文名称", dataIndex: "nameEn", width: 150, ellipsis: true },
    { title: "城市编码", dataIndex: "code", width: 130, ellipsis: true },
    { title: "简介", dataIndex: "summary", width: 220, ellipsis: true },
    { title: "职位数", dataIndex: "positionsCount", width: 90, render: (count: number) => `${count ?? 0} 个` },
    {
      title: "重点城市",
      dataIndex: "featured",
      width: 100,
      render: (_: unknown, record: CareerCity) => (flagValue(record.featured) ? <Tag color="gold">重点</Tag> : <Tag>普通</Tag>),
    },
    {
      title: "操作",
      key: "action",
      width: 180,
      render: (_: unknown, record: CareerCity) => (
        <Space size={4}>
          <Button size="small" type="link" onClick={() => openCityEditor(record.id)} aria-label={`编辑城市 ${record.name}`}>
            编辑
          </Button>
          <Popconfirm
            title="确认删除该城市？"
            description={(record.positionsCount ?? 0) > 0 ? "关联职位将自动回退到其他城市。" : undefined}
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
            onConfirm={() => void handleDeleteCity(record)}
          >
            <Button size="small" type="link" danger aria-label={`删除城市 ${record.name}`}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const columns: ProColumns<CareerPosition>[] = [
    {
      title: "职位名称",
      dataIndex: "title",
      ellipsis: true,
      hideInSearch: true,
      render: (_, record) => (
        <Button type="link" onClick={() => openPositionEditor(record.id)} style={{ paddingInline: 0 }}>
          {record.title}
        </Button>
      ),
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
          <Button size="small" type="link" aria-label="编辑职位" onClick={() => openPositionEditor(record.id)}>
            编辑
          </Button>
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
            <Button onClick={() => openCityEditor()} data-testid="city-create">新建城市</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openPositionEditor()} data-testid="position-create">
              新建职位
            </Button>
          </Space>
        }
      >
        <Card title="招聘城市" style={{ marginBottom: 16 }}>
          {citiesError ? <Alert type="error" message="城市加载失败" description={citiesError} showIcon /> : null}
          <Table<CareerCity>
            rowKey="id"
            loading={citiesLoading}
            dataSource={cities}
            columns={cityColumns}
            pagination={false}
            scroll={{ x: 900 }}
          />
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
      {cityEditorOpen ? (
        <CityEditorPage
          dialog
          cityId={cityEditorId}
          onClose={closeCityEditor}
          onSaved={() => void loadCities()}
        />
      ) : null}
      {positionEditorOpen ? (
        <PositionEditorPage
          dialog
          positionId={positionEditorId}
          onClose={closePositionEditor}
          onSaved={() => {
            actionRef.current?.reload();
            void loadCities();
          }}
        />
      ) : null}
    </div>
  );
}
