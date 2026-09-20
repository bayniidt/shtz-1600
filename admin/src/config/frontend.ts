/**
 * 前台站点地址。
 *
 * 生产环境由入口 Nginx 将非 /admin、/api 请求转发给前台，因此默认使用同源地址；
 * 本地开发时前台 Next.js 默认运行在 3000 端口，避免后台把预览和图片请求发回 Vite。
 */
const configuredBaseUrl = import.meta.env.VITE_FRONTEND_BASE_URL?.trim();
const defaultBaseUrl = import.meta.env.DEV ? "http://localhost:3000" : "";

export const FRONTEND_BASE_URL = (configuredBaseUrl || defaultBaseUrl).replace(/\/+$/, "");

export function toFrontendUrl(path: string): string {
  if (!path) return FRONTEND_BASE_URL;
  return `${FRONTEND_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function toFrontendAssetUrl(value: string | undefined): string | undefined {
  if (!value || !value.startsWith("/")) return value;
  return toFrontendUrl(value);
}
