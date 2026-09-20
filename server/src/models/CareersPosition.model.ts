import { Schema, model, type Document, type Model } from "mongoose";

import { bilingualTranslationsSchema, flagSchema, entitySchemaOptions } from "@/models/schemas/common.schema";

export interface CareersPositionDoc extends Document {
  /** 业务主键（URL slug） */
  id: string;
  title: string;
  /** 主归属城市 id（FK → careers_cities.id） */
  cityId: string;
  /** 其他城市 id，`/` 分隔 */
  extraCities: string;
  type: string;
  department: string;
  /** 标签，`/` 或逗号、换行分隔 */
  tags: string;
  /** true / "yes" */
  urgent: boolean | string;
  /** true / "yes" */
  hot: boolean | string;
  publishedAt: string;
  summary: string;
  /** 岗位职责，每行一条 */
  description: string;
  /** 任职要求，每行一条 */
  requirement: string;
  /** 加分项，每行一条 */
  bonus: string;
  applyUrl: string;
  translations?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const careersPositionSchema = new Schema<CareersPositionDoc>(
  {
    id: { type: String, required: true, unique: true, trim: true, index: true },
    title: { type: String, required: true, trim: true },
    cityId: { type: String, default: "", trim: true, index: true },
    extraCities: { type: String, default: "" },
    type: { type: String, default: "" },
    department: { type: String, default: "" },
    tags: { type: String, default: "" },
    urgent: flagSchema,
    hot: flagSchema,
    publishedAt: { type: String, default: "" },
    summary: { type: String, default: "" },
    description: { type: String, default: "" },
    requirement: { type: String, default: "" },
    bonus: { type: String, default: "" },
    applyUrl: { type: String, default: "" },
    translations: bilingualTranslationsSchema,
  },
  entitySchemaOptions(),
);

// 热招列表：热招优先 + 发布时间倒序
careersPositionSchema.index({ hot: -1, publishedAt: -1 });

export const CareersPosition = model<CareersPositionDoc>(
  "CareersPosition",
  careersPositionSchema,
  "careers_positions",
) as Model<CareersPositionDoc>;
