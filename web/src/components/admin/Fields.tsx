"use client";

import { useState } from "react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-all duration-200 placeholder:text-ink-4 focus:border-brand/60 focus:ring-3 focus:ring-brand/15";

export function Panel({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-card border border-line bg-white p-5 md:p-7", className)}>
      <header className="mb-5">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {description ? <p className="mt-1 text-[13px] text-ink-4">{description}</p> : null}
      </header>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}

export function Field({
  label,
  name,
  defaultValue,
  placeholder,
  hint,
  type = "text",
  className,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  hint?: string;
  type?: string;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-2", className)}>
      <span className="text-[13px] font-medium text-ink">{label}</span>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={inputClass}
      />
      {hint ? <span className="text-[12px] text-ink-4">{hint}</span> : null}
    </label>
  );
}

export function TextArea({
  label,
  name,
  defaultValue,
  placeholder,
  hint,
  rows = 4,
  className,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  hint?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-2", className)}>
      <span className="text-[13px] font-medium text-ink">{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        rows={rows}
        className={cn(inputClass, "resize-y leading-relaxed")}
      />
      {hint ? <span className="text-[12px] text-ink-4">{hint}</span> : null}
    </label>
  );
}

export function Select({
  label,
  name,
  defaultValue,
  options,
  className,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-2", className)}>
      <span className="text-[13px] font-medium text-ink">{label}</span>
      <select name={name} defaultValue={defaultValue} className={cn(inputClass, "cursor-pointer")}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Checkbox({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-[13px] font-medium text-ink">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="size-4 cursor-pointer accent-[var(--color-brand)]"
      />
      {label}
    </label>
  );
}

/**
 * Simple repeatable text input list — submits `name[0]`, `name[1]`, … so the
 * server rebuilds a `string[]`.
 */
interface ListRow {
  rid: number;
  value: string;
}

export function StringListField({
  name,
  label,
  defaultValue = [],
  placeholder,
  hint,
}: {
  name: string;
  label: string;
  defaultValue?: string[];
  placeholder?: string;
  hint?: string;
}) {
  const [rows, setRows] = useState<ListRow[]>(() =>
    defaultValue.map((value, i) => ({ rid: i, value })),
  );
  const [nextRid, setNextRid] = useState(defaultValue.length);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-ink">{label}</span>
        <button
          type="button"
          onClick={() => {
            setRows((prev) => [...prev, { rid: nextRid, value: "" }]);
            setNextRid((n) => n + 1);
          }}
          className="cursor-pointer rounded-lg border border-line px-3 py-1.5 text-[12px] font-medium text-brand transition-colors hover:border-brand/40 hover:bg-brand-soft"
        >
          + 添加
        </button>
      </div>
      {hint ? <span className="text-[12px] text-ink-4">{hint}</span> : null}
      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-[13px] text-ink-4">
          暂无条目
        </p>
      ) : null}
      <div className="flex flex-col gap-2">
        {rows.map((row, index) => (
          <div key={row.rid} className="flex items-center gap-2">
            <input
              name={`${name}[${index}]`}
              value={row.value}
              placeholder={placeholder}
              onChange={(event) =>
                setRows((prev) =>
                  prev.map((item) =>
                    item.rid === row.rid ? { ...item, value: event.target.value } : item,
                  ),
                )
              }
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => setRows((prev) => prev.filter((item) => item.rid !== row.rid))}
              className="shrink-0 cursor-pointer rounded-lg border border-line px-3 py-2 text-[12px] text-red-500 transition-colors hover:border-red-200"
            >
              删除
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export interface ArrayFieldSpec {
  key: string;
  label: string;
  multiline?: boolean;
  placeholder?: string;
}

interface Row {
  rid: number;
  values: Record<string, string>;
}

interface Row {
  rid: number;
  values: Record<string, string>;
  /** Keys that exist in the stored data — always submitted (even when blank). */
  present: Record<string, true>;
}

/** Keep only string/number/boolean members so arbitrary content interfaces work. */
function toValues(source: object): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(source)) {
    if (typeof value === "string") out[key] = value;
    else if (typeof value === "number") out[key] = String(value);
    else if (typeof value === "boolean") out[key] = value ? "yes" : "";
  }
  return out;
}

function toPresent(source: object): Record<string, true> {
  const out: Record<string, true> = {};
  for (const [key, value] of Object.entries(source)) {
    if (["string", "number", "boolean"].includes(typeof value)) out[key] = true;
  }
  return out;
}

/**
 * Repeater: names inputs as `name[index][key]` so the server can rebuild an
 * array from flat FormData.
 */
export function ArrayField<T extends object>({
  name,
  label,
  fields,
  defaultValues = [],
  blank,
  hint,
}: {
  name: string;
  label: string;
  fields: ArrayFieldSpec[];
  defaultValues?: readonly T[];
  blank: Record<string, string>;
  hint?: string;
}) {
  const [rows, setRows] = useState<Row[]>(() =>
    defaultValues.map((values, i) => ({
      rid: i,
      values: toValues(values),
      present: toPresent(values),
    })),
  );
  const [nextRid, setNextRid] = useState(defaultValues.length);

  const add = () => {
    setRows((prev) => [
      ...prev,
      { rid: nextRid, values: { ...blank }, present: {} as Record<string, true> },
    ]);
    setNextRid((n) => n + 1);
  };

  const remove = (rid: number) => setRows((prev) => prev.filter((row) => row.rid !== rid));

  const update = (rid: number, key: string, value: string) =>
    setRows((prev) =>
      prev.map((row) => (row.rid === rid ? { ...row, values: { ...row.values, [key]: value } } : row)),
    );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-ink">{label}</span>
        <button
          type="button"
          onClick={add}
          className="cursor-pointer rounded-lg border border-line px-3 py-1.5 text-[12px] font-medium text-brand transition-colors hover:border-brand/40 hover:bg-brand-soft"
        >
          + 添加
        </button>
      </div>
      {hint ? <span className="text-[12px] text-ink-4">{hint}</span> : null}

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-[13px] text-ink-4">
          暂无条目
        </p>
      ) : null}

      <div className="flex flex-col gap-3">
        {rows.map((row, index) => (
          <div key={row.rid} className="rounded-xl border border-line bg-surface/50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[12px] font-medium text-ink-4">#{index + 1}</span>
              <button
                type="button"
                onClick={() => remove(row.rid)}
                className="cursor-pointer text-[12px] text-red-500 transition-opacity hover:opacity-70"
              >
                删除
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {fields.map((field) => {
                // Optional fields that were never set stay unset instead of
                // being written back as empty strings.
                const fieldName =
                  row.present[field.key] || (row.values[field.key] ?? "") !== ""
                    ? `${name}[${index}][${field.key}]`
                    : undefined;
                return (
                  <div key={field.key} className={field.multiline ? "md:col-span-2" : undefined}>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[12px] text-ink-3">{field.label}</span>
                      {field.multiline ? (
                        <textarea
                          name={fieldName}
                          value={row.values[field.key] ?? ""}
                          placeholder={field.placeholder}
                          rows={3}
                          onChange={(event) => update(row.rid, field.key, event.target.value)}
                          className={cn(inputClass, "resize-y leading-relaxed")}
                        />
                      ) : (
                        <input
                          name={fieldName}
                          value={row.values[field.key] ?? ""}
                          placeholder={field.placeholder}
                          onChange={(event) => update(row.rid, field.key, event.target.value)}
                          className={inputClass}
                        />
                      )}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
