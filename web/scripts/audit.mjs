#!/usr/bin/env node
/**
 * Responsive / console audit (CDP).
 *
 * Usage: node scripts/audit.mjs <baseUrl> [path,path,...]
 *
 * For every path × breakpoint it reports:
 *   - horizontal overflow (documentElement.scrollWidth > innerWidth)
 *   - elements that stick out past the right/left edge
 *   - console errors and failed requests
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const CHROME =
  process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const WIDTHS = [1440, 1024, 768, 390];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.consoleErrors = [];
    this.failedRequests = [];
    ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
        return;
      }
      if (msg.method === "Log.entryAdded" && msg.params.entry.level === "error") {
        this.consoleErrors.push(msg.params.entry.text.slice(0, 200));
      }
      if (msg.method === "Network.loadingFailed") {
        this.failedRequests.push(msg.params.errorText);
      }
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }
  async evaluate(expression) {
    const r = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
    return r.result.value;
  }
}

const OVERFLOW_PROBE = `(() => {
  const vw = document.documentElement.clientWidth;
  const bad = [];
  for (const el of document.querySelectorAll('body *')) {
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || s.position === 'fixed') continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.right > vw + 1.5) {
      // Decorative layers clipped by an ancestor (marquee tracks, glow blobs)
      // do not create a scrollbar — only flag genuinely unclipped elements.
      let clipped = false;
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        const ps = getComputedStyle(p);
        if (ps.overflowX === 'hidden' || ps.overflowX === 'clip') { clipped = true; break; }
      }
      if (clipped) continue;
      bad.push({
        tag: el.tagName.toLowerCase(),
        cls: (typeof el.className === 'string' ? el.className : '').slice(0, 90),
        left: Math.round(r.left),
        right: Math.round(r.right),
        w: Math.round(r.width),
      });
    }
  }
  return {
    vw,
    scrollW: document.documentElement.scrollWidth,
    bodyScrollW: document.body.scrollWidth,
    bad: bad.slice(0, 8),
    badCount: bad.length,
    docHeight: document.documentElement.scrollHeight,
    sections: document.querySelectorAll('section').length,
    h1: [...document.querySelectorAll('h1')].map(h => h.textContent.trim().slice(0, 60)),
  };
})()`;

const [baseUrl, pathsArg, ...flags] = process.argv.slice(2);
const cookieFlag = flags.find((f) => f.startsWith("--cookie="));
const paths = (pathsArg ?? "/")
  .split(",")
  .map((p) => p.trim())
  .filter(Boolean);

const port = 9500 + Math.floor(Math.random() * 300);
const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "audit-profile-"));
const proc = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--hide-scrollbars",
    "--disable-gpu",
    "about:blank",
  ],
  { stdio: "ignore" },
);

let target;
for (let i = 0; i < 100; i++) {
  try {
    const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    target = list.find((t) => t.type === "page");
    if (target?.webSocketDebuggerUrl) break;
  } catch {}
  await sleep(200);
}

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((res) => ws.addEventListener("open", res));
const cdp = new CDP(ws);
await cdp.send("Page.enable");
await cdp.send("Log.enable");
await cdp.send("Network.enable");

if (cookieFlag) {
  const [name, value] = cookieFlag.replace("--cookie=", "").split("=");
  await cdp.send("Network.setCookie", {
    name,
    value,
    domain: new URL(baseUrl).hostname,
    path: "/",
  });
}

let problems = 0;
for (const p of paths) {
  for (const width of WIDTHS) {
    cdp.consoleErrors = [];
    cdp.failedRequests = [];
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width,
      height: 900,
      deviceScaleFactor: 1,
      mobile: width < 600,
    });
    await cdp.send("Page.navigate", { url: baseUrl + p });
    await sleep(2200);
    const r = await cdp.evaluate(OVERFLOW_PROBE);
    const overflow = r.scrollW > r.vw + 1 || r.bodyScrollW > r.vw + 1;
    const ok = !overflow && r.badCount === 0 && cdp.consoleErrors.length === 0;
    if (!ok) problems += 1;
    console.log(
      `${ok ? "OK  " : "FAIL"} ${p.padEnd(24)} ${String(width).padStart(4)}  scrollW=${r.scrollW} vw=${r.vw} ` +
        `sections=${r.sections} h=${r.docHeight} overflowing=${r.badCount}` +
        (cdp.consoleErrors.length ? ` consoleErrors=${cdp.consoleErrors.length}` : ""),
    );
    if (r.badCount) console.log("      offenders:", JSON.stringify(r.bad.slice(0, 4)));
    if (cdp.consoleErrors.length)
      console.log("      console:", cdp.consoleErrors.slice(0, 3).join(" | "));
    if (r.h1.length !== 1) console.log("      h1 count:", r.h1.length, JSON.stringify(r.h1));
  }
}

console.log(problems === 0 ? "\nALL PAGES OK" : `\n${problems} combination(s) with issues`);
ws.close();
proc.kill();
