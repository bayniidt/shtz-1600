import { Schema, model, type Document, type Model } from "mongoose";

import { SINGLETON_KEY, singletonSchemaOptions } from "@/models/schemas/common.schema";

export interface CareersContentDoc extends Document {
  key: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  citiesEyebrow: string;
  citiesTitle: string;
  citiesDescription: string;
  cultureTitle: string;
  culture: { title: string; description: string }[];
  benefitsTitle: string;
  /** items 为 `/` 分隔的字符串，与前台展示约定一致 */
  benefits: { group: string; items: string }[];
  jobsEyebrow: string;
  jobsTitle: string;
  portalUrl: string;
  applyEmail: string;
  updatedAt: Date;
}

const careersContentSchema = new Schema<CareersContentDoc>(
  {
    key: { type: String, required: true, unique: true, default: SINGLETON_KEY },
    heroTitle: { type: String, default: "" },
    heroSubtitle: { type: String, default: "" },
    heroDescription: { type: String, default: "" },
    citiesEyebrow: { type: String, default: "" },
    citiesTitle: { type: String, default: "" },
    citiesDescription: { type: String, default: "" },
    cultureTitle: { type: String, default: "" },
    culture: {
      type: [
        {
          _id: false,
          title: { type: String, default: "" },
          description: { type: String, default: "" },
        },
      ],
      default: [],
    },
    benefitsTitle: { type: String, default: "" },
    benefits: {
      type: [
        {
          _id: false,
          group: { type: String, default: "" },
          items: { type: String, default: "" },
        },
      ],
      default: [],
    },
    jobsEyebrow: { type: String, default: "" },
    jobsTitle: { type: String, default: "" },
    portalUrl: { type: String, default: "" },
    applyEmail: { type: String, default: "" },
  },
  singletonSchemaOptions(),
);

export const CareersContent = model<CareersContentDoc>(
  "CareersContent",
  careersContentSchema,
  "careers_contents",
) as Model<CareersContentDoc>;
