import axios, { AxiosError, type AxiosRequestConfig } from "axios";

import { feedback } from "@/utils/feedback";
import { clearSession, getToken } from "@/utils/token";

export interface ApiEnvelope<T> {
  code: number;
  message: string;
  data: T;
}

export interface FieldError {
  path: string;
  message: string;
}

/** 统一错误对象：携带后端 `code`、`errors`，方便表单展示字段级错误。 */
export class ApiRequestError extends Error {
  readonly code: number;
  readonly status?: number;
  readonly errors?: FieldError[];

  constructor(message: string, code: number, status?: number, errors?: FieldError[]) {
    super(message);
    this.name = "ApiRequestError";
    this.code = code;
    this.status = status;
    this.errors = errors;
  }
}

const baseURL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

export const http = axios.create({
  baseURL,
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ code?: number; message?: string; errors?: FieldError[] }>) => {
    const status = error.response?.status;
    const body = error.response?.data;
    const code = body?.code ?? 5000;
    const message = body?.message ?? error.message ?? "网络异常，请稍后重试";

    if (status === 401) {
      clearSession();
      if (!window.location.pathname.endsWith("/login")) {
        feedback.error("登录已失效，请重新登录");
        window.location.href = `${import.meta.env.BASE_URL}login`;
      }
    }

    return Promise.reject(new ApiRequestError(message, code, status, body?.errors));
  },
);

export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await http.get<ApiEnvelope<T>>(url, config);
  return response.data.data;
}

export async function apiPost<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await http.post<ApiEnvelope<T>>(url, body, config);
  return response.data.data;
}

export async function apiPut<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await http.put<ApiEnvelope<T>>(url, body, config);
  return response.data.data;
}

export async function apiDelete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await http.delete<ApiEnvelope<T>>(url, config);
  return response.data.data;
}
