/**
 * Bracket-notation form parsing.
 *
 * The admin forms submit flat `FormData`; array repeaters use names such as
 * `benefits[0][title]`. `parseFormData` rebuilds the nested structure so the
 * result can be merged straight into `data/site.json`.
 */

type Plain = Record<string, unknown>;

function emptyLike(key: string): Plain | unknown[] {
  return /^\d+$/.test(key) ? [] : {};
}

function isPlainObject(value: unknown): value is Plain {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseFormData(formData: FormData): Plain {
  const root: Plain = {};

  for (const [rawKey, rawValue] of formData.entries()) {
    if (rawKey.startsWith("__")) continue;
    if (typeof rawValue !== "string") continue;

    // `a.b[0][c]` → ["a", "b", 0, "c"]
    const path = rawKey
      .split(/[.[\]]+/)
      .filter(Boolean)
      .map((segment) => (/^\d+$/.test(segment) ? Number(segment) : segment));

    if (!path.length) continue;

    let cursor: Plain | unknown[] = root;
    for (let i = 0; i < path.length - 1; i += 1) {
      const key = path[i];
      if (Array.isArray(cursor)) {
        const index = key as number;
        if (cursor[index] === undefined) cursor[index] = emptyLike(String(path[i + 1]));
        cursor = cursor[index] as Plain | unknown[];
      } else {
        const obj = cursor as Plain;
        const keyName = String(key);
        if (!isPlainObject(obj[keyName]) && !Array.isArray(obj[keyName])) {
          obj[keyName] = emptyLike(String(path[i + 1]));
        }
        cursor = obj[keyName] as Plain | unknown[];
      }
    }

    const last = path[path.length - 1];
    if (Array.isArray(cursor)) {
      cursor[last as number] = rawValue;
    } else {
      (cursor as Plain)[String(last)] = rawValue;
    }
  }

  return clean(root) as Plain;
}

/**
 * Compact sparse arrays: drop empty strings in text lists and rows whose fields
 * are all blank. Object properties are kept as-is (even empty) so a form can
 * intentionally clear a value.
 */
function clean(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== undefined && item !== null)
      .map((item) => clean(item))
      .filter((item) => !isBlank(item));
  }
  if (isPlainObject(value)) {
    const out: Plain = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = clean(v);
    }
    return out;
  }
  return value;
}

function isBlank(value: unknown): boolean {
  if (value === "") return true;
  if (isPlainObject(value)) return Object.values(value).every((item) => isBlank(item));
  if (Array.isArray(value)) return value.every((item) => isBlank(item));
  return false;
}

/** Immutably assign `value` at a dot-path inside `target`. */
export function assignPath(target: Plain, dotPath: string, value: unknown): void {
  const keys = dotPath.split(".").filter(Boolean);
  if (!keys.length) return;
  let cursor: Plain = target;
  for (let i = 0; i < keys.length - 1; i += 1) {
    const key = keys[i];
    const next = cursor[key];
    if (!isPlainObject(next)) cursor[key] = {};
    cursor = cursor[key] as Plain;
  }
  const last = keys[keys.length - 1];
  const current = cursor[last];
  // Preserve declared-but-not-submitted siblings (e.g. boolean flags).
  if (isPlainObject(current) && isPlainObject(value)) {
    cursor[last] = { ...current, ...(value as Plain) };
  } else {
    cursor[last] = value;
  }
}
