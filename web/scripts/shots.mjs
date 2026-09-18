#!/usr/bin/env node
/**
 * Screenshot helper (CDP).
 *
 * Usage: node scripts/shots.mjs <outDir> <width> <height> <url> [--full|--view] [--cookie name=value]
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const CHROME =
  process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      }
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }
}

const [outDir, width, height, url, mode = "--full", ...rest] = process.argv.slice(2);
const cookieArg = rest.find((a) => a.startsWith("--cookie="));

const port = 9400 + Math.floor(Math.random() * 300);
const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "shots-profile-"));
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
    "--mute-audio",
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
await cdp.send("Emulation.setDeviceMetricsOverride", {
  width: Number(width),
  height: Number(height),
  deviceScaleFactor: 1,
  mobile: Number(width) < 600,
});

if (cookieArg) {
  const [name, value] = cookieArg.replace("--cookie=", "").split("=");
  const { hostname } = new URL(url);
  await cdp.send("Network.enable");
  await cdp.send("Network.setCookie", { name, value, domain: hostname, path: "/" });
}

await cdp.send("Page.navigate", { url });
await sleep(3500);

const metrics = await cdp.send("Page.getLayoutMetrics");
const content = metrics.cssContentSize ?? metrics.contentSize;
const clip =
  mode === "--full"
    ? { x: 0, y: 0, width: Number(width), height: Math.min(content.height, 12000), scale: 1 }
    : { x: 0, y: 0, width: Number(width), height: Number(height), scale: 1 };

const shot = await cdp.send("Page.captureScreenshot", {
  format: "png",
  captureBeyondViewport: mode === "--full",
  clip,
});

fs.mkdirSync(outDir, { recursive: true });
const file = path.join(outDir, `${url.replace(/^https?:\/\//, "").replace(/[^\w.-]+/g, "_")}-${width}.png`);
fs.writeFileSync(file, Buffer.from(shot.data, "base64"));
console.log(file, `${clip.width}x${Math.round(clip.height)}`);

ws.close();
proc.kill();
