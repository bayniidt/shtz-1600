import { Schema, model, type Document, type Model } from "mongoose";

import { INDUSTRY_KEYS, type IndustryKey } from "@/models/CasesPageContent.model";
import { entitySchemaOptions } from "@/models/schemas/common.schema";

export interface CaseStatDoc {
  value: string;
  unit?: string;
  label: string;
}

export interface CaseBlockDoc {
  key: string;
  title: string;
  body: string[];
  points?: string[];
}

export interface CaseItemDoc extends Document {
  /** 业务主键（URL slug），创建后不可修改 */
  id: string;
  title: string;
  client: string;
  industry: IndustryKey;
  region: string;
  summary: string;
  cover: string;
  awards: string[];
  tags: string[];
  year: string;
  featured: boolean;
  stats: CaseStatDoc[];
  blocks: CaseBlockDoc[];
  createdAt: Date;
  updatedAt: Date;
}

const caseItemSchema = new Schema<CaseItemDoc>(
  {
    id: { type: String, required: true, unique: true, trim: true, index: true },
    title: { type: String, default: "", trim: true },
    client: { type: String, default: "", trim: true },
    industry: { type: String, enum: INDUSTRY_KEYS, default: "ecommerce", index: true },
    region: { type: String, default: "" },
    summary: { type: String, default: "" },
    cover: { type: String, default: "" },
    awards: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    year: { type: String, default: "" },
    featured: { type: Boolean, default: false },
    stats: {
      type: [
        {
          _id: false,
          value: { type: String, default: "" },
          unit: { type: String, default: "" },
          label: { type: String, default: "" },
        },
      ],
      default: [],
    },
    blocks: {
      type: [
        {
          _id: false,
          key: { type: String, default: "" },
          title: { type: String, default: "" },
          body: { type: [String], default: [] },
          points: { type: [String], default: [] },
        },
      ],
      default: [],
    },
  },
  entitySchemaOptions(),
);

// 列表默认「置顶优先 + 最近更新优先」
caseItemSchema.index({ featured: -1, updatedAt: -1 });

export const CaseItem = model<CaseItemDoc>("CaseItem", caseItemSchema, "case_items") as Model<CaseItemDoc>;
