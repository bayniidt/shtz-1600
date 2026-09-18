/**
 * 客户案例模块的数据类型（与后端 Zod / Mongoose Schema 对齐）。
 */

export const INDUSTRY_KEYS = ["ecommerce", "game", "app", "brand"] as const;
export type IndustryKey = (typeof INDUSTRY_KEYS)[number];
export const INDUSTRY_FILTER_KEYS = ["all", ...INDUSTRY_KEYS] as const;

export const INDUSTRY_LABELS: Record<IndustryKey, string> = {
  ecommerce: "电商",
  game: "游戏",
  app: "APP",
  brand: "品牌",
};

export const INDUSTRY_OPTIONS: { label: string; value: IndustryKey }[] = [
  { label: INDUSTRY_LABELS.ecommerce, value: "ecommerce" },
  { label: INDUSTRY_LABELS.game, value: "game" },
  { label: INDUSTRY_LABELS.app, value: "app" },
  { label: INDUSTRY_LABELS.brand, value: "brand" },
];

export interface CaseStat {
  value: string;
  unit?: string;
  label: string;
}

export interface CaseBlock {
  key: string;
  title: string;
  body: string[];
  points?: string[];
}

/** 客户案例（业务主键 id，创建后不可修改） */
export interface CaseItem {
  id: string;
  title: string;
  client: string;
  industry: IndustryKey;
  region: string;
  summary: string;
  cover: string;
  awards: string[];
  tags: string[];
  year: string;
  featured: boolean;
  stats: CaseStat[];
  blocks: CaseBlock[];
  createdAt?: string;
  updatedAt?: string;
}

/** 案例列表页文案（单文档） */
export interface CasesPageContent {
  title: string;
  subtitle: string;
  filters: { key: IndustryKey | "all"; label: string }[];
  updatedAt?: string;
}

export interface CaseListResult {
  items: CaseItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CaseListQuery {
  page?: number;
  pageSize?: number;
  industry?: string;
  featured?: string;
  keyword?: string;
}

export function emptyCaseItem(): CaseItem {
  return {
    id: "",
    title: "",
    client: "",
    industry: "ecommerce",
    region: "",
    summary: "",
    cover: "",
    awards: [],
    tags: [],
    year: "",
    featured: false,
    stats: [],
    blocks: [],
  };
}
