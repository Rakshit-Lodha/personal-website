#!/usr/bin/env node
/**
 * Roman v2 reference-comparison QA (BUILD_PLAN.md §19, tracker J1/J2).
 *
 * Captures every approved section of /roman-v2 at the exact pixel size of its concept reference,
 * then writes <section>-{reference,actual,overlay,diff}.png to design/roman-v2/qa/, a full-page
 * desktop capture + side-by-side with 00-full-page-structure.png, and full-page responsive
 * captures (1920 … 360) to design/roman-v2/qa/responsive/ with a metrics.json (scrollWidth etc.).
 *
 * Run (from the repo root, against a production server — `npm run build && npx next start -p 3030`):
 *
 *   node scripts/roman-v2-qa.mjs [--base http://localhost:3030] [--only hero,career]
 *
 * Playwright is NOT a repo dependency. Install it anywhere and point PW_MODULE at it, e.g.
 *
 *   mkdir -p /tmp/pw && (cd /tmp/pw && npm i playwright-core@1.56)
 *   PW_MODULE=/tmp/pw/node_modules/playwright-core node scripts/roman-v2-qa.mjs
 *
 * Browser: CHROMIUM_PATH, else Playwright's cached chrome-headless-shell (build 1217 on macOS arm64),
 * else Playwright's default. Captures use DPR 1 and `prefers-reduced-motion: reduce` so reveal
 * animations are already settled; lazy images are forced to load by scrolling the page first.
 *
 * Section captures: the section's top edge is aligned to y=0 (hero includes the floating nav at
 * scroll 0). For every other section the fixed nav is hidden, because the concepts for those
 * sections either omit it or show an obsolete nav variant. A 1200px black spacer is appended to
 * the body so the footer can also be scrolled to the top of the viewport.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const BASE = arg("base", "http://localhost:3030").replace(/\/$/, "");
const ONLY = arg("only", "")?.split(",").filter(Boolean);
const ROOT = process.cwd();
const CONCEPTS = path.join(ROOT, "design/roman-v2/concepts");
const OUT = path.join(ROOT, "design/roman-v2/qa");
const OUT_RESP = path.join(OUT, "responsive");

const SECTIONS = [
  { name: "hero", ref: "01-hero-approved.png", selector: "#top", keepNav: true },
  { name: "career", ref: "02-work-over-time-approved.png", selector: "#work" },
  { name: "products", ref: "03-selected-products-approved.png", selector: "#products" },
  { name: "beyond", ref: "04-beyond-work-approved.png", selector: "#beyond" },
  { name: "jj", ref: "05-jj-approved.png", selector: "#jj" },
  { name: "footer", ref: "06-footer-approved.png", selector: "#contact" },
];
const RESPONSIVE_WIDTHS = [1920, 1440, 1280, 1024, 768, 430, 390, 360];
const DIFF_GAIN = 3;

async function loadPlaywright() {
  const candidates = [process.env.PW_MODULE, "playwright-core", "playwright"].filter(Boolean);
  for (const c of candidates) {
    try {
      const spec = c.startsWith("/") ? pathToFileURL(path.join(c, "index.mjs")).href : c;
      const mod = await import(spec);
      return mod.chromium ?? mod.default.chromium;
    } catch {
      /* try next */
    }
  }
  throw new Error("Playwright not found. Set PW_MODULE=/path/to/node_modules/playwright-core (see header).");
}

function chromiumPath() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const shell = path.join(
    os.homedir(),
    "Library/Caches/ms-playwright/chromium_headless_shell-1217/chrome-headless-shell-mac-arm64/chrome-headless-shell",
  );
  return fs.existsSync(shell) ? shell : undefined;
}

async function settle(page) {
  await page.evaluate(() => document.fonts.ready);
  // Scroll through the page so every lazy image starts loading, then wait for all of them.
  await page.evaluate(async () => {
    // Capture-only: promote lazy images so off-screen artwork is present in full-page captures.
    for (const img of document.images) img.loading = "eager";
    const step = window.innerHeight / 2;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
    // Full-page captures paint regions outside the viewport; async-decoded images can be skipped
    // there, so force sync decoding and wait for every visible image to decode.
    const visible = [...document.images].filter((img) => img.getClientRects().length > 0);
    for (const img of visible) img.decoding = "sync";
    const decoded = Promise.all(visible.map((img) => img.decode().catch(() => null)));
    // Hidden (display:none) lazy images never load; don't wait on them forever.
    await Promise.race([decoded, new Promise((r) => setTimeout(r, 8000))]);
  });
  await page.waitForTimeout(300);
}

async function openPage(browser, width, height) {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, reducedMotion: "reduce" });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`${BASE}/roman-v2`, { waitUntil: "networkidle" });
  await settle(page);
  return { context, page, errors };
}

/** 50% overlay and amplified absolute difference, computed on raw RGB. */
async function compare(name, refPath, actualPath) {
  const ref = await sharp(refPath).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const act = await sharp(actualPath).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = ref.info;
  if (act.info.width !== width || act.info.height !== height) {
    throw new Error(`${name}: size mismatch ref ${width}x${height} vs actual ${act.info.width}x${act.info.height}`);
  }
  const overlay = Buffer.alloc(ref.data.length);
  const diff = Buffer.alloc(ref.data.length);
  let sum = 0;
  let over32 = 0;
  for (let i = 0; i < ref.data.length; i += 3) {
    let px = 0;
    for (let c = 0; c < 3; c++) {
      overlay[i + c] = (ref.data[i + c] + act.data[i + c]) >> 1;
      const d = Math.abs(ref.data[i + c] - act.data[i + c]);
      diff[i + c] = Math.min(255, d * DIFF_GAIN);
      px += d;
    }
    sum += px / 3;
    if (px / 3 > 32) over32++;
  }
  const raw = { raw: { width, height, channels: 3 } };
  await sharp(overlay, raw).png().toFile(path.join(OUT, `${name}-overlay.png`));
  await sharp(diff, raw).png().toFile(path.join(OUT, `${name}-diff.png`));
  const n = width * height;
  return { width, height, meanAbsDiff: +(sum / n).toFixed(2), pctPixelsOver32: +((over32 / n) * 100).toFixed(1) };
}

async function captureSections(browser) {
  const results = {};
  for (const section of SECTIONS) {
    if (ONLY.length && !ONLY.includes(section.name)) continue;
    const refPath = path.join(CONCEPTS, section.ref);
    const { width, height } = await sharp(refPath).metadata();
    const { context, page, errors } = await openPage(browser, width, height);
    await page.evaluate(
      ({ selector, keepNav }) => {
        const spacer = document.createElement("div");
        spacer.style.cssText = "height:1200px;background:#000";
        document.body.appendChild(spacer);
        if (!keepNav) for (const h of document.querySelectorAll("body header")) if (!h.closest("main, section, footer")) h.style.visibility = "hidden";
        const el = document.querySelector(selector);
        const top = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: keepNav ? 0 : top, behavior: "instant" });
      },
      { selector: section.selector, keepNav: !!section.keepNav },
    );
    await page.waitForTimeout(400);
    const box = await page.evaluate((selector) => {
      const r = document.querySelector(selector).getBoundingClientRect();
      return { top: Math.round(r.top + window.scrollY), height: Math.round(r.height), viewportTop: Math.round(r.top) };
    }, section.selector);
    const actualPath = path.join(OUT, `${section.name}-actual.png`);
    await page.screenshot({ path: actualPath });
    fs.copyFileSync(refPath, path.join(OUT, `${section.name}-reference.png`));
    results[section.name] = { ...(await compare(section.name, refPath, actualPath)), section: box, consoleErrors: errors };
    console.log(section.name, JSON.stringify(results[section.name]));
    await context.close();
  }
  return results;
}

async function captureFullPages(browser) {
  const metrics = {};
  // Desktop full page at the reference width, plus a side-by-side with the full-page structure concept.
  {
    const { context, page, errors } = await openPage(browser, 1672, 941);
    const file = path.join(OUT, "full-page-desktop.png");
    await page.screenshot({ path: file, fullPage: true });
    const conceptPath = path.join(CONCEPTS, "00-full-page-structure.png");
    const concept = await sharp(conceptPath).metadata();
    const scaled = await sharp(file).resize({ width: concept.width }).png().toBuffer();
    const scaledMeta = await sharp(scaled).metadata();
    const h = Math.max(concept.height, scaledMeta.height);
    await sharp({ create: { width: concept.width * 2 + 24, height: h, channels: 3, background: "#ffffff" } })
      .composite([
        { input: conceptPath, left: 0, top: 0 },
        { input: scaled, left: concept.width + 24, top: 0 },
      ])
      .png()
      .toFile(path.join(OUT, "full-page-vs-structure.png"));
    metrics.desktop1672 = { scrollHeight: scaledMeta.height, consoleErrors: errors };
    await context.close();
  }
  for (const width of RESPONSIVE_WIDTHS) {
    const { context, page, errors } = await openPage(browser, width, width < 768 ? 844 : 900);
    const m = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      scrollHeight: document.documentElement.scrollHeight,
      overflowing: [...document.querySelectorAll("body *")]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          if (!(r.width > 0 && (r.right > document.documentElement.clientWidth + 1 || r.left < -1))) return false;
          // Ignore elements clipped by an overflow-hidden/clip ancestor: they cannot cause page overflow.
          for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
            if (getComputedStyle(a).overflowX !== "visible") return false;
          }
          return true;
        })
        .slice(0, 10)
        .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 50)}`),
      sections: [...document.querySelectorAll("main > section, body footer")].map((el) => ({
        id: el.id,
        top: Math.round(el.getBoundingClientRect().top + window.scrollY),
        height: Math.round(el.getBoundingClientRect().height),
      })),
    }));
    await page.screenshot({ path: path.join(OUT_RESP, `full-${width}.png`), fullPage: true });
    metrics[width] = { ...m, consoleErrors: errors };
    console.log(width, m.scrollWidth, m.clientWidth, m.scrollHeight);
    await context.close();
  }
  fs.writeFileSync(path.join(OUT_RESP, "metrics.json"), JSON.stringify(metrics, null, 2));
  return metrics;
}

const chromium = await loadPlaywright();
fs.mkdirSync(OUT_RESP, { recursive: true });
const browser = await chromium.launch({ executablePath: chromiumPath() });
try {
  const sections = await captureSections(browser);
  if (!ONLY.length) await captureFullPages(browser);
  const summaryPath = path.join(OUT, "metrics.json");
  const previous = fs.existsSync(summaryPath) ? JSON.parse(fs.readFileSync(summaryPath, "utf8")) : {};
  fs.writeFileSync(summaryPath, JSON.stringify({ ...previous, ...sections, capturedAt: new Date().toISOString(), base: BASE }, null, 2));
} finally {
  await browser.close();
}
