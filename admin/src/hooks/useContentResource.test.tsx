import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useContentResource } from "@/hooks/useContentResource";

interface Doc {
  title: string;
}

describe("useContentResource", () => {
  it("H1 加载成功后写入 data 并结束 loading", async () => {
    const load = vi.fn().mockResolvedValue({ title: "站点配置" });
    const save = vi.fn();

    const { result } = renderHook(() => useContentResource<Doc>({ load, save }));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ title: "站点配置" });
    expect(result.current.error).toBeNull();
  });

  it("H2 加载失败时写入 error 且 data 保持 null", async () => {
    const load = vi.fn().mockRejectedValue(new Error("网络异常"));
    const { result } = renderHook(() => useContentResource<Doc>({ load, save: vi.fn() }));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("网络异常");
    expect(result.current.data).toBeNull();
  });

  it("H3 非 Error 异常使用兜底文案", async () => {
    const load = vi.fn().mockRejectedValue({ code: 5000 });
    const { result } = renderHook(() => useContentResource<Doc>({ load, save: vi.fn() }));

    await waitFor(() => expect(result.current.error).toBe("请求失败，请稍后重试"));
  });

  it("H4 save 写入返回值到 data 并正确维护 saving", async () => {
    const load = vi.fn().mockResolvedValue({ title: "旧" });
    let resolveSave: (value: Doc) => void = () => {};
    const save = vi.fn().mockImplementation(
      () => new Promise<Doc>((resolve) => (resolveSave = resolve)),
    );
    const { result } = renderHook(() => useContentResource<Doc>({ load, save }));

    await waitFor(() => expect(result.current.data).toEqual({ title: "旧" }));

    let pending: Promise<Doc> | undefined;
    act(() => {
      pending = result.current.save({ title: "新" });
    });

    await waitFor(() => expect(result.current.saving).toBe(true));

    await act(async () => {
      resolveSave({ title: "新" });
      await pending;
    });

    expect(result.current.saving).toBe(false);
    expect(result.current.data).toEqual({ title: "新" });
  });

  it("H5 save 失败时向上抛出且不覆盖 data", async () => {
    const load = vi.fn().mockResolvedValue({ title: "旧" });
    const save = vi.fn().mockRejectedValue(new Error("保存失败"));
    const { result } = renderHook(() => useContentResource<Doc>({ load, save }));

    await waitFor(() => expect(result.current.data).toEqual({ title: "旧" }));

    await act(async () => {
      await expect(result.current.save({ title: "新" })).rejects.toThrow("保存失败");
    });

    expect(result.current.saving).toBe(false);
    expect(result.current.data).toEqual({ title: "旧" });
  });

  it("H6 mapResult 可自定义写入 data 的内容（局部保存 → 全量覆盖）", async () => {
    const load = vi.fn().mockResolvedValue({ hero: {}, media: {} });
    const save = vi.fn().mockResolvedValue({ hero: { title: "新" }, media: { title: "媒体" } });
    const mapResult = vi.fn(
      (result: Record<string, unknown>) => result as { hero: object; media: object },
    );

    const { result } = renderHook(() =>
      useContentResource<Partial<{ hero: object; media: object }>>({ load, save, mapResult }),
    );
    await waitFor(() => expect(result.current.data).not.toBeNull());

    await act(async () => {
      await result.current.save({ hero: { title: "新" } });
    });

    expect(mapResult).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual({ hero: { title: "新" }, media: { title: "媒体" } });
  });

  it("H7 reload 重新拉取数据（version 变化触发）", async () => {
    const load = vi.fn().mockResolvedValueOnce({ title: "第一次" }).mockResolvedValueOnce({ title: "第二次" });
    const { result } = renderHook(() => useContentResource<Doc>({ load, save: vi.fn() }));

    await waitFor(() => expect(result.current.data).toEqual({ title: "第一次" }));

    act(() => result.current.reload());
    await waitFor(() => expect(result.current.data).toEqual({ title: "第二次" }));
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("H8 卸载后异步结果不再写入（避免内存泄漏告警）", async () => {
    let resolveLoad: (value: Doc) => void = () => {};
    const load = vi.fn().mockImplementation(() => new Promise<Doc>((resolve) => (resolveLoad = resolve)));

    const { result, unmount } = renderHook(() => useContentResource<Doc>({ load, save: vi.fn() }));
    unmount();

    await act(async () => {
      resolveLoad({ title: "延迟返回" });
    });

    expect(result.current.data).toBeNull();
  });
});
