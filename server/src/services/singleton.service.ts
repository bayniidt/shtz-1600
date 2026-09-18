import type { Model } from "mongoose";

import { SINGLETON_KEY } from "@/models/schemas/common.schema";
import { ApiError } from "@/utils/ApiError";

/**
 * 读取单文档集合的内容。文档不存在时返回 404（提示先执行 seed）。
 * 返回值为 `toJSON()` 结果：已剔除 `_id` / `__v` / `key` / `createdAt`。
 */
export async function readSingleton(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: Model<any>,
  notFoundMessage: string,
): Promise<Record<string, unknown>> {
  const doc = await model.findOne({ key: SINGLETON_KEY });
  if (!doc) throw ApiError.notFound(notFoundMessage);
  return doc.toJSON() as Record<string, unknown>;
}

/** 局部更新（不存在则创建）单文档集合，返回最新内容。 */
export async function updateSingleton(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: Model<any>,
  patch: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const doc = await model.findOneAndUpdate(
    { key: SINGLETON_KEY },
    { $set: patch },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
  return doc.toJSON() as Record<string, unknown>;
}
