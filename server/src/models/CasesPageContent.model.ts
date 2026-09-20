import { Schema, model, type Document, type Model } from "mongoose";

import { SINGLETON_KEY, bilingualTranslationsSchema, singletonSchemaOptions } from "@/models/schemas/common.schema";

export const INDUSTRY_KEYS = ["ecommerce", "game", "app", "brand"] as const;
export type IndustryKey = (typeof INDUSTRY_KEYS)[number];
export const INDUSTRY_FILTER_KEYS = ["all", ...INDUSTRY_KEYS] as const;

export interface CasesPageContentDoc extends Document {
  key: string;
  title: string;
  subtitle: string;
  filters: { key: IndustryKey | "all"; label: string }[];
  translations?: Record<string, unknown>;
  updatedAt: Date;
}

const casesPageContentSchema = new Schema<CasesPageContentDoc>(
  {
    key: { type: String, required: true, unique: true, default: SINGLETON_KEY },
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    filters: {
      type: [
        {
          _id: false,
          key: { type: String, enum: INDUSTRY_FILTER_KEYS, default: "all" },
          label: { type: String, default: "" },
        },
      ],
      default: [],
    },
    translations: bilingualTranslationsSchema,
  },
  singletonSchemaOptions(),
);

export const CasesPageContent = model<CasesPageContentDoc>(
  "CasesPageContent",
  casesPageContentSchema,
  "cases_page_contents",
) as Model<CasesPageContentDoc>;
