import {
  BgColorsOutlined,
  DownOutlined,
  ExportOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  App,
  AutoComplete,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Divider,
  Dropdown,
  Flex,
  FloatButton,
  Input,
  Layout,
  Menu,
  Space,
  Tag,
  Tooltip,
  Typography,
  type InputRef,
} from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { toFrontendUrl } from "@/config/frontend";
import {
  DEFAULT_OPEN_KEYS,
  MENU_GROUPS,
  MENU_ITEMS,
  MENU_SEARCH_ITEMS,
  ROUTE_PARENTS,
  ROUTE_TITLES,
  selectedMenuKey,
} from "@/config/menu";
import { UNSAVED_CONFIRM_CONTENT, UNSAVED_CONFIRM_TITLE } from "@/hooks/useUnsavedChanges";
import { useDirtyLabel, useIsDirty } from "@/store/dirty";
import { useThemeStore } from "@/store/theme";
import { useAuthStore } from "@/store/auth";

const { Header, Sider, Content } = Layout;

function parentTitle(pathname: string): string | undefined {
  return ROUTE_PARENTS.find(([prefix]) => pathname.startsWith(prefix))?.[1];
}

const ROLE_LABELS: Record<string, string> = { admin: "管理员", editor: "编辑" };

function roleLabel(role?: string): string {
  if (!role) return ROLE_LABELS.admin;
  return ROLE_LABELS[role] ?? role;
}

function pageTitle(pathname: string): string {
  return ROUTE_TITLES[pathname] ?? ROUTE_TITLES[selectedMenuKey(pathname)] ?? "管理后台";
}

export default function BasicLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<InputRef>(null);
  const { modal } = App.useApp();

  const theme = useThemeStore((state) => state.theme);
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const dirty = useIsDirty();
  const dirtyLabel = useDirtyLabel();

  const selectedKey = useMemo(() => selectedMenuKey(location.pathname), [location.pathname]);
  const current = pageTitle(location.pathname);
  const parent = parentTitle(location.pathname);

  const crumbs = useMemo(() => {
    const items = [{ title: "管理后台" }];
    const group = MENU_GROUPS[location.pathname];
    if (group) items.push({ title: group });
    if (parent && parent !== current) items.push({ title: parent });
    if (parent === current || !parent) items.push({ title: current });
    return items;
  }, [current, location.pathname, parent]);

  const searchOptions = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return MENU_SEARCH_ITEMS.filter(
      (item) => !keyword || `${item.label}${item.group}${item.key}`.toLowerCase().includes(keyword),
    ).map((item) => ({
      value: item.key,
      label: (
        <Flex align="center" justify="space-between" gap={12}>
          <Space size={8}>
            <span className="adfly-search-option-icon">{item.icon}</span>
            {item.label}
          </Space>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {item.group}
          </Typography.Text>
        </Flex>
      ),
    }));
  }, [query]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  /** 跳转前拦截未保存修改（菜单与搜索共用） */
  const goTo = useCallback(
    (key: string) => {
      if (!key || key === location.pathname) return;
      if (!dirty) {
        navigate(key);
        return;
      }
      modal.confirm({
        title: UNSAVED_CONFIRM_TITLE,
        content: `${dirtyLabel}${UNSAVED_CONFIRM_CONTENT}`,
        okText: "放弃修改并离开",
        cancelText: "留在本页",
        okButtonProps: { danger: true },
        onOk: () => navigate(key),
      });
    },
    [dirty, dirtyLabel, location.pathname, modal, navigate],
  );

  const handleMenuClick = useCallback(({ key }: { key: string }) => goTo(key), [goTo]);

  return (
    <Layout className="adfly-shell" style={{ minHeight: "100vh" }}>
      <Sider
        className="adfly-sider"
        theme="light"
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={theme.layout.siderWidth}
        style={{ background: theme.layout.siderBg }}
      >
        <Flex
          className={`adfly-brand${collapsed ? " is-collapsed" : ""}`}
          align="center"
          gap={10}
          style={{ height: theme.layout.headerHeight }}
        >
          <span className="adfly-brand-mark">A</span>
          {!collapsed && (
            <span className="adfly-brand-text">
              ADFLY
              <span className="adfly-brand-sub">Admin Console</span>
            </span>
          )}
        </Flex>

        <div className="adfly-sider-scroll">
          <Menu
            className="adfly-menu"
            mode="inline"
            items={MENU_ITEMS}
            selectedKeys={[selectedKey]}
            defaultOpenKeys={DEFAULT_OPEN_KEYS}
            onClick={handleMenuClick}
          />
        </div>

        <div className={`adfly-sider-foot${collapsed ? " is-collapsed" : ""}`}>
          {collapsed ? (
            <Tooltip title="v0.1.0" placement="right">
              <Badge status="success" />
            </Tooltip>
          ) : (
            <Flex align="center" justify="space-between">
              <Space size={6}>
                <Badge status="success" />
                <Typography.Text style={{ fontSize: 12, color: "var(--adfly-text-muted)" }}>
                  {import.meta.env.DEV ? "本地开发" : "生产环境"}
                </Typography.Text>
              </Space>
              <Typography.Text style={{ fontSize: 12, color: "var(--adfly-text-muted)" }}>
                v0.1.0
              </Typography.Text>
            </Flex>
          )}
        </div>
      </Sider>

      <Layout style={{ background: theme.layout.bodyBg }}>
        <Header
          className="adfly-header"
          style={{ background: theme.layout.headerBg, height: theme.layout.headerHeight }}
        >
          <div className="adfly-header-left">
            <Tooltip title={collapsed ? "展开菜单" : "收起菜单"}>
              <Button
                type="text"
                className="adfly-icon-btn"
                aria-label={collapsed ? "展开菜单" : "收起菜单"}
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed((value) => !value)}
              />
            </Tooltip>
            <Breadcrumb className="adfly-crumb" items={crumbs} />
          </div>

          <div className="adfly-header-right">
            <AutoComplete
              className="adfly-search"
              popupMatchSelectWidth={320}
              value={query}
              options={searchOptions}
              onSearch={setQuery}
              onSelect={(value) => {
                setQuery("");
                goTo(value);
              }}
              notFoundContent={<div className="adfly-empty adfly-empty-compact">没有匹配的菜单</div>}
            >
              <Input
                ref={searchRef}
                allowClear
                variant="filled"
                prefix={<SearchOutlined />}
                placeholder="搜索菜单"
                suffix={<Tag className="adfly-kbd">⌘K</Tag>}
              />
            </AutoComplete>

            <Divider type="vertical" className="adfly-header-divider" />

            <Tooltip title="打开前台站点">
              <Button
                type="text"
                className="adfly-icon-btn"
                aria-label="打开前台站点"
                icon={<ExportOutlined />}
                href={toFrontendUrl("/")}
                target="_blank"
                rel="noopener noreferrer"
              />
            </Tooltip>
            <Tooltip title="主题设置">
              <Button
                type="text"
                className="adfly-icon-btn"
                aria-label="主题设置"
                icon={<BgColorsOutlined />}
                onClick={() => goTo("/settings/theme")}
              />
            </Tooltip>

            <Divider type="vertical" className="adfly-header-divider" />

            <Dropdown
              trigger={["click"]}
              placement="bottomRight"
              menu={{
                items: [
                  {
                    key: "header",
                    type: "group",
                    label: (
                      <Space direction="vertical" size={0}>
                        <Typography.Text strong>{user?.username ?? "admin"}</Typography.Text>
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                          {roleLabel(user?.role)} · ADFLY 管理后台
                        </Typography.Text>
                      </Space>
                    ),
                  },
                  { type: "divider" },
                  {
                    key: "/settings/theme",
                    icon: <BgColorsOutlined />,
                    label: "主题设置",
                    onClick: () => goTo("/settings/theme"),
                  },
                  {
                    key: "signout",
                    icon: <LogoutOutlined />,
                    label: "退出登录",
                    danger: true,
                    onClick: () => void handleSignOut(),
                  },
                ],
              }}
            >
              <span className="adfly-user">
                <Avatar
                  size={30}
                  icon={<UserOutlined />}
                  style={{ background: theme.brand.colorPrimary, flex: "none" }}
                />
                <span className="adfly-user-meta">
                  <span className="adfly-user-name">{user?.username ?? "admin"}</span>
                  <span className="adfly-user-role">{roleLabel(user?.role)}</span>
                </span>
                <DownOutlined className="adfly-user-caret" />
              </span>
            </Dropdown>
          </div>
        </Header>

        <Content className="adfly-content">
          <div className="adfly-content-inner">
            <Outlet />
          </div>
        </Content>
        <FloatButton.BackTop type="primary" />
      </Layout>
    </Layout>
  );
}
