/**
 * Inject Ezoic privacy + header scripts at the top of <head> on all HTML pages.
 * Privacy scripts load before the header script (Ezoic Step 2).
 *
 * Usage: node scripts/patch-ezoic-head.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";
import { EZOIC_HEAD_SCRIPTS, EZOIC_MARKER } from "./lib/ezoic-head.mjs";

const ROOT = process.cwd();
const SKIP = new Set(["node_modules", ".git", ".next", "out", "public"]);

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

function patch(html) {
  if (html.includes(EZOIC_MARKER)) return null;
  if (!/<head[^>]*>/i.test(html)) return null;
  return html.replace(/<head([^>]*)>/i, `<head$1>\n${EZOIC_HEAD_SCRIPTS}`);
}

function main() {
  const files = walk(ROOT);
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (i > 0 && i % 2500 === 0) {
      console.log(`… ${i}/${files.length} (updated ${updated})`);
    }
    let html;
    try {
      html = readFileSync(file, "utf8");
    } catch {
      failed += 1;
      continue;
    }
    const next = patch(html);
    if (next == null) {
      skipped += 1;
      continue;
    }
    try {
      writeFileSync(file, next);
      updated += 1;
    } catch {
      failed += 1;
    }
  }

  console.log(
    `Ezoic head patch done. updated=${updated} skipped=${skipped} failed=${failed} total=${files.length}`,
  );
}

main();
