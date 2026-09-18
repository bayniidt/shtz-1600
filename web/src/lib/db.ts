import fs from "node:fs";
import path from "node:path";
import type { CaseItem, SiteData } from "@/types";

/**
 * File-backed content store.
 *
 * The whole site is described by `data/site.json`, which the admin panel
 * mutates through server actions. Reads are cached per-process and
 * invalidated after every write.
 */

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "site.json");

let cache: SiteData | null = null;
let cachedMtime = 0;

export function getSiteData(): SiteData {
  // Re-read whenever the file changes on disk so an external edit (or another
  // worker process) is picked up immediately.
  const mtime = fs.statSync(DATA_FILE).mtimeMs;
  if (cache && mtime === cachedMtime) return cache;
  const raw = fs.readFileSync(DATA_FILE, "utf8");
  cache = JSON.parse(raw) as SiteData;
  cachedMtime = mtime;
  return cache;
}

export function saveSiteData(next: SiteData): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  cache = next;
  cachedMtime = fs.statSync(DATA_FILE).mtimeMs;
}

export function updateSiteData(mutator: (draft: SiteData) => void): SiteData {
  const next = structuredClone(getSiteData());
  mutator(next);
  saveSiteData(next);
  return next;
}

/* ----------------------------- Convenience ----------------------------- */

export function getCases(): CaseItem[] {
  return getSiteData().cases.items;
}

export function getCaseById(id: string): CaseItem | undefined {
  return getCases().find((c) => c.id === id);
}

export function getCaseIds(): string[] {
  return getCases().map((c) => c.id);
}

/* --------------------------- Deep set helper --------------------------- */

/** Immutably set a nested value by dot path, e.g. `setPath(obj, "home.hero.title", v)`. */
export function setPath(target: Record<string, unknown>, dotPath: string, value: unknown): void {
  const keys = dotPath.split(".");
  let cursor: Record<string, unknown> = target;
  for (let i = 0; i < keys.length - 1; i += 1) {
    const key = keys[i];
    const next = cursor[key];
    if (typeof next !== "object" || next === null) {
      cursor[key] = {};
    }
    cursor = cursor[key] as Record<string, unknown>;
  }
  cursor[keys[keys.length - 1]] = value;
}
