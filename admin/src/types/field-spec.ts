/**
 * 内容表单的字段描述（Field Spec）。
 *
 * 后台 4 个内容模块的字段数量多、层级深（含嵌套对象数组），
 * 因此用一份声明式描述驱动 `ContentForm` 渲染，避免手写 4 个巨型表单。
 */

export interface BaseField {
  /** 字段名（相对当前表单根） */
  name: string;
  label: string;
  /** 双语工作台中的字段归属：可翻译、共享或仅由中文主语言维护。 */
  localization?: "translated" | "shared" | "source-only";
  /** 栅格宽度，默认 24（整行） */
  span?: number;
  hint?: string;
  required?: boolean;
}

export interface TextField extends BaseField {
  kind: "text";
  placeholder?: string;
  maxLength?: number;
}

export interface TextAreaField extends BaseField {
  kind: "textarea";
  rows?: number;
  placeholder?: string;
  maxLength?: number;
}

export interface NumberField extends BaseField {
  kind: "number";
  min?: number;
  max?: number;
  step?: number;
}

export interface SelectField extends BaseField {
  kind: "select";
  options: { label: string; value: string }[];
}

export interface SwitchField extends BaseField {
  kind: "switch";
}

export interface ImageField extends BaseField {
  kind: "image";
  placeholder?: string;
}

/** 字符串数组（如 marquee、标签） */
export interface StringListField extends BaseField {
  kind: "stringList";
  addText?: string;
  placeholder?: string;
}

/** `{ label, href }` 链接 */
export interface LinkField extends BaseField {
  kind: "link";
}

/** 普通嵌套对象（如 site.seo） */
export interface ObjectField extends BaseField {
  kind: "object";
  fields: FieldSpec[];
}

/** 对象数组：通过 children 描述每一项的字段 */
export interface GroupListField extends BaseField {
  kind: "groupList";
  addText?: string;
  itemTitle?: string;
  min?: number;
  max?: number;
  fields: FieldSpec[];
}

export type FieldSpec =
  | TextField
  | TextAreaField
  | NumberField
  | SelectField
  | SwitchField
  | ImageField
  | StringListField
  | LinkField
  | ObjectField
  | GroupListField;

/** 字段默认值（新增数组条目时使用）。 */
export function emptyValueOf(field: FieldSpec): unknown {
  switch (field.kind) {
    case "number":
      return 0;
    case "switch":
      return false;
    case "select":
      return field.options[0]?.value ?? "";
    case "stringList":
    case "groupList":
      return [];
    case "link":
      return { label: "", href: "" };
    case "object":
      return emptyItemOf(field.fields);
    default:
      return "";
  }
}

/** 由字段描述生成一条空对象（对象数组「添加」按钮使用）。 */
export function emptyItemOf(fields: FieldSpec[]): Record<string, unknown> {
  const item: Record<string, unknown> = {};
  for (const field of fields) {
    item[field.name] = emptyValueOf(field);
  }
  return item;
}
