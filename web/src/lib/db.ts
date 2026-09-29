import fs from "node:fs";
import path from "node:path";
import { cache as reactCache } from "react";
import type {
  AboutContent,
  CareersContent,
  CareersCity,
  CareersPosition,
  CaseItem,
  CasesPageContent,
  HomeContent,
  SiteConfig,
  SiteData,
} from "@/types";
import type { Locale } from "@/lib/i18n";

/**
 * File-backed content store.
 *
 * The whole site is described by `data/site.json`, which the admin panel
 * mutates through server actions. Reads are cached per-process and
 * invalidated after every write.
 */

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "site.json");
const ENGLISH_DATA_FILE = path.join(DATA_DIR, "site.en.json");
const API_BASE_URL = (
  process.env.ADMIN_API_URL ?? process.env.NEXT_PUBLIC_ADMIN_API_URL ?? "http://localhost:4000/api/v1"
).replace(/\/$/, "");
const API_TIMEOUT_MS = 3000;

let fileCache: SiteData | null = null;
let cachedMtime = 0;

export function getSiteData(): SiteData {
  // Re-read whenever the file changes on disk so an external edit (or another
  // worker process) is picked up immediately.
  const mtime = fs.statSync(DATA_FILE).mtimeMs;
  if (fileCache && mtime === cachedMtime) return fileCache;
  const raw = fs.readFileSync(DATA_FILE, "utf8");
  fileCache = JSON.parse(raw) as SiteData;
  cachedMtime = mtime;
  return fileCache;
}

type DeepPartial<T> = T extends (infer Item)[]
  ? Item[]
  : T extends object
    ? { [Key in keyof T]?: DeepPartial<T[Key]> }
    : T;

function mergeLocalized<T>(base: T, override: DeepPartial<T> | undefined): T {
  if (override === undefined || override === null) return base;
  if (Array.isArray(override)) return override as T;
  if (typeof override !== "object") return override as T;
  if (typeof base !== "object" || base === null || Array.isArray(base)) {
    return override as T;
  }

  const merged: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(override)) {
    merged[key] = mergeLocalized(
      (base as Record<string, unknown>)[key],
      value as DeepPartial<unknown>,
    );
  }
  return merged as T;
}

function getEnglishData(): DeepPartial<SiteData> {
  if (!fs.existsSync(ENGLISH_DATA_FILE)) return {};
  return JSON.parse(fs.readFileSync(ENGLISH_DATA_FILE, "utf8")) as DeepPartial<SiteData>;
}

interface ApiEnvelope<T> {
  code: number;
  message: string;
  data: T;
}

interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

async function fetchApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`Admin API ${response.status}: ${endpoint}`);
  const body = (await response.json()) as ApiEnvelope<T>;
  if (body.code !== 0) throw new Error(`Admin API ${body.code}: ${body.message}`);
  return body.data;
}

async function fetchAllPages<T>(endpoint: string): Promise<T[]> {
  const pageSize = 100;
  const items: T[] = [];
  let page = 1;
  let total = 0;

  do {
    const result = await fetchApi<PagedResult<T>>(`${endpoint}?page=${page}&pageSize=${pageSize}`);
    items.push(...result.items);
    total = result.total;
    page += 1;
    if (result.items.length === 0) break;
  } while (items.length < total);

  return items.slice(0, total || items.length);
}

/**
 * Read the live content API first and fall back to the checked-in JSON snapshot.
 * This is intentionally server-only: public pages stay dynamic while an offline
 * or not-yet-seeded API never makes the site unavailable.
 */
async function loadSiteDataFromAPI(): Promise<SiteData> {
  try {
    const [site, home, about, careersContent, casesPage, cases, cities, positions] = await Promise.all([
      fetchApi<SiteConfig>("/site"),
      fetchApi<HomeContent>("/home"),
      fetchApi<AboutContent>("/about"),
      fetchApi<Omit<CareersContent, "cities" | "positions">>("/careers/content"),
      fetchApi<CasesPageContent>("/cases/page"),
      fetchAllPages<CaseItem>("/cases"),
      fetchAllPages<CareersCity>("/careers/cities"),
      fetchAllPages<CareersPosition>("/careers/positions"),
    ]);

    return {
      site,
      home,
      about,
      cases: { page: casesPage, items: cases },
      careers: { ...careersContent, cities, positions },
    };
  } catch (error) {
    console.warn("[web] Admin API unavailable, using data/site.json fallback:", error instanceof Error ? error.message : error);
    return getSiteData();
  }
}

/** Deduplicate the eight API reads when metadata, layouts, and pages render together. */
export const getSiteDataFromAPI = reactCache(async (): Promise<SiteData> => {
  // GitHub Pages has no server runtime. During a static export, render from
  // the checked-in snapshot and keep the API-backed behavior elsewhere.
  if (process.env.STATIC_EXPORT === "true") return getSiteData();
  return loadSiteDataFromAPI();
});

/** Resolve localized content while keeping the API-backed Chinese content as the source of truth. */
export async function getLocalizedSiteData(locale: Locale): Promise<SiteData> {
  const data = await getSiteDataFromAPI();
  if (locale === "zh") return data;
  return mergeLocalized(data, getEnglishData());
}

export function saveSiteData(next: SiteData): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  fileCache = next;
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
