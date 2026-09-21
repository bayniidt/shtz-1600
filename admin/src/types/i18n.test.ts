import { describe, expect, it } from "vitest";

import type { FieldSpec } from "@/types/field-spec";
import {
  buildBilingualPayload,
  buildLocalizedPayload,
  getLocalizedFormValues,
  getLocalizedValues,
  getTranslationProgress,
} from "@/types/i18n";

describe("双语内容工具", () => {
  it("读取英文译文并对缺失字段回退中文", () => {
    const value = {
      title: "中文标题",
      nested: { description: "中文描述" },
      translations: { en: { title: "English title" } },
    };

    expect(getLocalizedValues(value, "en")).toEqual({
      title: "English title",
      nested: { description: "中文描述" },
    });
  });

  it("保存英文时保留中文根字段及已有译文", () => {
    const source = {
      title: "中文标题",
      updatedAt: "2026-01-01T00:00:00.000Z",
      translations: { en: { title: "旧英文标题" } },
    };

    expect(buildLocalizedPayload(source, "en", { title: "New English title" })).toEqual({
      title: "中文标题",
      translations: { en: { title: "New English title" } },
    });
  });

  it("双语工作台不会把中文回退值伪装成英文，也不会复制共享字段", () => {
    const fields: FieldSpec[] = [
      { kind: "text", name: "title", label: "标题" },
      { kind: "text", name: "href", label: "链接", localization: "shared" },
      { kind: "number", name: "sort", label: "排序" },
    ];
    const source = {
      title: "中文标题",
      href: "/about",
      sort: 1,
      translations: { en: { title: "English title" } },
    };

    expect(getLocalizedFormValues(source, "en", fields)).toEqual({
      title: "English title",
      href: "/about",
      sort: 1,
    });
    expect(
      buildBilingualPayload(source, fields, { title: "新中文", href: "/new", sort: 2 }, { title: "New English" }),
    ).toEqual({
      title: "新中文",
      href: "/new",
      sort: 2,
      translations: { en: { title: "New English" } },
    });
  });

  it("按字段描述计算英文翻译进度", () => {
    const fields: FieldSpec[] = [
      { kind: "text", name: "title", label: "标题" },
      { kind: "text", name: "description", label: "描述", required: false },
      { kind: "text", name: "href", label: "链接", localization: "shared" },
    ];
    expect(
      getTranslationProgress(
        { title: "中文标题", description: "中文描述", href: "/", translations: { en: { title: "English title" } } },
        fields,
      ),
    ).toEqual({ done: 1, total: 2, percent: 50 });
  });
});
