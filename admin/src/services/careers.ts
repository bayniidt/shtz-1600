import { apiDelete, apiGet, apiPost, apiPut } from "@/services/request";
import type {
  CareerCity,
  CareerCityListResult,
  CareerCityQuery,
  CareerPosition,
  CareerPositionListResult,
  CareerPositionQuery,
} from "@/types/careers";

export function fetchCareerCities(params: CareerCityQuery = {}): Promise<CareerCityListResult> {
  return apiGet<CareerCityListResult>("/careers/cities", { params });
}

export function fetchCareerCity(id: string): Promise<CareerCity> {
  return apiGet<CareerCity>(`/careers/cities/${id}`);
}

export function createCareerCity(payload: CareerCity): Promise<CareerCity> {
  return apiPost<CareerCity>("/careers/cities", payload);
}

export function updateCareerCity(id: string, payload: CareerCity): Promise<CareerCity> {
  return apiPut<CareerCity>(`/careers/cities/${id}`, payload);
}

export function deleteCareerCity(id: string, fallbackCityId?: string): Promise<{ id: string; success: boolean }> {
  return apiDelete<{ id: string; success: boolean }>(`/careers/cities/${id}`, {
    data: fallbackCityId ? { fallbackCityId } : {},
  });
}

export function fetchCareerPositions(params: CareerPositionQuery = {}): Promise<CareerPositionListResult> {
  return apiGet<CareerPositionListResult>("/careers/positions", { params });
}

export function fetchCareerPosition(id: string): Promise<CareerPosition> {
  return apiGet<CareerPosition>(`/careers/positions/${id}`);
}

export function createCareerPosition(payload: CareerPosition): Promise<CareerPosition> {
  return apiPost<CareerPosition>("/careers/positions", payload);
}

export function updateCareerPosition(id: string, payload: CareerPosition): Promise<CareerPosition> {
  return apiPut<CareerPosition>(`/careers/positions/${id}`, payload);
}

export function deleteCareerPosition(id: string): Promise<{ id: string; success: boolean }> {
  return apiDelete<{ id: string; success: boolean }>(`/careers/positions/${id}`);
}
