import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { useDirtyStore } from "@/store/dirty";

beforeEach(() => {
  useDirtyStore.getState().reset();
});

function fireBeforeUnload(): BeforeUnloadEvent {
  const event = new Event("beforeunload", { cancelable: true }) as BeforeUnloadEvent;
  window.dispatchEvent(event);
  return event;
}

describe("useUnsavedChanges", () => {
  it("U1 dirty=false 时不登记，也不拦截刷新", () => {
    renderHook(() => useUnsavedChanges(false, "站点与导航"));

    expect(useDirtyStore.getState().entries).toEqual({});
    expect(fireBeforeUnload().defaultPrevented).toBe(false);
  });

  it("U2 dirty=true 时登记页面名并拦截浏览器刷新", () => {
    renderHook(() => useUnsavedChanges(true, "站点与导航", "site"));

    expect(useDirtyStore.getState().entries).toEqual({ site: "站点与导航" });
    expect(fireBeforeUnload().defaultPrevented).toBe(true);
  });

  it("U3 卸载时清掉登记", () => {
    const { unmount } = renderHook(() => useUnsavedChanges(true, "首页内容", "home-hero"));
    expect(useDirtyStore.getState().entries).toEqual({ "home-hero": "首页内容" });

    unmount();
    expect(useDirtyStore.getState().entries).toEqual({});
  });

  it("U4 dirty 由 true 变 false 后同步解绑（不再拦截）", () => {
    const { rerender } = renderHook(({ dirty }: { dirty: boolean }) => useUnsavedChanges(dirty, "关于我们", "about"), {
      initialProps: { dirty: true },
    });
    expect(useDirtyStore.getState().entries).toEqual({ about: "关于我们" });

    rerender({ dirty: false });
    expect(useDirtyStore.getState().entries).toEqual({});
    expect(fireBeforeUnload().defaultPrevented).toBe(false);
  });

  it("U5 多个编辑器同时登记时互不覆盖", () => {
    renderHook(() => useUnsavedChanges(true, "首页内容 · Hero 区", "home-hero"));
    renderHook(() => useUnsavedChanges(true, "首页内容 · 媒体区", "home-media"));

    expect(useDirtyStore.getState().entries).toEqual({
      "home-hero": "首页内容 · Hero 区",
      "home-media": "首页内容 · 媒体区",
    });
  });

  it("U6 不传 id 时使用组件内自增 id（同一组件多次渲染不重复登记）", () => {
    const { rerender } = renderHook(({ dirty }) => useUnsavedChanges(dirty, "自动 id"), {
      initialProps: { dirty: true },
    });
    rerender({ dirty: true });

    expect(Object.keys(useDirtyStore.getState().entries)).toHaveLength(1);
  });

  it("U7 unload 处理器调用 preventDefault（jsdom 将 returnValue 归一为布尔）", () => {
    renderHook(() => useUnsavedChanges(true, "站点与导航", "site"));

    const event = fireBeforeUnload();
    expect(event.defaultPrevented).toBe(true);
    expect(event.returnValue).toBeDefined();
  });
});
