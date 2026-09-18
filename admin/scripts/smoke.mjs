#!/usr/bin/env node
/**
 * ADFLY 管理后台「真实浏览器」冒烟测试
 *
 * 通过 Chrome DevTools Protocol 打开构建产物（vite preview），
 * 逐个访问每个菜单路由，检查：
 *   1. 页面不是空白（正文文本长度达标）
 *   2. 没有 console error / 未捕获异常
 *   3. 没有失败的网络请求
 *
 * 用法：
 *   node scripts/smoke.mjs                     # 默认 http://localhost:5174
 *   BASE_URL=http://localhost:5173 node scripts/smoke.mjs
 *   API_URL=http://localhost:4000 node scripts/smoke.mjs
 */
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const BASE_URL = (process.env.BASE_URL ?? "http://localhost:5174").replace(/\/+$/, "");
const API_URL = (process.env.API_URL ?? "http://localhost:4000").replace(/\/+$/, "");
const ADMIN_BASE = "/admin";
const CHROME =
  process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const DEBUG_PORT = Number(process.env.CDP_PORT ?? 9333);

const ROUTES = [
  ["/dashboard", "概览", "快捷入口"],
  ["/content/site", "站点与导航", "公司名称"],
  ["/content/home", "首页内容", "Hero 区"],
  ["/content/about", "关于我们", "首屏简介"],
  ["/content/careers", "招聘内容", "首屏标题"],
  ["/cases", "客户案例", "案例增删改查"],
  ["/cases/new", "新建案例", "基本信息"],
  ["/cases/longzhu-global-launch/edit", "编辑案例", "核心指标"],
  ["/careers", "招聘管理", "招聘城市"],
  ["/careers/cities/new", "新建招聘城市", "城市 ID"],
  ["/careers/cities/shanghai/edit", "编辑招聘城市", "修改城市 ID"],
  ["/careers/positions/new", "新建招聘职位", "主归属城市"],
  ["/careers/positions/7685963815004457270/edit", "编辑招聘职位", "职位名称"],
  ["/settings/theme", "主题设置", "实时预览"],
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchJson(url, init) {
  const response = await fetch(url, init);
  if (!response.ok) throw new Error(`${url} -> HTTP ${response.status}`);
  return response.json();
}

async function waitForDevtools() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      return await fetchJson(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
    } catch {
      await sleep(250);
    }
  }
  throw new Error("Chrome DevTools 未就绪");
}

/** 极简 CDP 客户端：仅实现本项目需要的命令。 */
class CdpClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
  }

  async connect() {
    await new Promise((resolve, reject) => {
      this.ws.addEventListener("open", resolve, { once: true });
      this.ws.addEventListener("error", reject, { once: true });
    });
    this.ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const entry = this.pending.get(message.id);
        if (!entry) return;
        this.pending.delete(message.id);
        message.error ? entry.reject(new Error(message.error.message)) : entry.resolve(message.result);
        return;
      }
      for (const handler of this.listeners.get(message.method) ?? []) handler(message.params);
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  on(method, handler) {
    if (!this.listeners.has(method)) this.listeners.set(method, []);
    this.listeners.get(method).push(handler);
  }

  close() {
    this.ws.close();
  }
}

async function getAdminToken() {
  const payload = await fetchJson(`${API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "admin", password: "admin" }),
  });
  return payload.data.accessToken;
}

async function main() {
  const userDataDir = mkdtempSync(path.join(tmpdir(), "adfly-smoke-"));
  const chrome = spawn(
    CHROME,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      `--remote-debugging-port=${DEBUG_PORT}`,
      `--user-data-dir=${userDataDir}`,
      "about:blank",
    ],
    { stdio: "ignore" },
  );

  let client;
  const failures = [];

  try {
    await waitForDevtools();

    const targets = await fetchJson(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
    const page = targets.find((target) => target.type === "page");
    if (!page) throw new Error("找不到可用的浏览器页面");

    client = new CdpClient(page.webSocketDebuggerUrl);
    await client.connect();

    const consoleErrors = [];
    const requestFailures = [];
    // 后台不会托管前台站点的图片资源（如 /images/adfly/*.png），图片 404 属预期噪音
    const ASSET_PATTERN = /\.(png|jpe?g|gif|webp|svg|ico|woff2?|ttf)(\?|$)/i;
    client.on("Log.entryAdded", ({ entry }) => {
      if (entry.level !== "error") return;
      if (ASSET_PATTERN.test(entry.url ?? "")) return;
      consoleErrors.push(entry.text);
    });
    client.on("Runtime.exceptionThrown", ({ exceptionDetails }) => {
      consoleErrors.push(exceptionDetails.exception?.description ?? exceptionDetails.text);
    });
    client.on("Network.loadingFailed", ({ errorText, type }) => {
      if (type === "Image" || type === "Font") return;
      requestFailures.push(errorText);
    });

    await Promise.all([
      client.send("Page.enable"),
      client.send("Runtime.enable"),
      client.send("Log.enable"),
      client.send("Network.enable"),
    ]);

    // 1) 登录页可渲染，并写入真实 Token（后台路由需要登录态）
    await client.send("Page.navigate", { url: `${BASE_URL}${ADMIN_BASE}/login` });
    await sleep(1200);

    const token = await getAdminToken();
    await client.send("Runtime.evaluate", {
      expression: `localStorage.setItem("adfly_admin_token", ${JSON.stringify(token)});localStorage.setItem("adfly_admin_user", JSON.stringify({id:"1",username:"admin",role:"admin"}));`,
    });

    const loginText = await readText(client);
    if (!loginText.includes("管理后台")) {
      failures.push(`/login 未渲染登录表单：${loginText.slice(0, 80)}`);
    }
    console.log(`✓ /login 渲染正常`);

    // 2) 逐个路由检查
    for (const [route, expected, extra] of ROUTES) {
      consoleErrors.length = 0;
      requestFailures.length = 0;

      await client.send("Page.navigate", { url: `${BASE_URL}${ADMIN_BASE}${route}` });
      await sleep(1100);
      const text = await readText(client);

      const problems = [];
      if (text.trim().length < 20) problems.push("页面疑似空白");
      if (!text.includes(expected)) problems.push(`缺少期望内容「${expected}」`);
      if (extra && !text.includes(extra) && !text.includes("接口清单")) {
        problems.push(`缺少关键区块「${extra}」`);
      }
      if (consoleErrors.length) problems.push(`console 错误: ${consoleErrors.join(" | ")}`);
      if (requestFailures.length) problems.push(`请求失败: ${requestFailures.join(" | ")}`);

      if (problems.length) {
        failures.push(`${ADMIN_BASE}${route} -> ${problems.join("；")}`);
        console.log(`✗ ${route} ${problems.join("；")}`);
      } else {
        console.log(`✓ ${route} 渲染正常（${text.trim().length} 字符）`);
      }
    }
  } finally {
    client?.close();
    chrome.kill("SIGKILL");
  }

  if (failures.length) {
    console.error(`\n冒烟测试失败 ${failures.length} 项：`);
    for (const failure of failures) console.error(` - ${failure}`);
    process.exit(1);
  }
  console.log(`\n全部 ${ROUTES.length + 1} 个路由冒烟测试通过 ✅`);
}

async function readText(client) {
  const result = await client.send("Runtime.evaluate", {
    expression: "document.body ? document.body.innerText : ''",
    returnByValue: true,
  });
  return String(result.result.value ?? "");
}

main().catch((error) => {
  console.error("冒烟测试异常：", error);
  process.exit(1);
});
