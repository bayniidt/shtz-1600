import { describe, expect, it } from "vitest";

import { DEFAULT_ADMIN_THEME, applyCssVariables, mergeTheme } from "@/config/theme";

describe("mergeTheme", () => {
  it("无补丁时返回原对象", () => {
    expect(mergeTheme(DEFAULT_ADMIN_THEME, null)).toBe(DEFAULT_ADMIN_THEME);
    expect(mergeTheme(DEFAULT_ADMIN_THEME, undefined)).toBe(DEFAULT_ADMIN_THEME);
  });

  it("局部补丁只覆盖对应字段", () => {
    const merged = mergeTheme(DEFAULT_ADMIN_THEME, { brand: { colorPrimary: "#ff0000" } });
    expect(merged.brand.colorPrimary).toBe("#ff0000");
    expect(merged.brand.colorAccent).toBe(DEFAULT_ADMIN_THEME.brand.colorAccent);
    expect(merged.layout.siderWidth).toBe(DEFAULT_ADMIN_THEME.layout.siderWidth);
  });

  it("多组补丁同时生效且不共享引用", () => {
    const merged = mergeTheme(DEFAULT_ADMIN_THEME, {
      layout: { siderWidth: 260 },
      typography: { fontSize: 16 },
    });
    expect(merged.layout.siderWidth).toBe(260);
    expect(merged.typography.fontSize).toBe(16);
    merged.layout.siderWidth = 999;
    expect(DEFAULT_ADMIN_THEME.layout.siderWidth).toBe(220);
  });

  it("默认主题与前台品牌色一致", () => {
    expect(DEFAULT_ADMIN_THEME.brand.colorPrimary).toBe("#eb3407");
    expect(DEFAULT_ADMIN_THEME.brand.colorAccent).toBe("#070301");
  });
});

describe("applyCssVariables", () => {
  it("写入全部 CSS 变量", () => {
    applyCssVariables(DEFAULT_ADMIN_THEME);
    const style = document.documentElement.style;
    expect(style.getPropertyValue("--adfly-brand")).toBe("#eb3407");
    expect(style.getPropertyValue("--adfly-brand-strong")).toBe("#b72805");
    expect(style.getPropertyValue("--adfly-brand-soft")).toBe("#fff0eb");
    expect(style.getPropertyValue("--adfly-brand-accent")).toBe("#070301");
    expect(style.getPropertyValue("--adfly-header-h")).toBe("64px");
    expect(style.getPropertyValue("--adfly-sider-w")).toBe("220px");
  });

  it("再次调用会覆盖旧值", () => {
    applyCssVariables(DEFAULT_ADMIN_THEME);
    applyCssVariables(mergeTheme(DEFAULT_ADMIN_THEME, { brand: { colorPrimary: "#000000" } }));
    expect(document.documentElement.style.getPropertyValue("--adfly-brand")).toBe("#000000");
  });
});
