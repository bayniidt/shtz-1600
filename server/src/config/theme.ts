/** 后台主题默认值 —— 与前台 web/src/app/globals.css 的 ADFLY 品牌色保持一致。 */
export const DEFAULT_ADMIN_THEME = {
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
    // 后台视觉基调为「精确编辑风」：默认为直角，圆角由主题设置显式调整
    borderRadius: 0,
  },
} as const;

export type AdminTheme = typeof DEFAULT_ADMIN_THEME;
