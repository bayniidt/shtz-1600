import { LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined } from "@ant-design/icons";
import { App, Avatar, Button, Dropdown, Layout, Menu, Space, Typography } from "antd";
import { useCallback, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { DEFAULT_OPEN_KEYS, MENU_ITEMS, ROUTE_TITLES } from "@/config/menu";
import { UNSAVED_CONFIRM_CONTENT, UNSAVED_CONFIRM_TITLE } from "@/hooks/useUnsavedChanges";
import { useDirtyLabel, useIsDirty } from "@/store/dirty";
import { useThemeStore } from "@/store/theme";
import { useAuthStore } from "@/store/auth";

const { Header, Sider, Content } = Layout;

function selectedMenuKey(pathname: string): string {
  if (pathname.startsWith("/content/careers")) return "/content/careers";
  if (pathname.startsWith("/cases")) return "/cases";
  const exact = Object.keys(ROUTE_TITLES).find((key) => pathname === key);
  return exact ?? "/dashboard";
}

export default function BasicLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { modal } = App.useApp();

  const theme = useThemeStore((state) => state.theme);
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const dirty = useIsDirty();
  const dirtyLabel = useDirtyLabel();

  const selectedKey = useMemo(() => selectedMenuKey(location.pathname), [location.pathname]);
  const title = ROUTE_TITLES[selectedKey] ?? "管理后台";

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  /** 菜单跳转：有未保存修改时先确认（不破坏用户编辑） */
  const handleMenuClick = useCallback(
    ({ key }: { key: string }) => {
      if (key === location.pathname) return;
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

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        theme="light"
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={theme.layout.siderWidth}
        style={{ background: theme.layout.siderBg, borderRight: "1px solid #e4e4e4" }}
      >
        <div
          className="adfly-logo"
          style={{ height: theme.layout.headerHeight, padding: collapsed ? "0 20px" : "0 20px" }}
        >
          <span style={{ fontSize: 18 }}>ADFLY</span>
          {!collapsed && <span className="adfly-logo-sub">Admin</span>}
        </div>
        <Menu
          mode="inline"
          items={MENU_ITEMS}
          selectedKeys={[selectedKey]}
          defaultOpenKeys={DEFAULT_OPEN_KEYS}
          style={{ background: "transparent", borderInlineEnd: "none" }}
          onClick={handleMenuClick}
        />
      </Sider>

      <Layout style={{ background: theme.layout.bodyBg }}>
        <Header
          style={{
            height: theme.layout.headerHeight,
            padding: "0 20px",
            background: theme.layout.headerBg,
            borderBottom: "1px solid #e4e4e4",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Space size={12}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed((value) => !value)}
            />
            <Typography.Text strong style={{ fontSize: 16 }}>
              {title}
            </Typography.Text>
          </Space>

          <Dropdown
            menu={{
              items: [
                {
                  key: "signout",
                  icon: <LogoutOutlined />,
                  label: "退出登录",
                  onClick: () => void handleSignOut(),
                },
              ],
            }}
          >
            <Space style={{ cursor: "pointer" }}>
              <Avatar size="small" icon={<UserOutlined />} style={{ background: theme.brand.colorPrimary }} />
              <Typography.Text>{user?.username ?? "admin"}</Typography.Text>
            </Space>
          </Dropdown>
        </Header>

        <Content style={{ padding: 20 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
