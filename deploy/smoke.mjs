#!/usr/bin/env node

const baseUrl = (process.env.BASE_URL ?? "http://localhost:18080").replace(/\/$/, "");
const username = process.env.ADMIN_USERNAME ?? "admin";
const password = process.env.ADMIN_PASSWORD ?? "admin";

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { "content-type": "application/json", ...(options.headers ?? {}) },
  });
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { response, body };
}

function assertStatus(label, result, expected) {
  if (result.response.status !== expected) {
    throw new Error(`${label} 期望 ${expected}，实际 ${result.response.status}`);
  }
}

try {
  const publicChecks = [
    ["管理后台", "/admin/"],
    ["Web 首页", "/"],
    ["API 健康检查", "/api/v1/health"],
  ];
  for (const [label, path] of publicChecks) {
    const result = await request(path);
    assertStatus(label, result, 200);
    console.log(`✓ ${label}`);
  }

  const login = await request("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  assertStatus("管理员登录", login, 200);
  const token = login.body?.data?.accessToken;
  if (!token) throw new Error("管理员登录响应缺少 accessToken");
  console.log("✓ 管理员登录");

  const me = await request("/api/v1/auth/me", {
    headers: { authorization: `Bearer ${token}` },
  });
  assertStatus("当前管理员信息", me, 200);
  console.log("✓ 当前管理员信息");

  const unauthorizedWrite = await request("/api/v1/settings/theme", {
    method: "PUT",
    body: JSON.stringify({}),
  });
  if (![401, 403].includes(unauthorizedWrite.response.status)) {
    throw new Error(`未授权写入防护期望 401/403，实际 ${unauthorizedWrite.response.status}`);
  }
  console.log("✓ 未授权写入防护");

  console.log(`Stage8 发布冒烟通过：${baseUrl}`);
} catch (error) {
  console.error(`Stage8 发布冒烟失败：${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
}
