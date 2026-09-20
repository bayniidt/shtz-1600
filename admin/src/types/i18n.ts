/** 管理端统一支持的语言。中文字段仍保留在文档根部，英文译文保存到 translations.en。 */
export type Locale = "zh" | "en";

export interface BilingualTranslations {
  zh?: Record<string, unknown>;
  en?: Record<string, unknown>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** 去除传给表单的内部多语言字段，避免它被当成普通表单字段提交。 */
export function withoutTranslations<T extends object>(value: T): Record<string, unknown> {
  const result = { ...(value as Record<string, unknown>) };
  delete result.translations;
  return result;
}

function withoutServerFields(value: object): Record<string, unknown> {
  const result = withoutTranslations(value);
  for (const key of ["_id", "__v", "key", "createdAt", "updatedAt", "positionsCount", "positions"]) {
    delete result[key];
  }
  return result;
}

/** 递归合并译文，未录入的英文内容回退到中文，便于逐步补齐翻译。 */
function mergeLocaleValue(base: unknown, override: unknown): unknown {
  if (override === undefined) return base;
  if (Array.isArray(base) && Array.isArray(override)) {
    return override.map((item, index) => mergeLocaleValue(base[index], item));
  }
  if (isRecord(base) && isRecord(override)) {
    const result: Record<string, unknown> = { ...base };
    for (const [key, value] of Object.entries(override)) {
      result[key] = mergeLocaleValue(base[key], value);
    }
    return result;
  }
  return override;
}

export function getLocalizedValues(value: object, locale: Locale): Record<string, unknown> {
  const base = withoutTranslations(value);
  const source = value as Record<string, unknown>;
  const translations = isRecord(source.translations) ? source.translations : {};
  const translated = isRecord(translations[locale]) ? translations[locale] : undefined;
  return (mergeLocaleValue(base, translated) as Record<string, unknown>) ?? base;
}

/** 将当前语言表单值写回兼容旧字段的文档，并保留另一种语言。 */
export function buildLocalizedPayload(
  source: object,
  locale: Locale,
  values: object,
): Record<string, unknown> {
  const base = withoutServerFields(source);
  const sourceRecord = source as Record<string, unknown>;
  const existingTranslations = isRecord(sourceRecord.translations) ? sourceRecord.translations : {};
  const translatedValues = withoutTranslations(values);
  const canonical = locale === "zh" || Object.keys(base).length === 0 ? translatedValues : base;

  return {
    ...canonical,
    translations: {
      ...existingTranslations,
      [locale]: translatedValues,
    },
  };
}
