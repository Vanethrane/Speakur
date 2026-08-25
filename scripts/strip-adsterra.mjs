/**
 * Remove Adsterra ad-config.js script tags from static HTML.
 * Ezoic showAds is activated by assets/site.js on #speakur-ad-* slots.
 *
 * Usage: node scripts/strip-adsterra.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, extname } from "path";

const ROOT = process.cwd();
const SKIP = new Set(["node_modules", ".git", ".next", "out"]);
const AD_CONFIG_RE =
  /\s*<script[^>]*\bsrc=["'][^"']*ad-config\.js["'][^>]*>\s*<\/script>/gi;

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const ent of entries) {
    if (ent.name.startsWith(".") && ent.name !== ".nojekyll") continue;
    if (SKIP.has(ent.name)) continue;
    const p = join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (extname(ent.name) === ".html") out.push(p);
  }
  return out;
}

function main() {
  const files = walk(ROOT);
  let updated = 0;
  for (let i = 0; i < files.length; i++) {
    if (i > 0 && i % 5000 === 0) console.log(`… ${i}/${files.length}`);
    let html;
    try {
      html = readFileSync(files[i], "utf8");
    } catch {
      continue;
    }
    if (!/ad-config\.js/i.test(html)) continue;
    const next = html.replace(AD_CONFIG_RE, "");
    if (next === html) continue;
    try {
      writeFileSync(files[i], next);
      updated += 1;
    } catch {
      /* lock */
    }
  }
  console.log(`Stripped ad-config.js from ${updated} HTML files`);
}

main();
