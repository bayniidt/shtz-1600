import { Schema, model, type Document } from "mongoose";

import { DEFAULT_ADMIN_THEME } from "@/config/theme";

const hex = (fallback: string) => ({
  type: String,
  match: [/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "颜色格式应为 #RRGGBB"],
  default: fallback,
});

export interface ThemeSettingDoc extends Document {
  /** 固定为 "admin"，保证单文档 */
  key: string;
  brand: {
    colorPrimary: string;
    colorPrimaryStrong: string;
    colorPrimarySoft: string;
    colorAccent: string;
  };
  semantic: {
    colorSuccess: string;
    colorWarning: string;
    colorError: string;
    colorInfo: string;
  };
  layout: {
    headerBg: string;
    siderBg: string;
    bodyBg: string;
    headerHeight: number;
    siderWidth: number;
  };
  typography: {
    fontFamily: string;
    fontSize: number;
    borderRadius: number;
  };
  updatedAt: Date;
}

const themeSettingSchema = new Schema<ThemeSettingDoc>(
  {
    key: { type: String, required: true, unique: true, default: "admin" },
    brand: {
      _id: false,
      colorPrimary: hex(DEFAULT_ADMIN_THEME.brand.colorPrimary),
      colorPrimaryStrong: hex(DEFAULT_ADMIN_THEME.brand.colorPrimaryStrong),
      colorPrimarySoft: hex(DEFAULT_ADMIN_THEME.brand.colorPrimarySoft),
      colorAccent: hex(DEFAULT_ADMIN_THEME.brand.colorAccent),
    },
    semantic: {
      _id: false,
      colorSuccess: hex(DEFAULT_ADMIN_THEME.semantic.colorSuccess),
      colorWarning: hex(DEFAULT_ADMIN_THEME.semantic.colorWarning),
      colorError: hex(DEFAULT_ADMIN_THEME.semantic.colorError),
      colorInfo: hex(DEFAULT_ADMIN_THEME.semantic.colorInfo),
    },
    layout: {
      _id: false,
      headerBg: hex(DEFAULT_ADMIN_THEME.layout.headerBg),
      siderBg: hex(DEFAULT_ADMIN_THEME.layout.siderBg),
      bodyBg: hex(DEFAULT_ADMIN_THEME.layout.bodyBg),
      headerHeight: { type: Number, min: 48, max: 96, default: DEFAULT_ADMIN_THEME.layout.headerHeight },
      siderWidth: { type: Number, min: 160, max: 320, default: DEFAULT_ADMIN_THEME.layout.siderWidth },
    },
    typography: {
      _id: false,
      fontFamily: { type: String, default: DEFAULT_ADMIN_THEME.typography.fontFamily },
      fontSize: { type: Number, min: 12, max: 20, default: DEFAULT_ADMIN_THEME.typography.fontSize },
      borderRadius: { type: Number, min: 0, max: 24, default: DEFAULT_ADMIN_THEME.typography.borderRadius },
    },
  },
  {
    timestamps: true,
    versionKey: false,
    minimize: false,
    toJSON: {
      transform(_doc, ret) {
        const target = ret as unknown as Record<string, unknown>;
        delete target._id;
        delete target.__v;
        return target;
      },
    },
  },
);

export const ThemeSetting = model<ThemeSettingDoc>("ThemeSetting", themeSettingSchema);
