/**
 * Captures a 1200x630 social share card for every inner page, straight from
 * its live render - the page's own sky behind its own headline - into
 * public/og/<slug>.jpg. (The home page's cards come from make-og.mjs.)
 *
 * Page chrome is hidden, and so is anything marked data-og="hide" (the hero
 * lede, buttons, breadcrumbs), leaving the headline over the sky.
 *
 * Re-run after changing a hero or a journey's opening colours:
 *   node scripts/make-og-pages.mjs [baseUrl]
 */
import { chromium } from "playwright-core";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const BASE = process.argv[2] ?? "http://localhost:3001";
const PAGES = [
  { route: "/evidence", file: "evidence.jpg" },
  { route: "/great-minds", file: "great-minds.jpg" },
  { route: "/scripture", file: "scripture.jpg" },
  { route: "/the-ascent", file: "the-ascent.jpg" },
  { route: "/begin", file: "begin.jpg" },
];

function findChrome() {
  const cache = path.join(os.homedir(), "AppData", "Local", "ms-playwright");
  const dirs = fs.readdirSync(cache).filter((d) => d.startsWith("chromium-")).sort().reverse();
  for (const d of dirs) {
    for (const sub of ["chrome-win64", "chrome-win"]) {
      const exe = path.join(cache, d, sub, "chrome.exe");
      if (fs.existsSync(exe)) return exe;
    }
  }
  throw new Error("No ms-playwright Chromium found");
}

const HIDE = `
  header { display: none !important; }
  .fixed.right-8 { display: none !important; }      /* JourneyRail */
  nextjs-portal { display: none !important; }       /* dev-tools badge */
  [data-og="hide"] { display: none !important; }
  /* Pull the headline block up into the frame once the lede is gone. */
  main > div > section:first-of-type { min-height: 630px !important; padding-top: 48px !important; padding-bottom: 48px !important; }
  /* Headlines animate in letter by letter, and only when in view - a capture
     can land mid-animation, or miss a line below the fold entirely. Force
     the settled state, and size the headline to fit the 630px frame. */
  h1 span { opacity: 1 !important; transform: none !important; }
  h1 { font-size: clamp(48px, 7.2vw, 100px) !important; }
`;

const outDir = path.join(process.cwd(), "public", "og");
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: findChrome(),
  headless: true,
  args: ["--no-sandbox", "--use-angle=d3d11", "--enable-gpu"],
});

for (const p of PAGES) {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.goto(BASE + p.route, { waitUntil: "load", timeout: 120000 });
  await page.waitForSelector("div.fixed.inset-0 canvas", { timeout: 30000 });
  await page.waitForTimeout(7000); // sky warm-up + the headline's letter animation
  await page.addStyleTag({ content: HIDE });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, p.file), type: "jpeg", quality: 88 });
  await page.close();
  console.log(`captured public/og/${p.file}`);
}

await browser.close();
