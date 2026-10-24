// Link checker for LUMEN LEARN.
//
// 1. Static: every internal path literal in src/ ("/tutors", `/bookings/${id}`, …)
//    must match an App Router route (or a file in public/).
// 2. HTTP: crawls server-rendered pages from BASE_URL and requests every
//    internal link it finds, failing on any non-2xx/3xx response.
//
//   node scripts/check-links.mjs                 # static + crawl http://localhost:3210
//   BASE_URL=http://localhost:3000 node scripts/check-links.mjs
//   node scripts/check-links.mjs --static-only
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const APP = join(ROOT, "src", "app");
const BASE = process.env.BASE_URL ?? "http://localhost:3210";
const staticOnly = process.argv.includes("--static-only");

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

// ── Route patterns from src/app/**/page.tsx ──
const routes = walk(APP)
  .filter((f) => /[\\/]page\.tsx$/.test(f))
  .map((f) => {
    const segs = relative(APP, f).split(sep).slice(0, -1).filter((s) => !/^\(.*\)$/.test(s));
    return "/" + segs.join("/");
  });
const patterns = routes.map((r) => new RegExp("^" + r.replace(/\[[^\]]+\]/g, "[^/]+").replace(/\/$/, "") + "/?$"));
const matches = (path) => patterns.some((re) => re.test(path === "/" ? "/" : path.replace(/\/$/, "")));

// ── Static scan ──
const problems = [];
const literal = /(["'`])(\/(?:[a-z0-9-]+|\$\{[^}]+\})(?:\/(?:[a-z0-9-]+|\$\{[^}]+\}|\[[^\]]+\]))*\/?)(?:[?#][^"'`]*)?\1/gi;
let checked = 0;
for (const file of walk(join(ROOT, "src")).filter((f) => /\.(tsx?|mjs)$/.test(f))) {
  const src = readFileSync(file, "utf8");
  for (const m of src.matchAll(literal)) {
    const raw = m[2];
    if (raw.startsWith("/images/") || raw.startsWith("/_next") || raw === "/") {
      if (raw.startsWith("/images/") && !raw.includes("${") && !existsSync(join(ROOT, "public", raw))) problems.push(`${relative(ROOT, file)}: missing public file ${raw}`);
      continue;
    }
    const before = src.slice(Math.max(0, m.index - 12), m.index);
    if (/from\s*$|import\(\s*$|require\(\s*$/.test(before)) continue; // module specifiers
    const path = raw.replace(/\$\{[^}]+\}/g, "x").replace(/\[[^\]]+\]/g, "x");
    checked++;
    if (!matches(path)) problems.push(`${relative(ROOT, file)}: no route for ${raw}`);
  }
}
console.log(`Static: ${routes.length} routes, ${checked} path literals checked.`);

// ── HTTP crawl ──
async function crawl() {
  const seeds = routes.filter((r) => !r.includes("[")).concat([
    "/tutors/emeka-nwosu", "/book/emeka-nwosu", "/schools/iroko-gate-schools", "/competitions/harmattan-quiz-league-2026",
    "/courses/jss3-mathematics", "/start/guardian", "/learn/tests/wt-math-w7-1", "/school/classes/cls-jss3", "/guardian/children/stu-chidera",
  ]);
  const seen = new Set();
  const queue = [...seeds];
  let ok = 0;
  while (queue.length) {
    const path = queue.shift();
    if (seen.has(path)) continue;
    seen.add(path);
    let res;
    try {
      res = await fetch(BASE + path, { redirect: "manual" });
    } catch (e) {
      problems.push(`HTTP ${path}: ${e.message}`);
      continue;
    }
    if (res.status >= 400) {
      problems.push(`HTTP ${res.status} ${path}`);
      continue;
    }
    ok++;
    const html = await res.text();
    for (const m of html.matchAll(/href="(\/[^"#?]*)/g)) {
      const href = m[1];
      if (href.startsWith("/_next") || href.startsWith("/images/") || /\.(ico|png|svg|webp|css|js)$/.test(href)) continue;
      if (!seen.has(href) && seen.size + queue.length < 400) queue.push(href);
    }
  }
  console.log(`HTTP: ${ok}/${seen.size} pages returned 2xx/3xx from ${BASE}.`);
}

if (!staticOnly) await crawl();

if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n` + problems.map((p) => "  ✗ " + p).join("\n"));
  process.exit(1);
}
console.log("✓ No broken internal links found.");
