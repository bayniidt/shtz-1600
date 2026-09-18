import { beforeEach, describe, expect, it } from "vitest";

import { selectDirtyLabel, selectIsDirty, useDirtyStore } from "@/store/dirty";

beforeEach(() => {
  useDirtyStore.getState().reset();
});

describe("dirty store（未保存登记）", () => {
  it("D1 初始状态无未保存修改", () => {
    expect(selectIsDirty(useDirtyStore.getState())).toBe(false);
    expect(selectDirtyLabel(useDirtyStore.getState())).toBe("当前页面");
  });

  it("D2 markDirty 登记后进入未保存状态并记录名称", () => {
    useDirtyStore.getState().markDirty("a", "站点与导航");
    expect(useDirtyStore.getState().entries).toEqual({ a: "站点与导航" });
    expect(selectIsDirty(useDirtyStore.getState())).toBe(true);
    expect(selectDirtyLabel(useDirtyStore.getState())).toBe("站点与导航");
  });

  it("D3 clearDirty 只移除自己的登记（多个编辑器互不影响）", () => {
    const store = useDirtyStore.getState();
    store.markDirty("site", "站点与导航");
    store.markDirty("home-hero", "首页内容 · Hero 区");

    store.clearDirty("site");
    expect(useDirtyStore.getState().entries).toEqual({ "home-hero": "首页内容 · Hero 区" });
    expect(selectIsDirty(useDirtyStore.getState())).toBe(true);

    store.clearDirty("home-hero");
    expect(selectIsDirty(useDirtyStore.getState())).toBe(false);
  });

  it("D4 clearDirty 对未登记的 id 是幂等空操作（不产生新对象）", () => {
    const before = useDirtyStore.getState().entries;
    useDirtyStore.getState().clearDirty("never");
    expect(useDirtyStore.getState().entries).toBe(before);
  });

  it("D5 markDirty 重复登记同一 id 只更新名称", () => {
    const store = useDirtyStore.getState();
    store.markDirty("a", "站点与导航");
    store.markDirty("a", "首页内容");
    expect(useDirtyStore.getState().entries).toEqual({ a: "首页内容" });
  });

  it("D6 reset 清空全部登记", () => {
    const store = useDirtyStore.getState();
    store.markDirty("a", "A");
    store.markDirty("b", "B");
    store.reset();
    expect(useDirtyStore.getState().entries).toEqual({});
  });
});
