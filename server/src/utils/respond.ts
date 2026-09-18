import type { Response } from "express";

import { ErrorCode } from "@/utils/ApiError";

export interface ApiEnvelope<T> {
  code: number;
  message: string;
  data: T;
}

export function sendOk<T>(
  res: Response,
  data: T,
  options: { status?: number; message?: string } = {},
): Response<ApiEnvelope<T>> {
  const status = options.status ?? 200;
  return res.status(status).json({
    code: ErrorCode.OK,
    message: options.message ?? "ok",
    data,
  });
}

export function sendCreated<T>(res: Response, data: T, message = "created"): Response {
  return sendOk(res, data, { status: 201, message });
}

export function sendNoContent(res: Response): Response {
  return res.status(204).send();
}
