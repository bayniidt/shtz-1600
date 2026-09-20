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

function buildAntdTheme(theme: AdminTheme): ThemeConfig {
  return {
    token: {
      colorPrimary: theme.brand.colorPrimary,
      colorInfo: theme.semantic.colorInfo,
      colorSuccess: theme.semantic.colorSuccess,
      colorWarning: theme.semantic.colorWarning,
      colorError: theme.semantic.colorError,
      colorLink: theme.brand.colorPrimary,
      borderRadius: theme.typography.borderRadius,
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
      },
      Menu: {
        itemSelectedBg: theme.brand.colorPrimarySoft,
        itemSelectedColor: theme.brand.colorPrimary,
        itemHoverBg: "#f0f5ff",
      },
      Button: {
        controlHeight: 40,
        primaryShadow: "none",
      },
      Card: {
        borderRadiusLG: theme.typography.borderRadius,
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
