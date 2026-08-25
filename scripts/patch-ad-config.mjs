/** Inject ad-config.js before site.js on all static HTML pages. */
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(fileURLToPath(import.meta.url), "../..");
const SKIP = new Set(["node_modules", ".git", ".next", "out", "public", "src", "data", "scripts"]);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    try {
      if (statSync(p).isDirectory()) walk(p, out);
      else if (name.endsWith(".html")) out.push(p);
    } catch {
      /* skip */
    }
  }
  return out;
}

let changed = 0;
let failed = 0;
for (const file of walk(ROOT)) {
  try {
    let html = readFileSync(file, "utf8");
    if (html.includes("ad-config.js")) continue;
    const next = html.replace(
      /(<script defer src="[^"]*\/)site\.js"><\/script>/,
      (_m, prefix) =>
        `<script defer src="${prefix}ad-config.js"></script>\n  <script defer src="${prefix}site.js"></script>`,
    );
    if (next !== html) {
      writeFileSync(file, next);
      changed++;
    }
  } catch (err) {
    failed++;
    console.warn("skip", file, err.message);
  }
}
console.log(`Injected ad-config.js into ${changed} HTML files (${failed} skipped)`);
