import { Schema, model, type Document, type Model } from "mongoose";

import { flagSchema, entitySchemaOptions } from "@/models/schemas/common.schema";

export interface CareersCityDoc extends Document {
  /** 业务主键（URL slug），允许修改，修改时联动 positions */
  id: string;
  name: string;
  nameEn: string;
  /** 外部招聘系统城市代码（仅文档用途） */
  code: string;
  summary: string;
  /** true / "yes" 表示在城市索引中高亮 */
  featured: boolean | string;
  createdAt: Date;
  updatedAt: Date;
}

const careersCitySchema = new Schema<CareersCityDoc>(
  {
    id: { type: String, required: true, unique: true, trim: true, index: true },
    name: { type: String, default: "", trim: true },
    nameEn: { type: String, default: "" },
    code: { type: String, default: "" },
    summary: { type: String, default: "" },
    featured: flagSchema,
  },
  entitySchemaOptions(),
);

export const CareersCity = model<CareersCityDoc>("CareersCity", careersCitySchema, "careers_cities") as Model<CareersCityDoc>;
