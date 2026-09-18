import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { configure } from "@testing-library/dom";
import { afterEach, vi } from "vitest";

// ---- 并发跑覆盖率时 CPU 紧张，放宽 findBy*/waitFor 默认超时（1s → 5s） ----
configure({ asyncUtilTimeout: 5000 });

// ---- 每个用例后卸载组件，避免 DOM 泄漏导致 "Found multiple elements" ----
afterEach(() => {
  cleanup();
});

// ---- Node 25 自带未初始化的 localStorage，会遮蔽 jsdom 实现，这里强制修正 ----
function createMemoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key: string) => (map.has(key) ? (map.get(key) as string) : null),
    key: (index: number) => [...map.keys()][index] ?? null,
    removeItem: (key: string) => {
      map.delete(key);
    },
    setItem: (key: string, value: string) => {
      map.set(key, String(value));
    },
  } as Storage;
}

const jsdomWindow = typeof window === "undefined" ? undefined : window;
const usableStorage =
  jsdomWindow && typeof jsdomWindow.localStorage?.getItem === "function"
    ? jsdomWindow.localStorage
    : createMemoryStorage();
const usableSessionStorage =
  jsdomWindow && typeof jsdomWindow.sessionStorage?.getItem === "function"
    ? jsdomWindow.sessionStorage
    : createMemoryStorage();

for (const [name, value] of [
  ["localStorage", usableStorage],
  ["sessionStorage", usableSessionStorage],
] as const) {
  Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
  if (jsdomWindow) {
    Object.defineProperty(jsdomWindow, name, { value, configurable: true, writable: true });
  }
}

// ---- antd / 自定义组件在 jsdom 下依赖的浏览器 API 补丁 ----

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});

class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

(globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = ResizeObserverMock;

window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;

if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = ((cb: FrameRequestCallback) =>
    setTimeout(() => cb(Date.now()), 0) as unknown as number) as typeof window.requestAnimationFrame;
}

// jsdom 未实现伪元素样式查询（rc-table 会查询滚动条宽度），统一丢弃第二参数避免噪音报错
const originalGetComputedStyle = window.getComputedStyle.bind(window);
window.getComputedStyle = ((element: Element) =>
  originalGetComputedStyle(element)) as typeof window.getComputedStyle;
