/** Repair corrupted ad script tags from a bad bulk replace. */
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

const BAD =
  /<script defer src="<script defer src="([^"]*\/)site\.js"><\/script>/g;

const GOOD = (_m, prefix) =>
  `<script defer src="${prefix}ad-config.js"></script>\n  <script defer src="${prefix}site.js"></script>`;

let fixed = 0;
let injected = 0;

for (const file of walk(ROOT)) {
  try {
    let html = readFileSync(file, "utf8");
    let next = html;

    if (BAD.test(html)) {
      next = html.replace(BAD, GOOD);
      fixed++;
    } else if (!next.includes("ad-config.js")) {
      const patched = next.replace(
        /(<script defer src="[^"]*\/)site\.js"><\/script>/,
        (_m, prefix) =>
          `<script defer src="${prefix}ad-config.js"></script>\n  <script defer src="${prefix}site.js"></script>`,
      );
      if (patched !== next) {
        next = patched;
        injected++;
      }
    }

    if (next !== html) writeFileSync(file, next);
  } catch (err) {
    console.warn("skip", file, err.message);
  }
}

console.log(`Repaired ${fixed} corrupted files; injected ${injected} missing ad-config.js`);
