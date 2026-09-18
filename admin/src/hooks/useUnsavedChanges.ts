import { useEffect, useId } from "react";

import { useDirtyStore } from "@/store/dirty";

export const UNSAVED_CONFIRM_TITLE = "有未保存的修改";
export const UNSAVED_CONFIRM_CONTENT = "离开当前页面将丢失未保存的内容，确定离开吗？";

/**
 * 未保存修改保护：
 * 1. 以 `id` 为单位登记到 `useDirtyStore`，供布局层在跳转前弹出确认
 *    （同一页面多个编辑器互不覆盖）；
 * 2. 注册 `beforeunload`，拦截刷新 / 关闭标签页。
 */
export function useUnsavedChanges(dirty: boolean, label = "当前页面", id?: string): void {
  const autoId = useId();
  const key = id ?? autoId;
  const markDirty = useDirtyStore((state) => state.markDirty);
  const clearDirty = useDirtyStore((state) => state.clearDirty);

  useEffect(() => {
    if (dirty) markDirty(key, label);
    else clearDirty(key);
    return () => clearDirty(key);
  }, [dirty, label, key, markDirty, clearDirty]);

  useEffect(() => {
    if (!dirty) return undefined;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
      return "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
}
