/**
 * Compact sorted word → path index for lazy client lookup.
 * Replaces eager 6MB+ word-index.js parse on every page load.
 *
 * Usage: node scripts/build-word-lookup.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { gzipSync } from "zlib";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadWordRows() {
  const raw = readFileSync(join(ROOT, "assets/word-index.js"), "utf8");
  const json = raw.replace(/^[\s\S]*?=\s*/, "").replace(/;\s*$/, "");
  return JSON.parse(json);
}

const rows = loadWordRows().map((row) => {
  const word = String(row.word).toLowerCase();
  const path = row.path?.startsWith("/") ? row.path : `/${row.category}/${encodeURIComponent(word)}/`;
  return [word, path];
});
rows.sort((a, b) => a[0].localeCompare(b[0]));

const payload = {
  v: 1,
  n: rows.length,
  w: rows,
};

const json = JSON.stringify(payload);
const outJson = join(ROOT, "assets/word-paths.json");
writeFileSync(outJson, json);

const gz = gzipSync(json, { level: 9 });
writeFileSync(join(ROOT, "assets/word-paths.json.gz"), gz);
writeFileSync(join(ROOT, "public/assets/word-paths.json"), json);
writeFileSync(join(ROOT, "public/assets/word-paths.json.gz"), gz);

console.log(
  `Wrote assets/word-paths.json (${rows.length} words, ${(json.length / 1024 / 1024).toFixed(2)} MB, gzip ${(gz.length / 1024 / 1024)