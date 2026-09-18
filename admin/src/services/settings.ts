import type { ThemePatch } from "@/config/theme";
import { apiGet, apiPost, apiPut } from "@/services/request";

export function fetchTheme(): Promise<ThemePatch> {
  return apiGet<ThemePatch>("/settings/theme");
}

export function updateTheme(patch: ThemePatch): Promise<ThemePatch> {
  return apiPut<ThemePatch>("/settings/theme", patch);
}

export function resetTheme(): Promise<ThemePatch> {
  return apiPost<ThemePatch>("/settings/theme/reset");
}
