import {
  DashboardOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  SettingOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";

export const MENU_ITEMS: MenuProps["items"] = [
  {
    key: "/dashboard",
    icon: <DashboardOutlined />,
    label: "概览",
  },
  {
    key: "/content",
    icon: <FileTextOutlined />,
    label: "内容管理",
    children: [
      { key: "/content/site", label: "站点与导航" },
      { key: "/content/home", label: "首页内容" },
      { key: "/content/about", label: "关于我们" },
      { key: "/content/careers", label: "招聘内容" },
    ],
  },
  {
    key: "/cases",
    icon: <FolderOpenOutlined />,
    label: "客户案例",
  },
  {
    key: "/careers",
    icon: <TeamOutlined />,
    label: "招聘管理",
  },
  {
    key: "/settings",
    icon: <SettingOutlined />,
    label: "系统设置",
    children: [{ key: "/settings/theme", label: "主题设置" }],
  },
];

/** 路由 → 面包屑标题 */
export const ROUTE_TITLES: Record<string, string> = {
  "/dashboard": "概览",
  "/content/site": "站点与导航",
  "/content/home": "首页内容",
  "/content/about": "关于我们",
  "/content/careers": "招聘内容",
  "/cases": "客户案例",
  "/careers": "招聘管理",
  "/settings/theme": "主题设置",
};

/** 默认展开的菜单组 */
export const DEFAULT_OPEN_KEYS = ["/content", "/settings"];
