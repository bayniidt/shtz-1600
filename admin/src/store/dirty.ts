import { create } from "zustand";

interface DirtyState {
  /** 未保存页面登记表：id → 页面名 */
  entries: Record<string, string>;
  markDirty: (id: string, label: string) => void;
  clearDirty: (id: string) => void;
  reset: () => void;
}

/**
 * 未保存状态登记处。
 * 支持同一页面多个编辑器（如首页 6 个 Tab）同时登记，避免互相覆盖。
 */
export const useDirtyStore = create<DirtyState>((set) => ({
  entries: {},
  markDirty: (id, label) => set((state) => ({ entries: { ...state.entries, [id]: label } })),
  clearDirty: (id) =>
    set((state) => {
      if (!(id in state.entries)) return state;
      const entries = { ...state.entries };
      delete entries[id];
      return { entries };
    }),
  reset: () => set({ entries: {} }),
}));

/** 是否存在未保存的修改 */
export function selectIsDirty(state: DirtyState): boolean {
  return Object.keys(state.entries).length > 0;
}

/** 存在未保存修改时的提示名称（取第一个登记的页面） */
export function selectDirtyLabel(state: DirtyState): string {
  const labels = Object.values(state.entries);
  return labels[0] ?? "当前页面";
}

export const useIsDirty = (): boolean => useDirtyStore(selectIsDirty);
export const useDirtyLabel = (): string => useDirtyStore(selectDirtyLabel);
