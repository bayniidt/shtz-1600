import type { Request, Response } from "express";

import { User } from "@/models/User.model";
import type { LoginInput } from "@/validations/auth.validation";
import { ApiError } from "@/utils/ApiError";
import { extractToken } from "@/middlewares/auth";
import { revokeToken, signToken, verifyToken } from "@/utils/jwt";
import { sendOk } from "@/utils/respond";
import { config } from "@/config";

function publicUser(user: {
  _id?: unknown;
  id?: string;
  username: string;
  role: string;
  lastLoginAt?: Date | null;
}) {
  return {
    id: String(user.id ?? user._id ?? ""),
    username: user.username,
    role: user.role,
    lastLoginAt: user.lastLoginAt ?? null,
  };
}

/** POST /auth/login —— 账号密码登录，返回 JWT + 用户信息。 */
export async function login(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body as LoginInput;

  const user = await User.findOne({ username });
  // 用户不存在与密码错误返回同一提示，避免账号枚举
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized("用户名或密码错误");
  }

  user.lastLoginAt = new Date();
  await user.save();

  const tokenUser = { id: String(user._id), username: user.username, role: user.role };
  const accessToken = signToken(tokenUser);

  sendOk(res, {
    accessToken,
    tokenType: "Bearer",
    expiresIn: config.jwtExpiresIn,
    user: publicUser(user),
  });
}

/** GET /auth/me —— 返回当前登录用户信息。 */
export async function me(req: Request, res: Response): Promise<void> {
  const current = req.user;
  if (!current) throw ApiError.unauthorized("未登录，请先登录");

  const user = await User.findById(current.id);
  if (!user) throw ApiError.unauthorized("账号不存在或已被删除");

  sendOk(res, { user: publicUser(user) });
}

/** POST /auth/logout —— 将当前 Token 加入黑名单（无状态 JWT 的补偿方案）。 */
export async function logout(req: Request, res: Response): Promise<void> {
  const token = extractToken(req);
  if (token) {
    try {
      const payload = verifyToken(token);
      revokeToken(payload.jti, payload.exp);
    } catch {
      // Token 已失效，直接视为登出成功
    }
  }
  sendOk(res, { success: true }, { message: "已退出登录" });
}
