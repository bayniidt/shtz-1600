/** 招聘城市 / 职位数据类型（与 server careers CRUD 对齐）。 */

export interface CareerCity {
  id: string;
  name: string;
  nameEn: string;
  code: string;
  summary: string;
  featured: boolean | string;
  positionsCount?: number;
  positions?: CareerPosition[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CareerPosition {
  id: string;
  title: string;
  cityId: string;
  extraCities: string;
  type: string;
  department: string;
  tags: string;
  urgent: boolean | string;
  hot: boolean | string;
  publishedAt: string;
  summary: string;
  description: string;
  requirement: string;
  bonus: string;
  applyUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CareerCityListResult {
  items: CareerCity[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CareerPositionListResult {
  items: CareerPosition[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CareerCityQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  featured?: string;
}

export interface CareerPositionQuery {
  page?: number;
  pageSize?: number;
  cityId?: string;
  keyword?: string;
  hot?: string;
  urgent?: string;
}

export function emptyCareerCity(): CareerCity {
  return { id: "", name: "", nameEn: "", code: "", summary: "", featured: false };
}

export function emptyCareerPosition(): CareerPosition {
  return {
    id: "",
    title: "",
    cityId: "",
    extraCities: "",
    type: "全职",
    department: "",
    tags: "",
    urgent: false,
    hot: false,
    publishedAt: "",
    summary: "",
    description: "",
    requirement: "",
    bonus: "",
    applyUrl: "",
  };
}

export function flagValue(value: boolean | string): boolean {
  return value === true || value === "yes" || value === "true" || value === "1";
}

export function splitCityIds(value: string): string[] {
  return [...new Set(value.split(/[\/,\n]+/).map((item) => item.trim()).filter(Boolean))];
}
