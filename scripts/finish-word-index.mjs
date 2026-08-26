/**
 * Finish word-index.js + generated-paths.json from catalog.json
 * (used when generate-word-pages fails only on the final index write).
 */
import { readFileSync, writeFileSync, renameSync, unlinkSync, existsSync } from "fs";
import { join } from "path";
import { execFileSync } from "child_process";

const ROOT = process.cwd();
const catalog = JSON.parse(readFileSync(join(ROOT, "data/catalog.json"), "utf8"));
const flat = [];
const allPaths = [];

for (const category of catalog.categories) {
  allPaths.push(`/${category.slug}/`);
  for (const word of category.words) {
    const w = String(word).toLowerCase();
    flat.push({
      word: w,
      category: category.slug,
      path: `/${category.slug}/${w}/`,
    });
    allPaths.push(`/${category.slug}/${w}/`);
  }
}

const indexPath = join(ROOT, "assets/word-index.js");
const tmpPath = join(ROOT, "assets/word-index.js.tmp");
const body = `window.SPEAKUR_WORD_INDEX = ${JSON.stringify(flat, null, 2)};\n`;

writeFileSync(tmpPath, body);
if (existsSync(indexPath)) {
  try {
    unlinkSync(indexPath);
  } catch {
    /* locked — try overwrite via rename anyway */
  }
}
try {
  renameSync(tmpPath, indexPath);
} catch {
  writeFileSync(indexPath, body);
  if (existsSync(tmpPath)) unlinkSync(tmpPath);
}

const pathsTmp = join(ROOT, "data/generated-paths.json.tmp");
const pathsBody = JSON.stringify(allPaths, null, 2);
writeFileSync(pathsTmp, pathsBody);
const pathsFinal = join(ROOT, "data/generated-paths.json");
if (existsSync(pathsFinal)) {
  try {
    unlinkSync(pathsFinal);
  } catch {
    /* ignore lock */
  }
}
try {
  renameSync(pathsTmp, pathsFinal);
} catch {
  writeFileSync(pathsFinal, pathsBody);
  if (existsSync(pathsTmp)) unlinkSync(pathsTmp);
}

console.log(`Wrote word-index (${flat.length}) and generated-paths (${allPaths.length})`);

try {
  execFileSync(process.execPath, [join(ROOT, "scripts/build-word-lookup.mjs")], {
    stdio: "inherit",
  });
} catch {
  console.warn("Warning: build-word-lookup.mjs failed — run npm run word-lookup");
}
