import { App as AntdApp, ConfigProvider, type ThemeConfig } from "antd";
import zhCN from "antd/locale/zh_CN";
import { useEffect, useMemo } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import RequireAuth from "@/components/RequireAuth";
import type { AdminTheme } from "@/config/theme";
import BasicLayout from "@/layouts/BasicLayout";
import ContentManagementPage from "@/pages/Content/ContentManagement";
import AboutContent from "@/pages/Content/About";
import CareersContent from "@/pages/Content/CareersContent";
import HomeContent from "@/pages/Content/Home";
import SiteContent from "@/pages/Content/Site";
import Dashboard from "@/pages/Dashboard";
import CaseEditorPage from "@/pages/cases/CaseEditor";
import CaseListPage from "@/pages/cases/CaseList";
import CareersOverviewPage from "@/pages/careers/CareersOverview";
import CityEditorPage from "@/pages/careers/CityEditor";
import PositionEditorPage from "@/pages/careers/PositionEditor";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import ThemeSettings from "@/pages/ThemeSettings";
import { useAuthStore } from "@/store/auth";
import { useThemeStore } from "@/store/theme";
import { setMessageInstance } from "@/utils/feedback";

/** 把 antd 的 message 实例暴露给非组件代码（axios 拦截器）。 */
function MessageBridge() {
  const { message } = AntdApp.useApp();
  useEffect(() => {
    setMessageInstance(message);
  }, [message]);
  return null;
}

/** 把主题色转成 rgba，用于生成与品牌色一致的阴影 / 悬浮态。 */
function withAlpha(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "");
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;
  const value = Number.parseInt(full.slice(0, 6), 16);
  if (Number.isNaN(value)) return hex;
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function buildAntdTheme(theme: AdminTheme): ThemeConfig {
  const radius = theme.typography.borderRadius;

  return {
    token: {
      colorPrimary: theme.brand.colorPrimary,
      colorInfo: theme.semantic.colorInfo,
      colorSuccess: theme.semantic.colorSuccess,
      colorWarning: theme.semantic.colorWarning,
      colorError: theme.semantic.colorError,
      colorLink: theme.brand.colorPrimary,
      colorText: "#0f1b2a",
      colorTextSecondary: "#5b6b7f",
      colorTextTertiary: "#8a97a8",
      colorBorder: "#dde4ec",
      colorBorderSecondary: "#eaeff5",
      colorBgLayout: theme.layout.bodyBg,
      controlOutline: withAlpha(theme.brand.colorPrimary, 0.14),
      // 精确编辑风：直角 + 克制的叠加阴影（仅浮层使用）
      borderRadius: radius,
      borderRadiusLG: radius,
      borderRadiusSM: radius,
      borderRadiusXS: radius,
      boxShadow: "0 16px 40px -12px rgba(15, 27, 42, 0.18), 0 2px 6px rgba(15, 27, 42, 0.06)",
      boxShadowSecondary: "0 22px 52px -18px rgba(15, 27, 42, 0.24)",
      fontFamily: theme.typography.fontFamily,
      fontSize: theme.typography.fontSize,
      // 后台不使用动画
      motion: false,
    },
    components: {
      Layout: {
        headerBg: theme.layout.headerBg,
        siderBg: theme.layout.siderBg,
        bodyBg: theme.layout.bodyBg,
        headerHeight: theme.layout.headerHeight,
        headerPadding: "0 24px",
      },
      Menu: {
        itemBg: "transparent",
        itemSelectedBg: theme.brand.colorPrimarySoft,
        itemSelectedColor: theme.brand.colorPrimaryStrong,
        itemHoverBg: "#f2f6fa",
        itemHoverColor: theme.brand.colorPrimaryStrong,
        itemHeight: 38,
        itemMarginInline: 0,
        itemMarginBlock: 0,
        itemBorderRadius: radius,
        subMenuItemBg: "transparent",
        activeBarWidth: 0,
        groupTitleColor: "#8a97a8",
        groupTitleFontSize: 10.5,
        groupTitleLineHeight: 1.4,
      },
      Button: {
        controlHeight: 34,
        controlHeightLG: 38,
        controlHeightSM: 28,
        primaryShadow: "none",
        defaultShadow: "none",
        fontWeight: 500,
      },
      Card: {
        borderRadiusLG: radius,
        headerFontSize: 14,
        headerHeight: 46,
        paddingLG: 20,
        headerBg: "transparent",
      },
      Table: {
        headerBg: "#f2f6fa",
        headerColor: "#5b6b7f",
        headerSplitColor: "transparent",
        rowHoverBg: "#f6fafd",
        borderColor: "#eaeff5",
        cellPaddingBlock: 12,
        cellPaddingInline: 16,
        headerBorderRadius: radius,
      },
      Modal: {
        borderRadiusLG: radius,
        headerBg: "#fff",
      },
      Form: {
        labelColor: "#5b6b7f",
        labelFontSize: 12.5,
        labelHeight: 22,
        verticalLabelPadding: "0 0 6px",
        itemMarginBottom: 18,
      },
      Input: {
        paddingBlock: 5,
        activeShadow: `0 0 0 2px ${withAlpha(theme.brand.colorPrimary, 0.12)}`,
      },
      InputNumber: {
        activeShadow: `0 0 0 2px ${withAlpha(theme.brand.colorPrimary, 0.12)}`,
      },
      Select: {
        optionSelectedBg: theme.brand.colorPrimarySoft,
        optionSelectedColor: theme.brand.colorPrimaryStrong,
      },
      Tag: {
        borderRadiusSM: radius,
      },
      Descriptions: {
        labelBg: "transparent",
        itemPaddingBottom: 10,
      },
      Tabs: {
        itemSelectedColor: theme.brand.colorPrimary,
        inkBarColor: theme.brand.colorPrimary,
      },
      Breadcrumb: {
        itemColor: "#8a97a8",
        lastItemColor: "#0f1b2a",
        separatorColor: "#c8d2de",
        linkColor: "#8a97a8",
        linkHoverColor: theme.brand.colorPrimary,
        fontSize: 13,
      },
      Progress: {
        defaultColor: theme.brand.colorPrimary,
        remainingColor: "#eef2f6",
        lineBorderRadius: radius,
      },
      Statistic: {
        titleFontSize: 12,
        contentFontSize: 30,
      },
      Dropdown: {
        borderRadiusLG: radius,
        controlItemBgHover: "#f2f6fa",
        paddingBlock: 6,
      },
      Divider: {
        colorSplit: "#eaeff6",
      },
      Tooltip: {
        borderRadius: radius,
        colorBgSpotlight: "#0f1b2a",
      },
      FloatButton: {
        borderRadiusLG: radius,
      },
    },
  };
}

const basename = (import.meta.env.BASE_URL ?? "/admin/").replace(/\/+$/, "") || "/";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<RequireAuth />}>
        <Route element={<BasicLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/content" element={<ContentManagementPage />} />
          <Route path="/content/site" element={<SiteContent />} />
          <Route path="/content/home" element={<HomeContent />} />
          <Route path="/content/about" element={<AboutContent />} />
          <Route path="/content/careers" element={<CareersContent />} />
          <Route path="/cases" element={<CaseListPage />} />
          <Route path="/cases/new" element={<CaseEditorPage />} />
          <Route path="/cases/:id/edit" element={<CaseEditorPage />} />
          <Route path="/careers" element={<CareersOverviewPage />} />
          <Route path="/careers/cities/new" element={<CityEditorPage />} />
          <Route path="/careers/cities/:id/edit" element={<CityEditorPage />} />
          <Route path="/careers/positions/new" element={<PositionEditorPage />} />
          <Route path="/careers/positions/:id/edit" element={<PositionEditorPage />} />

          <Route path="/settings/theme" element={<ThemeSettings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default function App() {
  const theme = useThemeStore((state) => state.theme);
  const loadTheme = useThemeStore((state) => state.load);
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    void loadTheme();
    void hydrate();
  }, [loadTheme, hydrate]);

  const antdTheme = useMemo(() => buildAntdTheme(theme), [theme]);

  return (
    <ConfigProvider locale={zhCN} theme={antdTheme}>
      <AntdApp>
        <MessageBridge />
        <BrowserRouter basename={basename}>
          <AppRoutes />
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  );
}
