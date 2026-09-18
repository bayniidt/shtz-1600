import { apiDelete, apiGet, apiPost, apiPut } from "@/services/request";
import type {
  CaseItem,
  CaseListQuery,
  CaseListResult,
  CasesPageContent,
} from "@/types/cases";

/* ------------------------------ 案例列表页文案 ------------------------------ */

export function fetchCasesPage(): Promise<CasesPageContent> {
  return apiGet<CasesPageContent>("/cases/page");
}

export function saveCasesPage(payload: CasesPageContent): Promise<CasesPageContent> {
  return apiPut<CasesPageContent>("/cases/page", payload);
}

/* --------------------------------- 案例 CRUD --------------------------------- */

/** 案例列表（分页 / 行业筛选 / 置顶筛选 / 关键词搜索） */
export function fetchCases(params: CaseListQuery = {}): Promise<CaseListResult> {
  return apiGet<CaseListResult>("/cases", { params });
}

export function fetchCase(id: string): Promise<CaseItem> {
  return apiGet<CaseItem>(`/cases/${id}`);
}

export function createCase(payload: CaseItem): Promise<CaseItem> {
  return apiPost<CaseItem>("/cases", payload);
}

export function updateCase(id: string, payload: CaseItem): Promise<CaseItem> {
  return apiPut<CaseItem>(`/cases/${id}`, payload);
}

export function deleteCase(id: string): Promise<{ id: string; success: boolean }> {
  return apiDelete<{ id: string; success: boolean }>(`/cases/${id}`);
}

export function toggleCaseFeatured(id: string, featured: boolean): Promise<CaseItem> {
  return apiPost<CaseItem>(`/cases/${id}/featured`, { featured });
}
