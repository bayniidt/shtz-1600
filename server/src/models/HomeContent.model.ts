import { Schema, model, type Document, type Model } from "mongoose";

import { SINGLETON_KEY, linkSchema, singletonSchemaOptions } from "@/models/schemas/common.schema";

export const MEDIA_CATEGORIES = ["Social", "Search", "Content", "Ads"] as const;
export type MediaCategory = (typeof MEDIA_CATEGORIES)[number];

export interface HomeContentDoc extends Document {
  key: string;
  hero: {
    eyebrow: string;
    title: string;
    titleEn: string;
    description: string;
    primaryCta: { label: string; href: string; external?: boolean };
    secondaryCta: { label: string; href: string; external?: boolean };
    marquee: string[];
    stats: { value: string; label: string }[];
  };
  media: {
    title: string;
    subtitle: string;
    benefits: { title: string; description: string }[];
    partners: { name: string; mark: string; category: MediaCategory; accent?: string }[];
    cta: { label: string; href: string; external?: boolean };
  };
  flow: {
    eyebrow: string;
    title: string;
    description: string;
    orbit: { label: string }[];
    features: { title: string; description: string; mark?: string; points?: string }[];
    cta: { label: string; href: string; external?: boolean };
  };
  clients: {
    title: string;
    subtitle: string;
    industries: { key: string; name: string; description: string; stat: string }[];
    logos: { name: string; industry: string }[];
  };
  strength: {
    title: string;
    description: string;
    nodes: { city: string; role: string; x: number | string; y: number | string; major?: boolean | string }[];
    stats: { value: string; suffix: string; label: string }[];
    cta: { label: string; href: string; external?: boolean };
  };
  honors: {
    title: string;
    subtitle: string;
    groups: { key: string; title: string; items: { title: string; issuer: string; year: string }[] }[];
  };
  updatedAt: Date;
}

/** `x` / `y` 支持像素数字或百分比字符串，`major` 兼容 true 与 "yes"。 */
const nodeSchema = new Schema(
  {
    city: { type: String, default: "" },
    role: { type: String, default: "" },
    x: { type: Schema.Types.Mixed, default: 0 },
    y: { type: Schema.Types.Mixed, default: 0 },
    major: { type: Schema.Types.Mixed, default: false },
  },
  { _id: false },
);

const homeContentSchema = new Schema<HomeContentDoc>(
  {
    key: { type: String, required: true, unique: true, default: SINGLETON_KEY },
    hero: {
      _id: false,
      eyebrow: { type: String, default: "" },
      title: { type: String, default: "" },
      titleEn: { type: String, default: "" },
      description: { type: String, default: "" },
      primaryCta: { type: linkSchema, default: () => ({}) },
      secondaryCta: { type: linkSchema, default: () => ({}) },
      marquee: { type: [String], default: [] },
      stats: {
        type: [{ _id: false, value: { type: String, default: "" }, label: { type: String, default: "" } }],
        default: [],
      },
    },
    media: {
      _id: false,
      title: { type: String, default: "" },
      subtitle: { type: String, default: "" },
      benefits: {
        type: [
          {
            _id: false,
            title: { type: String, default: "" },
            description: { type: String, default: "" },
          },
        ],
        default: [],
      },
      partners: {
        type: [
          {
            _id: false,
            name: { type: String, default: "" },
            mark: { type: String, default: "" },
            category: { type: String, enum: MEDIA_CATEGORIES, default: "Social" },
            accent: { type: String, default: "" },
          },
        ],
        default: [],
      },
      cta: { type: linkSchema, default: () => ({}) },
    },
    flow: {
      _id: false,
      eyebrow: { type: String, default: "" },
      title: { type: String, default: "" },
      description: { type: String, default: "" },
      orbit: {
        type: [{ _id: false, label: { type: String, default: "" } }],
        default: [],
      },
      features: {
        type: [
          {
            _id: false,
            title: { type: String, default: "" },
            description: { type: String, default: "" },
            mark: { type: String, default: "" },
            points: { type: String, default: "" },
          },
        ],
        default: [],
      },
      cta: { type: linkSchema, default: () => ({}) },
    },
    clients: {
      _id: false,
      title: { type: String, default: "" },
      subtitle: { type: String, default: "" },
      industries: {
        type: [
          {
            _id: false,
            key: { type: String, default: "" },
            name: { type: String, default: "" },
            description: { type: String, default: "" },
            stat: { type: String, default: "" },
          },
        ],
        default: [],
      },
      logos: {
        type: [
          {
            _id: false,
            name: { type: String, default: "" },
            industry: { type: String, default: "" },
          },
        ],
        default: [],
      },
    },
    strength: {
      _id: false,
      title: { type: String, default: "" },
      description: { type: String, default: "" },
      nodes: { type: [nodeSchema], default: [] },
      stats: {
        type: [
          {
            _id: false,
            value: { type: String, default: "" },
            suffix: { type: String, default: "" },
            label: { type: String, default: "" },
          },
        ],
        default: [],
      },
      cta: { type: linkSchema, default: () => ({}) },
    },
    honors: {
      _id: false,
      title: { type: String, default: "" },
      subtitle: { type: String, default: "" },
      groups: {
        type: [
          {
            _id: false,
            key: { type: String, default: "" },
            title: { type: String, default: "" },
            items: {
              type: [
                {
                  _id: false,
                  title: { type: String, default: "" },
                  issuer: { type: String, default: "" },
                  year: { type: String, default: "" },
                },
              ],
              default: [],
            },
          },
        ],
        default: [],
      },
    },
  },
  singletonSchemaOptions(),
);

export const HomeContent = model<HomeContentDoc>("HomeContent", homeContentSchema, "home_contents") as Model<HomeContentDoc>;
