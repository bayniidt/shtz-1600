import { PlusOutlined } from "@ant-design/icons";
import type { ActionType, ProColumns } from "@ant-design/pro-components";
import { ProTable } from "@ant-design/pro-components";
import { App, Button, Popconfirm, Space, Tag } from "antd";
import { useCallback, useRef, useState } from "react";

import PageContainer from "@/components/PageContainer";
import { toFrontendUrl } from "@/config/frontend";
import CaseEditorPage from "@/pages/cases/CaseEditor";
import { deleteCase, fetchCases, toggleCaseFeatured } from "@/services/cases";
import { INDUSTRY_LABELS, type CaseItem } from "@/types/cases";

interface CaseQueryParams {
  current?: number;
  pageSize?: number;
  industry?: string;
  featured?: string;
  keyword?: string;
}

/** 客户案例列表：ProTable + 筛选 + 分页 + 置顶切换 + 删除确认。 */
export default function CaseListPage() {
  const { message } = App.useApp();
  const actionRef = useRef<ActionType>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorId, setEditorId] = useState<string | undefined>();

  const openEditor = useCallback((id?: string) => {
    setEditorId(id);
    setEditorOpen(true);
  }, []);

  const closeEditor = useCallback(() => {
    setEditorOpen(false);
  }, []);

  const request = useCallback(
    async (params: CaseQueryParams) => {
      const result = await fetchCases({
        page: params.current ?? 1,
        pageSize: params.pageSize ?? 10,
        keyword: params.keyword || undefined,
        industry: params.industry || undefined,
        featured: params.featured || undefined,
      });
      return { data: result.items, success: true, total: result.total };
    },
    [],
  );

  const handleToggleFeatured = useCallback(
    async (record: CaseItem) => {
      try {
        await toggleCaseFeatured(record.id, !record.featured);
        message.success(record.featured ? "已取消置顶" : "已置顶");
        actionRef.current?.reload();
      } catch (error) {
        message.error(error instanceof Error ? error.message : "操作失败，请稍后重试");
      }
    },
    [message],
  );

  const handleDelete = useCallback(
    async (record: CaseItem) => {
      try {
        await deleteCase(record.id);
        message.success("案例已删除");
        actionRef.current?.reload();
      } catch (error) {
        message.error(error instanceof Error ? error.message : "删除失败，请稍后重试");
      }
    },
    [message],
  );

  const columns: ProColumns<CaseItem>[] = [
    {
      title: "ID",
      dataIndex: "id",
      width: 130,
      ellipsis: true,
      copyable: true,
      hideInSearch: true,
    },
    {
      title: "标题",
      dataIndex: "title",
      ellipsis: true,
      hideInSearch: true,
      render: (_, record) => (
        <Button type="link" onClick={() => openEditor(record.id)} style={{ paddingInline: 0 }}>
          {record.title}
        </Button>
      ),
    },
    { title: "客户", dataIndex: "client", width: 140, ellipsis: true, hideInSearch: true },
    {
      title: "行业",
      dataIndex: "industry",
      width: 90,
      valueEnum: {
        all: { text: "全部" },
        ecommerce: { text: INDUSTRY_LABELS.ecommerce },
        game: { text: INDUSTRY_LABELS.game },
        app: { text: INDUSTRY_LABELS.app },
        brand: { text: INDUSTRY_LABELS.brand },
      },
      render: (_, record) => <Tag color="blue">{INDUSTRY_LABELS[record.industry]}</Tag>,
    },
    { title: "区域", dataIndex: "region", width: 100, ellipsis: true, hideInSearch: true },
    { title: "年份", dataIndex: "year", width: 70, hideInSearch: true },
    {
      title: "标签",
      dataIndex: "tags",
      hideInSearch: true,
      render: (_, record) => (
        <Space size={4} wrap>
          {record.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: "置顶",
      dataIndex: "featured",
      width: 90,
      valueEnum: {
        all: { text: "全部" },
        true: { text: "已置顶" },
        false: { text: "未置顶" },
      },
      render: (_, record) => (record.featured ? <Tag color="gold">已置顶</Tag> : <Tag>未置顶</Tag>),
    },
    {
      title: "关键词",
      dataIndex: "keyword",
      hideInTable: true,
      fieldProps: { placeholder: "搜索标题 / 客户 / 简介" },
    },
    {
      title: "操作",
      valueType: "option",
      key: "option",
      width: 240,
      render: (_, record) => (
        <Space size={4}>
          <Button
            size="small"
            type={record.featured ? "primary" : "default"}
            aria-label={record.featured ? "取消置顶" : "置顶"}
            onClick={() => void handleToggleFeatured(record)}
          >
            {record.featured ? "取消置顶" : "置顶"}
          </Button>
          <Button size="small" type="link" aria-label="编辑" onClick={() => openEditor(record.id)}>
            编辑
          </Button>
          <Button
            size="small"
            type="link"
            aria-label="预览"
            href={toFrontendUrl(`/cases/${record.id}`)}
            target="_blank"
            rel="noopener noreferrer"
          >
            预览
          </Button>
          <Popconfirm
            title="确认删除该案例？"
            description="删除后前台将不再展示，且无法恢复。"
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
            onConfirm={() => void handleDelete(record)}
          >
            <Button size="small" type="link" danger aria-label="删除">
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div data-testid="case-list">
      <PageContainer
        title="客户案例"
        subTitle="案例增删改查、行业筛选与首页置顶"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            data-testid="case-create"
            onClick={() => openEditor()}
          >
            新建案例
          </Button>
        }
      >
        <ProTable<CaseItem>
          rowKey="id"
          actionRef={actionRef}
          columns={columns}
          request={request}
          search={{ labelWidth: "auto", defaultCollapsed: false }}
          pagination={{ defaultPageSize: 10, showSizeChanger: true }}
          options={false}
          scroll={{ x: 1100 }}
        />
      </PageContainer>
      {editorOpen ? (
        <CaseEditorPage
          dialog
          caseId={editorId}
          onClose={closeEditor}
          onSaved={() => actionRef.current?.reload()}
        />
      ) : null}
    </div>
  );
}
