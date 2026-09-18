/** 后台主题默认值 —— 与前台 web/src/app/globals.css 的 ADFLY 品牌色一致。 */
export interface AdminTheme {
  brand: {
    colorPrimary: string;
    colorPrimaryStrong: string;
    colorPrimarySoft: string;
    colorAccent: string;
  };
  semantic: {
    colorSuccess: string;
    colorWarning: string;
    colorError: string;
    colorInfo: string;
  };
  layout: {
    headerBg: string;
    siderBg: string;
    bodyBg: string;
    headerHeight: number;
    siderWidth: number;
  };
  typography: {
    fontFamily: string;
    fontSize: number;
    borderRadius: number;
  };
}

export const DEFAULT_ADMIN_THEME: AdminTheme = {
  brand: {
    colorPrimary: "#1e96d4",
    colorPrimaryStrong: "#0f7cbc",
    colorPrimarySoft: "#e8f5fc",
    colorAccent: "#ed5736",
  },
  semantic: {
    colorSuccess: "#10b981",
    colorWarning: "#f59e0b",
    colorError: "#ef4444",
    colorInfo: "#1e96d4",
  },
  layout: {
    headerBg: "#ffffff",
    siderBg: "#fafafa",
    bodyBg: "#f5f7fa",
    headerHeight: 64,
    siderWidth: 220,
  },
  typography: {
    fontFamily:
      'Montserrat, "Noto Sans SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", ui-sans-serif, system-ui, sans-serif',
    fontSize: 14,
    borderRadius: 8,
  },
};

/**
 * 主题局部补丁：接口只返回/提交需要变更的分组字段，后端做深合并。
 */
export type ThemePatch = {
  brand?: Partial<AdminTheme["brand"]>;
  semantic?: Partial<AdminTheme["semantic"]>;
  layout?: Partial<AdminTheme["layout"]>;
  typography?: Partial<AdminTheme["typography"]>;
};

/** 深合并主题（接口返回的局部覆盖默认值）。 */
export function mergeTheme(base: AdminTheme, patch?: ThemePatch | null): AdminTheme {
  if (!patch) return base;
  return {
    brand: { ...base.brand, ...patch.brand },
    semantic: { ...base.semantic, ...patch.semantic },
    layout: { ...base.layout, ...patch.layout },
    typography: { ...base.typography, ...patch.typography },
  };
}

/** 应用主题到 CSS 变量（供 Tailwind / 自定义样式使用）。 */
export function applyCssVariables(theme: AdminTheme): void {
  const root = document.documentElement.style;
  root.setProperty("--adfly-brand", theme.brand.colorPrimary);
  root.setProperty("--adfly-brand-strong", theme.brand.colorPrimaryStrong);
  root.setProperty("--adfly-brand-soft", theme.brand.colorPrimarySoft);
  root.setProperty("--adfly-brand-accent", theme.brand.colorAccent);
  root.setProperty("--adfly-header-h", `${theme.layout.headerHeight}px`);
  root.setProperty("--adfly-sider-w", `${theme.layout.siderWidth}px`);
}
