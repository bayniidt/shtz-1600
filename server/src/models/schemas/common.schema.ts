import { Schema, type SchemaOptions } from "mongoose";

/** 单文档集合统一使用该 key，保证「永远只有一条」语义。 */
export const SINGLETON_KEY = "default";

/** 链接 / CTA：`label` + `href`（可标记外链）。 */
export const linkSchema = new Schema(
  {
    label: { type: String, default: "" },
    href: { type: String, default: "" },
    external: { type: Boolean, default: false },
  },
  { _id: false },
);

/**
 * 「真假」标记字段。
 * 现有 `data/site.json` 中使用 `"yes"` / `""` 表达，而后台开关写入布尔值，
 * 因此这里统一用 Mixed 原样保存，读取端用 `isTruthyFlag()` 归一化。
 */
export const flagSchema = { type: Schema.Types.Mixed, default: false } as const;

/** 归一化 `true` / `"yes"` / `"1"` 等真假标记。 */
export function isTruthyFlag(value: unknown): boolean {
  if (value === true) return true;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "yes" || normalized === "true" || normalized === "1";
  }
  return false;
}

/** 单文档集合的 toJSON：隐藏内部字段，仅对外暴露业务字段 + updatedAt。 */
export function stripSingletonFields(_doc: unknown, ret: unknown): Record<string, unknown> {
  const target = ret as Record<string, unknown>;
  delete target._id;
  delete target.__v;
  delete target.key;
  delete target.createdAt;
  return target;
}

/** 单文档集合的通用 Schema 选项。 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function singletonSchemaOptions(): SchemaOptions<any> {
  return {
    timestamps: true,
    versionKey: false,
    minimize: false,
    toJSON: { transform: stripSingletonFields },
  };
}

/** CRUD 实体集合的 toJSON：隐藏 `_id` / `__v`，保留业务 `id` 与时间戳。 */
export function stripEntityFields(_doc: unknown, ret: unknown): Record<string, unknown> {
  const target = ret as Record<string, unknown>;
  delete target._id;
  delete target.__v;
  return target;
}

/** CRUD 实体集合的通用 Schema 选项。 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function entitySchemaOptions(): SchemaOptions<any> {
  return {
    timestamps: true,
    versionKey: false,
    minimize: false,
    toJSON: { transform: stripEntityFields },
  };
}
