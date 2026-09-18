import type { NextFunction, Request, Response } from "express";

import { ApiError } from "@/utils/ApiError";
import { isRevoked, verifyToken } from "@/utils/jwt";

/** 从 `Authorization: Bearer <token>` 解析 Token。 */
export function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    const token = header.slice(7).trim();
    return token.length > 0 ? token : null;
  }
  const cookieToken = (req as Request & { cookies?: Record<string, string> }).cookies?.access_token;
  return cookieToken ?? null;
}

/** JWT 校验中间件：通过后写入 `req.user`，否则 401 / code=4010。 */
export function protect(req: Request, _res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (!token) {
    next(ApiError.unauthorized("未登录，请先登录"));
    return;
  }

  try {
    const payload = verifyToken(token);
    if (isRevoked(payload.jti)) {
      next(ApiError.unauthorized("登录凭证已失效，请重新登录"));
      return;
    }
    req.user = { id: payload.id, username: payload.username, role: payload.role };
    next();
  } catch (error) {
    next(error);
  }
}

/** 角色限制中间件（预留 editor 等扩展）。 */
export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(ApiError.unauthorized("未登录，请先登录"));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(ApiError.forbidden());
      return;
    }
    next();
  };
}
