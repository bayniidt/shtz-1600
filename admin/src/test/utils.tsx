import { render, type RenderOptions } from "@testing-library/react";
import { App as AntdApp, ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import type { ReactElement } from "react";
import { MemoryRouter } from "react-router-dom";

interface Options extends Omit<RenderOptions, "wrapper"> {
  /** 初始路由，默认 /dashboard */
  route?: string;
}

/** 统一测试渲染：antd 上下文 + 中文语言包 + MemoryRouter。 */
export function renderWithProviders(ui: ReactElement, options: Options = {}) {
  const { route = "/dashboard", ...rest } = options;
  return render(ui, {
    wrapper: ({ children }) => (
      <ConfigProvider locale={zhCN} theme={{ token: { motion: false } }}>
        <AntdApp>
          <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
        </AntdApp>
      </ConfigProvider>
    ),
    ...rest,
  });
}

export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
