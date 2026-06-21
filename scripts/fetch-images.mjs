// One-off: pull themed, CC-licensed photos from Wikimedia Commons into
// public/images/ and record attribution. Re-run to refresh.
import fs from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve(process.cwd(), "public/images");
const UA = "HeavenHellSite/1.0 (jwsnyder@gmail.com)";
const BAD =
  /(svg|icon|logo|\bmap\b|diagram|chart|seal|coat[_ ]of[_ ]arms|flag|barnstar|emblem)/i;

const SLOTS = [
  { name: "sky-clouds", query: "blue sky white cumulus clouds" },

  { name: "heaven-1", query: "crepuscular rays sunbeams clouds" },
  { name: "heaven-2", query: "sunrise above sea of clouds mountain" },
  { name: "heaven-3", query: "sunlight rays through clouds sky" },
  { name: "heaven-4", query: "silhouette person sunset arms raised" },
  { name: "heaven-5", query: "sunbeam forest light rays" },

  { name: "science-1", query: "surgeons operating room surgery" },
  { name: "science-2", query: "human brain anatomy" },
  { name: "science-3", query: "hospital intensive care unit monitor" },
  { name: "science-4", query: "MRI scanner machine hospital" },
  { name: "science-5", query: "electrocardiogram monitor heart" },

  { name: "hell-1", query: "fire flames dark background" },
  { name: "hell-2", query: "lava volcano eruption night" },
  { name: "hell-3", query: "dark cave tunnel" },
  { name: "hell-4", query: "forest wildfire flames night" },
  { name: "hell-5", query: "burning coal embers glow" },

  { name: "bible-1", query: "open Holy Bible pages" },
  { name: "bible-2", query: "Holy Bible book cover" },
  { name: "bible-3", query: "open bible reading hands" },
  { name: "bible-4", query: "antique old bible book" },
  { name: "bible-5", query: "bible on wooden table" },
];

const strip = (html) =>
  (html || "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

async function findImage(query) {
  const api =
    "https://commons.wikimedia.org/w/api.php?action=query&generator=search" +
    `&gsrsearch=${encodeURIComponent(query)}` +
    "&gsrnamespace=6&gsrlimit=15&prop=imageinfo" +
    "&iiprop=url|size|extmetadata&iiurlwidth=1600&format=json";
  const res = await fetch(api, { headers: { "User-Agent": UA } });
  const json = await res.json();
  const pages = Object.values(json.query?.pages || {});
  const cands = pages
    .filter((p) => {
      const t = p.title || "";
      const ii = p.imageinfo?.[0];
      return (
        ii?.thumburl &&
        /\.(jpe?g)$/i.test(t) &&
        !BAD.test(t) &&
        (ii.width || 0) >= 1000
      );
    })
    .sort((a, b) => (a.index ?? 999) - (b.index ?? 999));
  return cands[0];
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const credits = [];

  for (const slot of SLOTS) {
    try {
      const hit = await findImage(slot.query);
      if (!hit) {
        console.log(`MISS  ${slot.name}  (${slot.query})`);
        continue;
      }
      const ii = hit.imageinfo[0];
      const buf = Buffer.from(
        await (await fetch(ii.thumburl, { headers: { "User-Agent": UA } })).arrayBuffer()
      );
      await fs.writeFile(path.join(OUT, `${slot.name}.jpg`), buf);
      const meta = ii.extmetadata || {};
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

  await fs.writeFile(
    path.join(OUT, "credits.json"),
    JSON.stringify(credits, null, 2)
  );
  console.log(`\nWrote ${credits.length} images + credits.json`);
}

main();
