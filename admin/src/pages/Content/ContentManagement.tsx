import {
  CheckOutlined,
  ClockCircleOutlined,
  EditOutlined,
  FileTextOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Flex,
  Input,
  Modal,
  Progress,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";

import PageContainer from "@/components/PageContainer";
import {
  ABOUT_FIELDS,
  CAREERS_CONTENT_FIELDS,
  HOME_SECTION_FIELDS,
  SITE_FIELDS,
} from "@/config/content-fields";
import AboutContentPage from "@/pages/Content/About";
import CareersContentPage from "@/pages/Content/CareersContent";
import HomeContentPage from "@/pages/Content/Home";
import SiteContentPage from "@/pages/Content/Site";
import { fetchAbout, fetchCareersContent, fetchHome, fetchSite } from "@/services/content";
import { HOME_SECTIONS } from "@/types/content";
import { getTranslationProgress } from "@/types/i18n";

type ContentKey = "site" | "home" | "about" | "careers";

interface ContentModule {
  key: ContentKey;
  title: string;
  description: string;
  endpoint: string;
  scope: string;
}

interface ContentFilters {
  scope?: string;
  status?: "not-started" | "partial" | "complete";
  keyword?: string;
}

interface TranslationProgress {
  done: number;
  total: number;
  percent: number;
}

type ProgressMap = Partial<Record<ContentKey, TranslationProgress>>;

const CONTENT_MODULES: ContentModule[] = [
  {
    key: "site",
    title: "站点与导航",
    description: "公司信息、导航、页脚链接与 SEO",
    endpoint: "GET /site · PUT /site",
    scope: "站点配置",
  },
  {
    key: "home",
    title: "首页内容",
    description: "首屏、媒体资源、Flow AI、客户、实力与荣誉",
    endpoint: "GET /home · PUT /home/:section",
    scope: "6 个内容板块",
  },
  {
    key: "about",
    title: "关于我们",
    description: "公司简介、发展历程、团队与办公地点",
    endpoint: "GET /about · PUT /about",
    scope: "公司资料",
  },
  {
    key: "careers",
    title: "招聘内容",
    description: "招聘页文案、企业文化与福利说明",
    endpoint: "GET /careers/content · PUT /careers/content",
    scope: "页面文案",
  },
];

function renderEditor(
  key: ContentKey,
  onCancel: () => void,
  onDirtyChange: (dirty: boolean) => void,
) {
  switch (key) {
    case "site":
      return <SiteContentPage compact onCancel={onCancel} onDirtyChange={onDirtyChange} />;
    case "home":
      return <HomeContentPage compact onCancel={onCancel} onDirtyChange={onDirtyChange} />;
    case "about":
      return <AboutContentPage compact onCancel={onCancel} onDirtyChange={onDirtyChange} />;
    case "careers":
      return <CareersContentPage compact onCancel={onCancel} onDirtyChange={onDirtyChange} />;
  }
}

/** 内容总览：所有单例页面内容在同一张表里管理，编辑统一使用对话框。 */
export default function ContentManagementPage() {
  const [editingKey, setEditingKey] = useState<ContentKey | null>(null);
  const [editorDirty, setEditorDirty] = useState(false);
  const [progressMap, setProgressMap] = useState<ProgressMap>({});
  const [draftFilters, setDraftFilters] = useState<ContentFilters>({});
  const [filters, setFilters] = useState<ContentFilters>({});
  const editingModule = useMemo(
    () => CONTENT_MODULES.find((item) => item.key === editingKey) ?? null,
    [editingKey],
  );
  const filteredModules = useMemo(() => {
    const keyword = filters.keyword?.trim().toLowerCase();
    return CONTENT_MODULES.filter((item) => {
      if (filters.scope && item.scope !== filters.scope) return false;
      const progress = progressMap[item.key];
      const status = progress && progress.total > 0
        ? progress.done === progress.total ? "complete" : progress.done === 0 ? "not-started" : "partial"
        : "complete";
      if (filters.status && filters.status !== status) return false;
      if (
        keyword &&
        ![item.key, item.title, item.scope, item.description, item.endpoint]
          .join(" ")
          .toLowerCase()
          .includes(keyword)
      ) {
        return false;
      }
      return true;
    });
  }, [filters, progressMap]);

  useEffect(() => {
    let active = true;
    const loadProgress = async () => {
      const [site, home, about, careers] = await Promise.allSettled([
        fetchSite(),
        fetchHome(),
        fetchAbout(),
        fetchCareersContent(),
      ]);
      if (!active) return;

      const next: ProgressMap = {};
      if (site.status === "fulfilled") {
        next.site = getTranslationProgress(site.value, SITE_FIELDS);
      }
      if (home.status === "fulfilled") {
        const summary = HOME_SECTIONS.reduce(
          (current, section) => {
            const item = getTranslationProgress(home.value[section.key], HOME_SECTION_FIELDS[section.key]);
            return { done: current.done + item.done, total: current.total + item.total };
          },
          { done: 0, total: 0 },
        );
        next.home = {
          ...summary,
          percent: summary.total === 0 ? 100 : Math.round((summary.done / summary.total) * 100),
        };
      }
      if (about.status === "fulfilled") {
        next.about = getTranslationProgress(about.value, ABOUT_FIELDS);
      }
      if (careers.status === "fulfilled") {
        next.careers = getTranslationProgress(careers.value, CAREERS_CONTENT_FIELDS);
      }
      setProgressMap(next);
    };
    void loadProgress();
    return () => {
      active = false;
    };
  }, []);

  const closeEditor = useCallback(() => {
    setEditingKey(null);
    setEditorDirty(false);
  }, []);

  const handleEditorDirtyChange = useCallback((dirty: boolean) => {
    setEditorDirty(dirty);
  }, []);

  const handleModalCancel = () => {
    if (!editorDirty) {
      closeEditor();
      return;
    }
    Modal.confirm({
      title: "仍有未保存的修改",
      content: "关闭内容编辑框前，是否放弃当前中英文修改？",
      okText: "放弃并关闭",
      cancelText: "继续编辑",
      okButtonProps: { danger: true },
      onOk: closeEditor,
    });
  };

  const resetFilters = () => {
    setDraftFilters({});
    setFilters({});
  };

  return (
    <div data-testid="content-management">
      <PageContainer
        title="内容管理"
        subTitle="统一维护前台页面文案与站点配置，新增或编辑均在对话框中完成"
      >
        <Card
          className="adfly-strip"
          style={{ marginBottom: 16 }}
          styles={{ body: { padding: 0 } }}
        >
          <Row>
            {[
              {
                key: "total",
                title: "内容模块",
                value: CONTENT_MODULES.length,
                icon: <FileTextOutlined />,
              },
              {
                key: "done",
                title: "已完成",
                icon: <CheckOutlined />,
                value: CONTENT_MODULES.filter((item) => {
                  const progress = progressMap[item.key];
                  return !progress || progress.total === 0 || progress.done === progress.total;
                }).length,
              },
              {
                key: "partial",
                title: "进行中",
                icon: <SyncOutlined />,
                value: CONTENT_MODULES.filter((item) => {
                  const progress = progressMap[item.key];
                  return Boolean(
                    progress && progress.total > 0 && progress.done > 0 && progress.done < progress.total,
                  );
                }).length,
              },
              {
                key: "idle",
                title: "未开始",
                icon: <ClockCircleOutlined />,
                value: CONTENT_MODULES.filter((item) => {
                  const progress = progressMap[item.key];
                  return Boolean(progress && progress.total > 0 && progress.done === 0);
                }).length,
              },
            ].map((item) => (
              <Col xs={12} lg={6} key={item.key}>
                <div className="adfly-strip-cell">
                  <div className="adfly-strip-label">
                    {item.title}
                    <span className="adfly-strip-icon">{item.icon}</span>
                  </div>
                  <div className="adfly-strip-value">{item.value}</div>
                </div>
              </Col>
            ))}
          </Row>
        </Card>

        <Card className="adfly-panel" style={{ marginBottom: 16 }}>
          <Space
            wrap
            size={[16, 12]}
            style={{ width: "100%", justifyContent: "space-between" }}
          >
            <Space wrap size={[16, 12]}>
              <Space>
                <Typography.Text>模块类型：</Typography.Text>
                <Select
                  allowClear
                  placeholder="请选择"
                  style={{ width: 180 }}
                  value={draftFilters.scope}
                  options={Array.from(new Set(CONTENT_MODULES.map((item) => item.scope))).map(
                    (scope) => ({ label: scope, value: scope }),
                  )}
                  onChange={(scope) => setDraftFilters((current) => ({ ...current, scope }))}
                />
              </Space>
              <Space>
                <Typography.Text>状态：</Typography.Text>
                <Select
                  allowClear
                  placeholder="请选择"
                  style={{ width: 150 }}
                  value={draftFilters.status}
                  options={[
                    { label: "未开始", value: "not-started" },
                    { label: "部分完成", value: "partial" },
                    { label: "已完成", value: "complete" },
                  ]}
                  onChange={(status) => setDraftFilters((current) => ({ ...current, status }))}
                />
              </Space>
              <Space>
                <Typography.Text>关键词：</Typography.Text>
                <Input
                  allowClear
                  placeholder="搜索模块 / 说明"
                  style={{ width: 260 }}
                  value={draftFilters.keyword}
                  onChange={(event) =>
                    setDraftFilters((current) => ({ ...current, keyword: event.target.value }))
                  }
                  onPressEnter={() => setFilters(draftFilters)}
                />
              </Space>
            </Space>
            <Space>
              <Button onClick={resetFilters}>重置</Button>
              <Button type="primary" onClick={() => setFilters(draftFilters)}>
                查询
              </Button>
            </Space>
          </Space>
        </Card>

        <Card className="adfly-panel">
          <Table<ContentModule>
            rowKey="key"
            dataSource={filteredModules}
            pagination={{
              showSizeChanger: true,
              showTotal: (total, range) => `第 ${range[0]}–${range[1]} 条/共 ${total} 条`,
            }}
            columns={[
              {
                title: "模块 ID",
                dataIndex: "key",
                width: 140,
                render: (key: ContentKey) => <Typography.Text code>{key}</Typography.Text>,
              },
              {
                title: "内容模块",
                dataIndex: "title",
                width: 190,
                render: (title: string) => (
                  <Space>
                    <FileTextOutlined style={{ color: "var(--adfly-brand)" }} />
                    <Typography.Text strong>{title}</Typography.Text>
                  </Space>
                ),
              },
              { title: "内容范围", dataIndex: "scope", width: 150 },
              { title: "说明", dataIndex: "description" },
              {
                title: "English 翻译",
                width: 200,
                render: (_: unknown, record: ContentModule) => {
                  const progress = progressMap[record.key];
                  if (!progress) return <Tag>读取中</Tag>;
                  if (progress.total === 0) return <Tag>无需翻译</Tag>;
                  const complete = progress.done === progress.total;
                  const idle = progress.done === 0;
                  return (
                    <Flex align="center" gap={8}>
                      <Progress
                        percent={progress.percent}
                        size="small"
                        showInfo={false}
                        strokeColor={complete ? "#10b981" : idle ? "#d9d9d9" : "#f59e0b"}
                        style={{ width: 76, marginBottom: 0 }}
                      />
                      <Tag color={complete ? "success" : idle ? "default" : "warning"}>
                        {progress.done}/{progress.total}
                      </Tag>
                    </Flex>
                  );
                },
              },
              {
                title: "操作",
                key: "action",
                width: 110,
                render: (_: unknown, record: ContentModule) => (
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => setEditingKey(record.key)}
                    data-testid={`content-edit-${record.key}`}
                  >
                    编辑
                  </Button>
                ),
              },
            ]}
          />
        </Card>
      </PageContainer>

      <Modal
        open={Boolean(editingModule)}
        title={editingModule ? `编辑${editingModule.title}` : undefined}
        width={1120}
        footer={null}
        destroyOnHidden
        centered
        styles={{
          body: {
            maxHeight: "calc(100vh - 220px)",
            overflowY: "auto",
            paddingRight: 4,
          },
        }}
        maskClosable={false}
        keyboard={false}
        onCancel={handleModalCancel}
        data-testid="content-edit-dialog"
      >
        {editingKey ? renderEditor(editingKey, closeEditor, handleEditorDirtyChange) : null}
      </Modal>
    </div>
  );
}
