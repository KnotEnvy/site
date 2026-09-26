/**
 * Multi-page visual + health verification for every route on the site.
 *
 * For each route it: loads the page on a real GPU (ANGLE d3d11), waits for the
 * WebGL sky to size itself, screenshots a set of scroll depths, and reports
 *   - console errors / page errors / hydration warnings
 *   - whether the sky canvas actually mounted with a non-zero size
 *   - horizontal overflow (documentElement wider than the viewport)
 *   - the page <title>, canonical link and JSON-LD block count (SEO sanity)
 *
 * It deliberately waits on `load` + fixed settles rather than `networkidle`:
 * lazy YouTube thumbnails and a busy dev machine can keep the network from
 * ever going idle, which turned the older harness into a 60s timeout.
 *
 * LOOK at the PNGs. "No errors" is not the same as "renders correctly"
 * (handoff.json criticalLessons #1).
 *
 * Usage:
 *   node scripts/verify-pages.mjs [baseUrl] [outDir] [--mobile] [--reduced] [--routes=/,/evidence]
 *
 * baseUrl defaults to :3001 - port 3000 on this machine belongs to another
 * project, and a harness pointed at it silently tests the wrong app.
 */
import { chromium } from "playwright-core";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith("--"));
const flag = (name) => args.includes(`--${name}`);
const opt = (name) => args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];

const BASE = positional[0] ?? "http://localhost:3001";
const OUT = positional[1] ?? path.join(process.cwd(), ".verify-pages");
const MOBILE = flag("mobile");
const REDUCED = flag("reduced");

const DEFAULT_ROUTES = [
  "/",
  "/evidence",
  "/great-minds",
  "/scripture",
  "/scripture/heaven",
  "/the-ascent",
  "/begin",
];
const ROUTES = opt("routes")?.split(",") ?? DEFAULT_ROUTES;
const DEPTHS = (opt("depths") ?? "0,0.2,0.4,0.6,0.8,1").split(",").map(Number);

function findChrome() {
  const cache = path.join(os.homedir(), "AppData", "Local", "ms-playwright");
  const dirs = fs
    .readdirSync(cache)
    .filter((d) => d.startsWith("chromium-"))
    .sort()
    .reverse();
  for (const d of dirs) {
    for (const sub of ["chrome-win64", "chrome-win"]) {
      const exe = path.join(cache, d, sub, "chrome.exe");
      if (fs.existsSync(exe)) return exe;
    }
  }
  throw new Error("No ms-playwright Chromium found. Run: npx playwright install chromium");
}

const browser = await chromium.launch({
  executablePath: findChrome(),
  headless: true,
  args: ["--no-sandbox", "--use-angle=d3d11", "--enable-gpu"],
});

const context = await browser.newContext({
  viewport: MOBILE ? { width: 390, height: 844 } : { width: 1440, height: 900 },
  deviceScaleFactor: MOBILE ? 2 : 1,
  isMobile: MOBILE,
  hasTouch: MOBILE,
  reducedMotion: REDUCED ? "reduce" : "no-preference",
});

fs.mkdirSync(OUT, { recursive: true });
const report = [];
let failures = 0;

// Benign noise documented in handoff.json knownIssues.benign-dev-console-hints.
const BENIGN = /THREE\.Clock|preloaded (with link preload|using link preload) but not used|Largest Contentful Paint|reduced motion/i;

/** The sky canvas must fill (almost) the whole viewport width to count. */
const VIEW_W = MOBILE ? 390 : 1440;

for (const route of ROUTES) {
  const page = await context.newPage();
  const problems = [];
  page.on("console", (m) => {
    const text = m.text();
    if (BENIGN.test(text)) return;
    if (m.type() === "error" || /hydrat|Context Lost|Maximum update depth/i.test(text)) {
      problems.push(`[${m.type()}] ${text.slice(0, 300)}`);
    }
  });
  page.on("pageerror", (e) => problems.push(`[pageerror] ${e.message.slice(0, 300)}`));

  const slug = route === "/" ? "home" : route.replace(/^\//, "").replace(/\//g, "_");
  const res = await page.goto(BASE + route, { waitUntil: "load", timeout: 120000 });
  const status = res?.status() ?? 0;

  // r3f sizes its canvas ~1.5s after load (criticalLessons #13): poll, don't
  // read once. Target the SKY canvas specifically (pages can have their own
  // canvases, e.g. the Big Bang scrub) and wait until it fills the viewport -
  // a fresh canvas reports the 300x150 HTML default before r3f sizes it.
  let canvas = null;
  for (let i = 0; i < 40; i++) {
    canvas = await page.evaluate(() => {
      const c = document.querySelector("div.fixed.inset-0 canvas");
      if (!c) return null;
      const r = c.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height) };
    });
    if (canvas && canvas.w >= VIEW_W * 0.95 && canvas.h > 0) break;
    await page.waitForTimeout(500);
  }
  await page.waitForTimeout(3500); // shader warm-up + camera damping

  const seo = await page.evaluate(() => ({
    title: document.title,
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null,
    description: document.querySelector('meta[name="description"]')?.getAttribute("content") ?? null,
    ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute("content") ?? null,
    jsonLd: document.querySelectorAll('script[type="application/ld+json"]').length,
    h1: Array.from(document.querySelectorAll("h1")).map((h) => h.textContent.trim().replace(/\s+/g, " ")),
  }));

  for (const depth of DEPTHS) {
    await page.evaluate((d) => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: max * d, behavior: "instant" });
    }, depth);
    await page.waitForTimeout(2200);
    await page.screenshot({
      path: path.join(OUT, `${slug}-${String(Math.round(depth * 100)).padStart(3, "0")}.png`),
    });
  }

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth
  );
  // Reveal blocks ON SCREEN right now that are still hidden - a stranded block.
  // (Blocks the instant scroll-jumps skipped over are legitimately unrevealed:
  // they animate in when a real visitor scrolls to them.) Settle once more at
  // the final depth first so the enter observer has had its callback.
  await page.waitForTimeout(1200);
  const stranded = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".reveal")).filter((el) => {
      const r = el.getBoundingClientRect();
      const onScreen = r.width > 0 && r.bottom > 0 && r.top < window.innerHeight * 0.85;
      // A block drifting out past the top (`is-leaving`) is hidden on purpose.
      return onScreen && !el.classList.contains("is-leaving") && getComputedStyle(el).opacity === "0";
    }).length
  );

  const ok =
    status === 200 &&
    problems.length === 0 &&
    canvas &&
    canvas.w >= VIEW_W * 0.95 &&
    overflow <= 0 &&
    stranded === 0 &&
    seo.h1.length === 1;
  if (!ok) failures++;

  report.push({ route, status, ok, canvas, overflow, stranded, seo, problems });
  console.log(
    `${ok ? "PASS" : "FAIL"} ${route}  status=${status} canvas=${canvas ? `${canvas.w}x${canvas.h}` : "none"} overflow=${overflow} stranded=${stranded} h1=${seo.h1.length} jsonLd=${seo.jsonLd}`
  );
  console.log(`     title: ${seo.title}`);
  console.log(`     canonical: ${seo.canonical}  og:image: ${seo.ogImage}`);
  for (const p of problems) console.log(`     ${p}`);
  await page.close();
}

fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));
await browser.close();
console.log(`\n${failures === 0 ? "ALL PASS" : `${failures} FAILING ROUTE(S)`} -> ${OUT}`);
process.exit(failures === 0 ? 0 : 1);
