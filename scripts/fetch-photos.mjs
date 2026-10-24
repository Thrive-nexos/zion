// Downloads the photos listed in assets/photo-sources.json from Wikimedia Commons,
// records their licence metadata, and writes art-directed WebP renditions.
//
//   node scripts/fetch-photos.mjs
//
// Output: public/images/photos/<id>-{800,1600}.webp and src/data/photo-credits.json
// (the credits file is what the site and ASSET_SOURCES.md are built from).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const UA = "LumenLearnDemo/0.1 (education prototype; asset sourcing)";
const sources = JSON.parse(readFileSync(join(ROOT, "assets/photo-sources.json"), "utf8"));
const outDir = join(ROOT, "public/images/photos");
mkdirSync(outDir, { recursive: true });

const cacheDir = join(ROOT, "assets/.cache");
mkdirSync(cacheDir, { recursive: true });

async function fetchRetry(url, tries = 6) {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(60_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (e) {
      if (i >= tries) throw e;
      console.warn(`  retry ${i} for ${String(url).slice(0, 80)}: ${e.message}`);
      await new Promise((r) => setTimeout(r, 2000 * i));
    }
  }
}

const strip = (s) => (s ?? "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const credits = [];

for (const src of sources) {
  const api = new URL("https://commons.wikimedia.org/w/api.php");
  Object.entries({
    action: "query", format: "json", titles: src.commonsTitle, prop: "imageinfo",
    iiprop: "url|size|extmetadata", iiurlwidth: "2000",
  }).forEach(([k, v]) => api.searchParams.set(k, v));
  const metaFile = join(cacheDir, `${src.id}.json`);
  const meta = existsSync(metaFile) ? JSON.parse(readFileSync(metaFile, "utf8")) : await (await fetchRetry(api)).json();
  writeFileSync(metaFile, JSON.stringify(meta));
  const page = Object.values(meta.query.pages)[0];
  const ii = page.imageinfo[0];
  const m = ii.extmetadata;
  const rawFile = join(cacheDir, `${src.id}.jpg`);
  const buf = existsSync(rawFile) ? readFileSync(rawFile) : Buffer.from(await (await fetchRetry(ii.thumburl ?? ii.url)).arrayBuffer());
  writeFileSync(rawFile, buf);

  // One consistent grade across all photos so documentary images sit together:
  // gentle contrast, slightly warmer highlights, a touch less saturation.
  const graded = sharp(buf).rotate().modulate({ saturation: 0.92, brightness: 1.02 }).linear(1.06, -6).recomb([[1.03, 0, 0], [0, 1, 0], [0, 0, 0.95]]);
  const base = await graded.toBuffer();
  for (const w of [800, 1600]) {
    await sharp(base).resize({ width: w, withoutEnlargement: true }).webp({ quality: 74, effort: 5 })
      .toFile(join(outDir, `${src.id}-${w}.webp`));
  }
  const { width, height } = await sharp(base).metadata();
  credits.push({
    id: src.id,
    alt: src.alt,
    use: src.use,
    title: src.commonsTitle.replace(/^File:/, ""),
    author: strip(m.Artist?.value),
    license: strip(m.LicenseShortName?.value),
    licenseUrl: strip(m.LicenseUrl?.value) || null,
    sourceUrl: ii.descriptionurl,
    originalSize: `${ii.width}×${ii.height}`,
    aspect: +(width / height).toFixed(4),
    changes: "Resized, colour-graded (contrast, warmth, saturation) and re-encoded as WebP",
  });
  console.log("ok", src.id, strip(m.LicenseShortName?.value), "|", strip(m.Artist?.value).slice(0, 40));
}

mkdirSync(join(ROOT, "src/data"), { recursive: true });
writeFileSync(join(ROOT, "src/data/photo-credits.json"), JSON.stringify(credits, null, 2) + "\n");
console.log(`wrote ${credits.length} photos`);
