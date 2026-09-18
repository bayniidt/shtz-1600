import { Schema, model, type Document, type Model } from "mongoose";

import { SINGLETON_KEY, singletonSchemaOptions } from "@/models/schemas/common.schema";

export interface AboutContentDoc extends Document {
  key: string;
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  stats: { value: string; unit: string; label: string }[];
  visionTitle: string;
  visionText: string;
  values: { title: string; description: string }[];
  timeline: { period: string; title: string; description: string }[];
  team: { name: string; role: string; bio: string; avatar?: string }[];
  teamIntro: string;
  offices: { city: string; label: string; address: string }[];
  updatedAt: Date;
}

const aboutContentSchema = new Schema<AboutContentDoc>(
  {
    key: { type: String, required: true, unique: true, default: SINGLETON_KEY },
    heroEyebrow: { type: String, default: "" },
    heroTitle: { type: String, default: "" },
    heroDescription: { type: String, default: "" },
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
    visionTitle: { type: String, default: "" },
    visionText: { type: String, default: "" },
    values: {
      type: [
        {
          _id: false,
          title: { type: String, default: "" },
          description: { type: String, default: "" },
        },
      ],
      default: [],
    },
    timeline: {
      type: [
        {
          _id: false,
          period: { type: String, default: "" },
          title: { type: String, default: "" },
          description: { type: String, default: "" },
        },
      ],
      default: [],
    },
    team: {
      type: [
        {
          _id: false,
          name: { type: String, default: "" },
          role: { type: String, default: "" },
          bio: { type: String, default: "" },
          avatar: { type: String, default: "" },
        },
      ],
      default: [],
    },
    teamIntro: { type: String, default: "" },
    offices: {
      type: [
        {
          _id: false,
          city: { type: String, default: "" },
          label: { type: String, default: "" },
          address: { type: String, default: "" },
        },
      ],
      default: [],
    },
  },
  singletonSchemaOptions(),
);

export const AboutContent = model<AboutContentDoc>("AboutContent", aboutContentSchema, "about_contents") as Model<AboutContentDoc>;
