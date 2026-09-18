import { useCallback, useEffect, useRef, useState } from "react";

export interface ContentResource<T> {
  /** 服务端数据（加载完成前为 null） */
  data: T | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  /** 保存并写回新数据；失败抛错交由页面提示 */
  save: (payload: T) => Promise<T>;
  reload: () => void;
}

function toMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "请求失败，请稍后重试";
}

/**
 * 统一管理「加载 → 编辑 → 保存」状态。
 * `load` / `save` 由调用方提供（来自 services/content）。
 */
export function useContentResource<TPayload, TResult = TPayload>(config: {
  load: () => Promise<TPayload>;
  save: (payload: TPayload) => Promise<TResult>;
  /** 保存成功后写入的数据（默认使用返回值） */
  mapResult?: (result: TResult, payload: TPayload) => TPayload;
}): ContentResource<TPayload> {
  const { load, save, mapResult } = config;
  const [data, setData] = useState<TPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    load()
      .then((result) => {
        if (!active) return;
        setData(result);
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        setError(toMessage(loadError));
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
    // load 由调用方用 useCallback 固定，version 用于手动重载
  }, [load, version]);

  const reload = useCallback(() => setVersion((value) => value + 1), []);

  const doSave = useCallback(
    async (payload: TPayload) => {
      setSaving(true);
      try {
        const result = await save(payload);
        const next = mapResult ? mapResult(result, payload) : (result as unknown as TPayload);
        if (mounted.current) setData(next);
        return next;
      } finally {
        if (mounted.current) setSaving(false);
      }
    },
    [save, mapResult],
  );

  return { data, loading, saving, error, save: doSave, reload };
}
