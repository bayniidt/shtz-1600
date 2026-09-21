import type { FieldSpec } from "@/types/field-spec";

/** 管理端统一支持的语言。中文字段仍保留在文档根部，英文译文保存到 translations.en。 */
export type Locale = "zh" | "en";
export type ViewMode = "bilingual" | Locale;
export type LocalizationMode = "translated" | "shared" | "source-only";

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

function fieldMode(field: FieldSpec): LocalizationMode {
  if (field.localization) return field.localization;
  if (["number", "select", "switch", "image"].includes(field.kind)) return "shared";
  return "translated";
}

function hasValue(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  if (isRecord(value)) return Object.values(value).some(hasValue);
  return value !== undefined && value !== null && value !== "";
}

function localizedFieldValue(
  base: unknown,
  translation: unknown,
  field: FieldSpec,
  locale: Locale,
): unknown {
  const mode = fieldMode(field);
  if (locale === "zh" || mode !== "translated") return base;

  if (field.kind === "link") {
    const translated = isRecord(translation) ? translation : {};
    const source = isRecord(base) ? base : {};
    return {
      ...source,
      label: translated.label ?? "",
      href: source.href ?? "",
    };
  }

  if (field.kind === "object") {
    return localizedRecord(base, translation, field.fields, locale);
  }

  if (field.kind === "groupList") {
    const baseItems = Array.isArray(base) ? base : [];
    const translationItems = Array.isArray(translation) ? translation : [];
    return baseItems.map((item, index) =>
      localizedRecord(item, translationItems[index], field.fields, locale),
    );
  }

  if (field.kind === "stringList") {
    return Array.isArray(translation) ? translation : [];
  }

  return translation ?? (field.kind === "switch" ? false : field.kind === "number" ? 0 : "");
}

function localizedRecord(
  baseValue: unknown,
  translationValue: unknown,
  fields: FieldSpec[],
  locale: Locale,
): Record<string, unknown> {
  const base = isRecord(baseValue) ? baseValue : {};
  const translation = isRecord(translationValue) ? translationValue : {};
  const result: Record<string, unknown> = {};
  for (const field of fields) {
    result[field.name] = localizedFieldValue(base[field.name], translation[field.name], field, locale);
  }
  return result;
}

/** 为双语工作台生成表单值：英文缺失时保持为空，不再伪装成中文回退值。 */
export function getLocalizedFormValues(
  value: object,
  locale: Locale,
  fields: FieldSpec[],
): Record<string, unknown> {
  const base = withoutServerFields(value);
  if (locale === "zh") return base;
  const source = value as Record<string, unknown>;
  const translations = isRecord(source.translations) ? source.translations : {};
  return localizedRecord(base, translations[locale], fields, locale);
}

function translatedFieldValue(value: unknown, field: FieldSpec): unknown {
  if (fieldMode(field) !== "translated") return undefined;
  if (field.kind === "link") {
    const source = isRecord(value) ? value : {};
    return { label: source.label ?? "" };
  }
  if (field.kind === "object") return translatedRecord(value, field.fields);
  if (field.kind === "groupList") {
    return (Array.isArray(value) ? value : []).map((item) => translatedRecord(item, field.fields));
  }
  return value;
}

function translatedRecord(value: unknown, fields: FieldSpec[]): Record<string, unknown> {
  const source = isRecord(value) ? value : {};
  const result: Record<string, unknown> = {};
  for (const field of fields) {
    const translated = translatedFieldValue(source[field.name], field);
    if (translated !== undefined) result[field.name] = translated;
  }
  return result;
}

/** 保存双语表单：中文写回根字段，英文只写入可翻译字段。共享字段不会复制到 translations.en。 */
export function buildBilingualPayload(
  source: object,
  fields: FieldSpec[],
  zhValues: object,
  enValues: object,
): Record<string, unknown> {
  const base = withoutServerFields(source);
  const sourceRecord = source as Record<string, unknown>;
  const existingTranslations = isRecord(sourceRecord.translations) ? sourceRecord.translations : {};
  return {
    ...base,
    ...withoutTranslations(zhValues),
    translations: {
      ...existingTranslations,
      en: {
        ...(isRecord(existingTranslations.en) ? existingTranslations.en : {}),
        ...translatedRecord(enValues, fields),
      },
    },
  };
}

function countTranslatedFields(
  baseValue: unknown,
  translationValue: unknown,
  fields: FieldSpec[],
): { done: number; total: number } {
  const base = isRecord(baseValue) ? baseValue : {};
  const translation = isRecord(translationValue) ? translationValue : {};
  return fields.reduce(
    (summary, field) => {
      if (fieldMode(field) !== "translated") return summary;
      const source = base[field.name];
      const translated = translation[field.name];
      if (field.kind === "object") {
        const nested = countTranslatedFields(source, translated, field.fields);
        summary.done += nested.done;
        summary.total += nested.total;
        return summary;
      }
      if (field.kind === "groupList") {
        const sourceItems = Array.isArray(source) ? source : [];
        const translatedItems = Array.isArray(translated) ? translated : [];
        sourceItems.forEach((item, index) => {
          const nested = countTranslatedFields(item, translatedItems[index], field.fields);
          summary.done += nested.done;
          summary.total += nested.total;
        });
        return summary;
      }
      if (field.kind === "link") {
        const sourceLink = isRecord(source) ? source : {};
        const translatedLink = isRecord(translated) ? translated : {};
        if (!hasValue(sourceLink.label)) return summary;
        summary.total += 1;
        if (hasValue(translatedLink.label)) summary.done += 1;
        return summary;
      }
      if (!hasValue(source)) return summary;
      summary.total += 1;
      if (hasValue(translated)) summary.done += 1;
      return summary;
    },
    { done: 0, total: 0 },
  );
}

export function getTranslationProgress(value: object, fields: FieldSpec[]) {
  const source = withoutServerFields(value);
  const sourceRecord = value as Record<string, unknown>;
  const translations = isRecord(sourceRecord.translations) ? sourceRecord.translations : {};
  const { done, total } = countTranslatedFields(source, translations.en, fields);
  return { done, total, percent: total === 0 ? 100 : Math.round((done / total) * 100) };
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
