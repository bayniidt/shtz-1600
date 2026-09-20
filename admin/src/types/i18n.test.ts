import { describe, expect, it } from "vitest";

import { buildLocalizedPayload, getLocalizedValues } from "@/types/i18n";

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
});
