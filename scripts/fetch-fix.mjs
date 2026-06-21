import fs from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve(process.cwd(), "public/images");
const UA = "HeavenHellSite/1.0 (jwsnyder@gmail.com)";
const BAD = /(svg|icon|logo|\bmap\b|diagram|chart|seal|coat[_ ]of[_ ]arms|flag)/i;

// Targeted re-fetches with better search terms.
const FIX = [
  { name: "heaven-5", query: "golden hour sky clouds sunset" },
  { name: "bible-3", query: "open Bible Psalms page" },
  { name: "bible-2", query: "Gutenberg Bible" },
];

const strip = (h) => (h || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

async function findImage(query) {
  const api =
    "https://commons.wikimedia.org/w/api.php?action=query&generator=search" +
    `&gsrsearch=${encodeURIComponent(query)}` +
    "&gsrnamespace=6&gsrlimit=15&prop=imageinfo" +
    "&iiprop=url|size|extmetadata&iiurlwidth=1600&format=json";
  const json = await (await fetch(api, { headers: { "User-Agent": UA } })).json();
  return Object.values(json.query?.pages || {})
    .filter((p) => {
      const ii = p.imageinfo?.[0];
      return ii?.thumburl && /\.(jpe?g|png)$/i.test(p.title || "") && !BAD.test(p.title || "") && (ii.width || 0) >= 800;
    })
    .sort((a, b) => (a.index ?? 999) - (b.index ?? 999))[0];
}

async function main() {
  const creditsPath = path.join(OUT, "credits.json");
  let credits = [];
  try {
    credits = JSON.parse(await fs.readFile(creditsPath, "utf8"));
  } catch {}

  for (const slot of FIX) {
    try {
      const hit = await findImage(slot.query);
      if (!hit) {
        console.log(`MISS  ${slot.name}`);
        continue;
      }
      const ii = hit.imageinfo[0];
      const buf = Buffer.from(
        await (await fetch(ii.thumburl, { headers: { "User-Agent": UA } })).arrayBuffer()
      );
      await fs.writeFile(path.join(OUT, `${slot.name}.jpg`), buf);
      const meta = ii.extmetadata || {};
      credits = credits.filter((c) => c.file !== `${slot.name}.jpg`);
      credits.push({
        file: `${slot.name}.jpg`,
        title: hit.title,
        artist: strip(meta.Artist?.value) || "Unknown",
        license: strip(meta.LicenseShortName?.value) || "See source",
        source: ii.descriptionurl || ii.url,
      });
      console.log(`OK    ${slot.name}  ${(buf.length / 1024) | 0}KB  ${hit.title}`);
    } catch (err) {
      console.log(`ERR   ${slot.name}: ${err.message}`);
    }
  }

  credits.sort((a, b) => a.file.localeCompare(b.file));
  await fs.writeFile(creditsPath, JSON.stringify(credits, null, 2));
  console.log(`\ncredits.json now has ${credits.length} entries`);
}

main();
