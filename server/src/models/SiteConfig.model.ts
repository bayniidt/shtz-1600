import { Schema, model, type Document, type Model } from "mongoose";

import { SINGLETON_KEY, bilingualTranslationsSchema, linkSchema, singletonSchemaOptions } from "@/models/schemas/common.schema";

export interface NavItemDoc {
  label: string;
  href: string;
  external?: boolean;
}

export interface SiteConfigDoc extends Document {
  key: string;
  name: string;
  nameEn: string;
  logoText: string;
  logoSub: string;
  nav: NavItemDoc[];
  contactEmail: string;
  businessEmail: string;
  phone: string;
  address: string;
  icp: string;
  seo: { title: string; description: string; keywords: string };
  footerLinks: NavItemDoc[];
  translations?: Record<string, unknown>;
  updatedAt: Date;
}

const siteConfigSchema = new Schema<SiteConfigDoc>(
  {
    key: { type: String, required: true, unique: true, default: SINGLETON_KEY },
    name: { type: String, default: "" },
    nameEn: { type: String, default: "" },
    logoText: { type: String, default: "" },
    logoSub: { type: String, default: "" },
    nav: { type: [linkSchema], default: [] },
    contactEmail: { type: String, default: "" },
    businessEmail: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    icp: { type: String, default: "" },
    seo: {
      _id: false,
      title: { type: String, default: "" },
      description: { type: String, default: "" },
      keywords: { type: String, default: "" },
    },
    footerLinks: { type: [linkSchema], default: [] },
    translations: bilingualTranslationsSchema,
  },
  singletonSchemaOptions(),
);

export const SiteConfig = model<SiteConfigDoc>("SiteConfig", siteConfigSchema, "site_configs") as Model<SiteConfigDoc>;
