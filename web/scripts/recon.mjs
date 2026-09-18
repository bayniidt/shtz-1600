#!/usr/bin/env node
/**
 * CDP-based website reconnaissance.
 *
 * Usage:
 *   node scripts/recon.mjs <url> <outDir> [width] [height]
 *
 * Produces in <outDir>:
 *   page.html            rendered DOM (post-JS)
 *   page.png             full-page screenshot
 *   sections.json        structural section outline w/ computed styles
 *   styles.json          colors / fonts / radii / shadows / spacing census
 *   assets.json          stylesheets, scripts, images, fonts, media
 *   behaviors.json       detected animation libs + scroll/observer behavior probe
 *
 * Requires only Node >= 22 (global WebSocket + fetch) and a local Chrome.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const CHROME =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.events = [];
    ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      } else if (msg.method) {
        this.events.push(msg);
      }
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`timeout: ${method}`));
        }
      }, 60_000);
    });
  }
  async eval(expression) {
    const r = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: true,
    });
    if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
    return r.result.value;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function launch(port) {
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "recon-profile-"));
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
    { stdio: "ignore", detached: false },
  );
  let target;
  for (let i = 0; i < 100; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      const list = await res.json();
      target = list.find((t) => t.type === "page");
      if (target?.webSocketDebuggerUrl) break;
    } catch {}
    await sleep(200);
  }
  if (!target) throw new Error("chrome did not start");
  return { proc, target, userDataDir };
}

const PROBE = `(() => {
  const px = (v) => v;
  const vis = (el) => {
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 1 && r.height > 1;
  };
  const sig = (el) => {
    const s = getComputedStyle(el);
    return {
      tag: el.tagName.toLowerCase(),
      cls: (el.className && typeof el.className === 'string' ? el.className : '').slice(0, 300),
      id: el.id || undefined,
      rect: (() => { const r = el.getBoundingClientRect(); const sy = window.scrollY; return {
        x: Math.round(r.x), y: Math.round(r.y + sy), w: Math.round(r.width), h: Math.round(r.height) }; })(),
      bg: s.backgroundColor,
      bgImage: s.backgroundImage === 'none' ? undefined : s.backgroundImage.slice(0, 200),
      color: s.color,
      font: s.fontFamily,
      size: s.fontSize,
      weight: s.fontWeight,
      lh: s.lineHeight,
      ls: s.letterSpacing,
      radius: s.borderRadius,
      shadow: s.boxShadow === 'none' ? undefined : s.boxShadow.slice(0, 160),
      display: s.display,
      position: s.position,
      transition: s.transition === 'all 0s ease 0s' ? undefined : s.transition.slice(0, 200),
      transform: s.transform === 'none' ? undefined : s.transform,
      opacity: s.opacity,
      zIndex: s.zIndex === 'auto' ? undefined : s.zIndex,
      text: [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).filter(Boolean).join(' ').slice(0, 200) || undefined,
    };
  };
  const depth = (el, max) => {
    const out = [];
    for (const c of el.children) {
      if (!vis(c)) continue;
      const o = sig(c);
      if (max > 0) { const kids = depth(c, max - 1); if (kids.length) o.children = kids; }
      out.push(o);
    }
    return out;
  };
  const root = document.querySelector('main') || document.body;
  const sections = [...root.children].filter(vis).map((s) => ({ ...sig(s), children: depth(s, 2) }));

  // census
  const colors = {}, fonts = {}, radii = {}, sizes = {}, shadows = {}, transitions = {};
  const bump = (m, k) => { if (!k || k === 'none' || k === 'rgba(0, 0, 0, 0)') return; m[k] = (m[k] || 0) + 1; };
  for (const el of document.querySelectorAll('*')) {
    if (!vis(el)) continue;
    const s = getComputedStyle(el);
    bump(colors, s.color); bump(colors, s.backgroundColor);
    bump(fonts, s.fontFamily); bump(fonts, s.fontWeight + ' / ' + s.fontSize);
    bump(radii, s.borderRadius); bump(sizes, s.fontSize + ' ' + s.lineHeight + ' ' + s.letterSpacing);
    if (s.boxShadow !== 'none') bump(shadows, s.boxShadow.slice(0, 120));
    if (s.transition && s.transition !== 'all 0s ease 0s') bump(transitions, s.transition.slice(0, 160));
  }
  const top = (o, n = 40) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => ({ value: k, count: v }));

  return {
    url: location.href,
    title: document.title,
    meta: Object.fromEntries([...document.querySelectorAll('meta[name],meta[property]')].map(m => [m.getAttribute('name') || m.getAttribute('property'), m.getAttribute('content')])),
    viewport: { w: innerWidth, h: innerHeight },
    docHeight: document.documentElement.scrollHeight,
    sections,
    census: { colors: top(colors), fonts: top(fonts), sizes: top(sizes), radii: top(radii), shadows: top(shadows), transitions: top(transitions) },
    libs: (() => {
      const globals = ['jQuery','$','Swiper','gsap','ScrollTrigger','Lenis','ScrollMagic','AOS','THREE','Vue','React','WOW','Barba','Motion','anime','Alpine','TinySlides','unified'];
      const found = {};
      for (const g of globals) { try { if (window[g]) found[g] = String(window[g]?.version || window[g]?.fn?.jquery || 'present'); } catch {} }
      const hooks = [];
      if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) hooks.push('react');
      if (document.querySelector('[data-reactroot],#__next,#root[data-reactroot]')) hooks.push('react-dom');
      if (window.__NEXT_DATA__) hooks.push('next');
      if (window.__NUXT__) hooks.push('nuxt');
      if (document.querySelector('[ng-version]')) hooks.push('angular');
      if (window.__VUE__ || document.querySelector('[data-v-app]')) hooks.push('vue');
      return { globals: found, hooks };
    })(),
    cssVars: (() => {
      const out = {};
      const s = getComputedStyle(document.documentElement);
      for (const sheet of document.styleSheets) {
        let rules; try { rules = sheet.cssRules; } catch { continue; }
        for (const r of rules || []) {
          if (r.style && r.selectorText && /:root|html|body/.test(r.selectorText)) {
            for (const p of r.style) if (p.startsWith('--')) out[p] = r.style.getPropertyValue(p).trim();
          }
        }
      }
      return out;
    })(),
  };
})()`;

const BEHAVIOR_PROBE = `(() => {
  const s = getComputedStyle(document.documentElement);
  return {
    scrollBehavior: s.scrollBehavior,
    htmlClass: document.documentElement.className,
    bodyClass: document.body.className,
    inlineStyles: [...document.querySelectorAll('style')].map(x => x.textContent.length),
    cssVarCount: [...document.styleSheets].reduce((n, sh) => { try { return n + sh.cssRules.length; } catch { return n; } }, 0),
    observers: {
      intersection: typeof IntersectionObserver,
      resize: typeof ResizeObserver,
      scrollTimeline: CSS.supports('scroll-timeline-name: --x') || CSS.supports('animation-timeline: --x'),
      viewTransitions: typeof document.startViewTransition,
    },
    stickyFixed: [...document.querySelectorAll('*')].filter(e => ['fixed','sticky'].includes(getComputedStyle(e).position)).slice(0, 40).map(e => {
      const st = getComputedStyle(e); const r = e.getBoundingClientRect();
      return { tag: e.tagName.toLowerCase(), cls: String(e.className).slice(0,200), position: st.position, top: st.top, z: st.zIndex, h: Math.round(r.height), transition: st.transition.slice(0,120) };
    }),
    scrollDrivenCss: [...document.styleSheets].flatMap(sh => { try { return [...sh.cssRules]; } catch { return []; } })
      .filter(r => r.cssText && /scroll-timeline|animation-timeline|view-timeline|scroll\\(/.test(r.cssText)).map(r => r.cssText.slice(0,200)).slice(0, 20),
  };
})()`;

async function main() {
  const [url, outDir, w = "1440", h = "900"] = process.argv.slice(2);
  if (!url || !outDir) {
    console.error("usage: node scripts/recon.mjs <url> <outDir> [width] [height]");
    process.exit(1);
  }
  fs.mkdirSync(outDir, { recursive: true });
  const port = 9400 + Math.floor(Math.random() * 400);
  const { proc, target, userDataDir } = await launch(port);
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.addEventListener("open", res, { once: true });
    ws.addEventListener("error", rej, { once: true });
  });
  const cdp = new CDP(ws);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Network.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: +w, height: +h, deviceScaleFactor: 1, mobile: +w < 768,
  });
  await cdp.send("Page.navigate", { url });
  await sleep(4000);

  // progressive scroll to trigger lazy content + entrance animations
  await cdp.eval(`(async () => {
    const step = Math.round(innerHeight * 0.6);
    for (let y = 0; y <= document.documentElement.scrollHeight; y += step) {
      scrollTo(0, y);
      await new Promise(r => setTimeout(r, 220));
    }
    scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 600));
    return true;
  })()`);

  const probe = await cdp.eval(PROBE);
  const behaviors = await cdp.eval(BEHAVIOR_PROBE);
  const html = await cdp.eval("document.documentElement.outerHTML");

  const assets = cdp.events
    .filter((e) => e.method === "Network.responseReceived" || e.method === "Network.requestWillBeSent")
    .map((e) => e.params?.response?.url ?? e.params?.request?.url)
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i)
    .filter((u) => !/^data:|\.(woff2?|ttf|otf|eot)$/i.test(u));

  // record requests with types
  const reqTypes = {};
  for (const e of cdp.events) {
    if (e.method === "Network.responseReceived") {
      const { type, url: u } = e.params;
      (reqTypes[type] ||= []).push(u);
    }
  }
  for (const k of Object.keys(reqTypes)) reqTypes[k] = [...new Set(reqTypes[k])];

  const shot = await cdp.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
  });

  fs.writeFileSync(path.join(outDir, "page.html"), html);
  fs.writeFileSync(path.join(outDir, "page.png"), Buffer.from(shot.data, "base64"));
  fs.writeFileSync(path.join(outDir, "sections.json"), JSON.stringify(probe, null, 2));
  fs.writeFileSync(path.join(outDir, "behaviors.json"), JSON.stringify(behaviors, null, 2));
  fs.writeFileSync(path.join(outDir, "assets.json"), JSON.stringify({ requests: assets, byType: reqTypes }, null, 2));

  ws.close();
  proc.kill();
  try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch {}
  console.log(`recon done: ${outDir} (${probe.docHeight}px tall, ${probe.sections.length} sections)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
