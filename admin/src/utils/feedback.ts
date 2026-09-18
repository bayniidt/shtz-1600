import type { MessageInstance } from "antd/es/message/interface";

/**
 * 全局 message 实例持有器。
 * 在 App 内通过 `App.useApp()` 注入，供 axios 拦截器等非组件代码使用。
 */
let instance: MessageInstance | null = null;

export function setMessageInstance(next: MessageInstance): void {
  instance = next;
}

export const feedback = {
  error(content: string): void {
    instance?.error(content);
  },
  success(content: string): void {
    instance?.success(content);
  },
  warning(content: string): void {
    instance?.warning(content);
  },
};
