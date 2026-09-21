import {
  ApartmentOutlined,
  DashboardOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  GlobalOutlined,
  PlusCircleOutlined,
  SettingOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import type { ReactNode } from "react";

export const MENU_ITEMS: MenuProps["items"] = [
  { key: "/dashboard", icon: <DashboardOutlined />, label: "概览" },
  {
    type: "group",
    label: "内容与业务",
    children: [
      { key: "/content", icon: <FileTextOutlined />, label: "内容管理" },
      { key: "/cases", icon: <FolderOpenOutlined />, label: "客户案例" },
      { key: "/careers", icon: <TeamOutlined />, label: "招聘管理" },
    ],
  },
  {
    type: "group",
    label: "系统",
    children: [{ key: "/settings/theme", icon: <SettingOutlined />, label: "主题设置" }],
  },
];

export interface MenuSearchItem {
  key: string;
  label: string;
  group: string;
  icon: ReactNode;
}

/** 顶栏搜索用的扁平菜单项（含子页面快捷入口）。 */
export const MENU_SEARCH_ITEMS: MenuSearchItem[] = [
  { key: "/dashboard", label: "概览", group: "总览", icon: <DashboardOutlined /> },
  { key: "/content", label: "内容管理", group: "内容与业务", icon: <FileTextOutlined /> },
  { key: "/content/site", label: "站点与导航", group: "内容管理", icon: <GlobalOutlined /> },
  { key: "/content/home", label: "首页内容", group: "内容管理", icon: <ApartmentOutlined /> },
  { key: "/content/about", label: "关于我们", group: "内容管理", icon: <FolderOpenOutlined /> },
  { key: "/content/careers", label: "招聘内容", group: "内容管理", icon: <TeamOutlined /> },
  { key: "/cases", label: "客户案例", group: "内容与业务", icon: <FolderOpenOutlined /> },
  { key: "/cases/new", label: "新建案例", group: "客户案例", icon: <PlusCircleOutlined /> },
  { key: "/careers", label: "招聘管理", group: "内容与业务", icon: <TeamOutlined /> },
  { key: "/careers/cities/new", label: "新建招聘城市", group: "招聘管理", icon: <PlusCircleOutlined /> },
  { key: "/careers/positions/new", label: "新建招聘职位", group: "招聘管理", icon: <PlusCircleOutlined /> },
  { key: "/settings/theme", label: "主题设置", group: "系统", icon: <SettingOutlined /> },
];

/** 侧边菜单顶级分组（面包屑用）。 */
export const MENU_GROUPS: Record<string, string> = {
  "/content": "内容与业务",
  "/cases": "内容与业务",
  "/careers": "内容与业务",
  "/settings/theme": "系统",
};

/** 路由 → 面包屑标题 */
export const ROUTE_TITLES: Record<string, string> = {
  "/dashboard": "概览",
  "/content": "内容管理",
  "/content/site": "站点与导航",
  "/content/home": "首页内容",
  "/content/about": "关于我们",
  "/content/careers": "招聘内容",
  "/cases": "客户案例",
  "/cases/new": "新建案例",
  "/careers": "招聘管理",
  "/careers/cities/new": "新建招聘城市",
  "/careers/positions/new": "新建招聘职位",
  "/settings/theme": "主题设置",
};

/** 子页面 → 父级菜单标题（面包屑中间层） */
export const ROUTE_PARENTS: Array<[string, string]> = [
  ["/content/", "内容管理"],
  ["/cases/", "客户案例"],
  ["/careers/cities/", "招聘管理"],
  ["/careers/positions/", "招聘管理"],
];

/** 路径 → 当前高亮的侧边菜单项。 */
export function selectedMenuKey(pathname: string): string {
  if (pathname.startsWith("/content")) return "/content";
  if (pathname.startsWith("/cases")) return "/cases";
  if (pathname.startsWith("/careers")) return "/careers";
  if (pathname.startsWith("/settings")) return "/settings/theme";
  return "/dashboard";
}

/** 当前页面所属的菜单分组（页面眉标用）。 */
export function groupOf(pathname: string): string {
  return MENU_GROUPS[selectedMenuKey(pathname)] ?? "总览";
}

/** 默认展开的菜单组（分组模式无子菜单，保留空数组以兼容旧调用） */
export const DEFAULT_OPEN_KEYS: string[] = [];
