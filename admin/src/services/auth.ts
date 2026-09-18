import { apiGet, apiPost } from "@/services/request";
import type { AdminUser } from "@/utils/token";

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  tokenType: string;
  expiresIn: string;
  user: AdminUser;
}

export function login(payload: LoginPayload): Promise<LoginResult> {
  return apiPost<LoginResult>("/auth/login", payload);
}

export function fetchMe(): Promise<{ user: AdminUser }> {
  return apiGet<{ user: AdminUser }>("/auth/me");
}

export function logout(): Promise<{ success: boolean }> {
  return apiPost<{ success: boolean }>("/auth/logout");
}
