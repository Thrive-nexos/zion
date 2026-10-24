// Full-frame screenshots with headless Edge/Chrome for visual QA.
//
//   node scripts/shoot.mjs <outDir> <width>x<height> <path> [<path> …]
//   e.g. node scripts/shoot.mjs qa/desktop 1440x900 / "/school?persona=p-coker"
//
// Set BROWSER to override the browser binary and BASE_URL for the server (default http://localhost:3210).
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";

const [outDir, size, ...paths] = process.argv.slice(2);
const [w, h] = size.split("x").map(Number);
const BASE = process.env.BASE_URL ?? "http://localhost:3210";
const BROWSER = process.env.BROWSER ?? "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
mkdirSync(outDir, { recursive: true });

for (const p of paths) {
  const name = (p.replace(/^\//, "").replace(/[^a-z0-9]+/gi, "-").replace(/-$/, "") || "home") + `-${w}.png`;
  const file = resolve(join(outDir, name));
  execFileSync(BROWSER, [
    "--headless=new", "--disable-gpu-sandbox", "--hide-scrollbars", "--no-first-run", `--user-data-dir=${join(tmpdir(), "lumen-shoot")}`,
    `--window-size=${w},${h}`, "--virtual-time-budget=15000", `--screenshot=${file}`, BASE + p,
  ], { stdio: "ignore", timeout: 120_000 });
  console.log("shot", file);
}
