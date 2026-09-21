#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

function loadEnvFile(filePath) {
  if (!filePath) return { ...process.env };

  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`找不到环境变量文件：${resolved}`);
  }

  const values = { ...process.env };
  for (const line of fs.readFileSync(resolved, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values[match[1]] = value;
  }
  return values;
}

function validate(values) {
  const errors = [];
  const jwtSecret = values.JWT_SECRET ?? "";
  const passwordHash = values.ADMIN_PASSWORD_HASH ?? "";
  const corsOrigin = values.CORS_ORIGIN ?? "";

  if (
    jwtSecret.length < 32 ||
    /dev-only-insecure|replace-with|change-me|your[-_]?secret/i.test(jwtSecret)
  ) {
    errors.push("JWT_SECRET 必须是至少 32 个字符的非占位随机值");
  }

  if (!/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(passwordHash)) {
    errors.push("ADMIN_PASSWORD_HASH 必须是有效的 bcrypt hash");
  }

  const origins = corsOrigin
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  if (origins.length === 0 || corsOrigin === "*") {
    errors.push("CORS_ORIGIN 必须配置明确的 http(s) 来源，不能使用 *");
  } else {
    for (const origin of origins) {
      try {
        const parsed = new URL(origin);
        if (!/^https?:$/.test(parsed.protocol) || !parsed.hostname || parsed.pathname !== "/") {
          errors.push(`CORS_ORIGIN 来源无效：${origin}`);
        }
      } catch {
        errors.push(`CORS_ORIGIN 来源无效：${origin}`);
      }
    }
  }

  if (values.ADMIN_PASSWORD) {
    errors.push("生产环境不要配置明文 ADMIN_PASSWORD，请使用 ADMIN_PASSWORD_HASH");
  }

  return errors;
}

try {
  const filePath = process.argv[2];
  const errors = validate(loadEnvFile(filePath));
  if (errors.length > 0) {
    console.error("生产环境变量检查失败：");
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
  } else {
    console.log("生产环境变量检查通过：JWT、管理员密码 hash、CORS 均已配置");
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
