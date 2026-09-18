import crypto from "node:crypto";

import jwt, { type SignOptions } from "jsonwebtoken";

import { config } from "@/config";
import { ApiError } from "@/utils/ApiError";
import type { AuthUser } from "@/types/auth";

export interface TokenPayload extends AuthUser {
  jti: string;
  iat?: number;
  exp?: number;
}

export function signToken(user: AuthUser, expiresIn?: string | number): string {
  const options: SignOptions = {
    expiresIn: (expiresIn ?? config.jwtExpiresIn) as SignOptions["expiresIn"],
    jwtid: crypto.randomUUID(),
  };
  return jwt.sign({ sub: user.id, username: user.username, role: user.role }, config.jwtSecret, options);
}

export function verifyToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as jwt.JwtPayload;
    return {
      id: String(decoded.sub ?? ""),
      username: String(decoded.username ?? ""),
      role: String(decoded.role ?? "admin"),
      jti: String(decoded.jti ?? ""),
      iat: decoded.iat,
      exp: decoded.exp,
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw ApiError.unauthorized("Token 已过期");
    }
    throw ApiError.unauthorized("登录凭证无效");
  }
}

/* --------------------------- 登出黑名单（内存） --------------------------- */

interface RevokedEntry {
  exp: number;
}

const revoked = new Map<string, RevokedEntry>();

export function revokeToken(jti: string, exp?: number): void {
  if (!jti) return;
  revoked.set(jti, { exp: exp ?? Math.floor(Date.now() / 1000) + 43200 });
}

export function isRevoked(jti: string): boolean {
  const entry = revoked.get(jti);
  if (!entry) return false;
  if (entry.exp * 1000 < Date.now()) {
    revoked.delete(jti);
    return false;
  }
  return true;
}

export function clearRevokedTokens(): void {
  revoked.clear();
}
