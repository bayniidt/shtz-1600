/**
 * `data/site.json` 的形状声明。
 *
 * 这里刻意使用宽松类型：seed 时只做「顶层字段挑选」，
 * 具体子结构交给 Mongoose Schema（strict 模式）裁剪，
 * 这样 site.json 新增字段不会导致 seed 失败。
 */
export interface SiteDataInput {
  site?: Record<string, unknown>;
  home?: Record<string, unknown>;
  cases?: {
    page?: Record<string, unknown>;
    items?: Record<string, unknown>[];
  };
  about?: Record<string, unknown>;
  careers?: Record<string, unknown> & {
    cities?: Record<string, unknown>[];
    positions?: Record<string, unknown>[];
  };
}

export interface SeedContentCounts {
  site: number;
  home: number;
  casesPage: number;
  caseItems: number;
  about: number;
  careersContent: number;
  cities: number;
  positions: number;
}
