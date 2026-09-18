import mongoose from "mongoose";
import request from "supertest";
import type { Express } from "express";

import { connectDB, disconnectDB, dropDatabase } from "@/config/db";
import { User, hashPassword } from "@/models/User.model";
import { seedContentFromSiteData, type SeedContentOptions } from "@/services/seed.service";
import type { SeedContentCounts } from "@/types/site-data";
import { SITE_DATA_FIXTURE } from "../fixtures/site-data";

export const ADMIN_USERNAME = "admin";
export const ADMIN_PASSWORD = "admin";

/** 连接测试库并写入一个已知密码的管理员。 */
export async function setupTestDB(): Promise<void> {
  await connectDB();
  await resetTestDB();
}

/** 清空所有集合，并重建默认管理员。 */
export async function resetTestDB(): Promise<void> {
  const collections = await mongoose.connection.db!.collections();
  await Promise.all(collections.map((collection) => collection.deleteMany({})));

  const passwordHash = await hashPassword(ADMIN_PASSWORD);
  await User.create({ username: ADMIN_USERNAME, passwordHash, role: "admin" });
}

export async function teardownTestDB(): Promise<void> {
  await dropDatabase();
  await disconnectDB();
}

/** 用夹具灌入内容数据（用于内容模块接口测试）。 */
export async function seedFixtureContent(
  options: SeedContentOptions = {},
): Promise<SeedContentCounts> {
  return seedContentFromSiteData(SITE_DATA_FIXTURE, options);
}

/** 登录并返回 Bearer Token。 */
export async function loginAsAdmin(app: Express): Promise<string> {
  const res = await request(app)
    .post("/api/v1/auth/login")
    .send({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
  return res.body.data.accessToken as string;
}

/** 构造鉴权请求头。 */
export function bearer(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}
