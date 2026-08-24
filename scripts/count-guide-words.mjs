import { readFileSync } from "fs";

/**
 * Rough word count: for each guide slug, take the guide object text from parts
 * plus matching expansion block.
 */
function wordsIn(text) {
  return text
    .replace(/[^a-zA-Z0-9'\-\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function splitBySlug(src, slugPattern) {
  const map = new Map();
  const re = new RegExp(slugPattern, "g");
  const indices = [];
  let m;
  while ((m = re.exec(src))) {
    indices.push({ slug: m[1], index: m.index });
  }
  for (let i = 0; i < indices.length; i++) {
    const start = indices[i].index;
    const end = i + 1 < indices.length ? indices[i + 1].index : src.length;
    map.set(indices[i].slug, src.slice(start, end));
  }
  return map;
}

const base = new Map();
for (const file of [
  "src/content/guides-part-a.ts",
  "src/content/guides-part-b.ts",
  "src/content/guides-part-c.ts",
]) {
  const src = readFileSync(file, "utf8");
  for (const [slug, block] of splitBySlug(src, String.raw`slug:\s*"([a-z0-9-]+)"`)) {
    base.set(slug, block);
  }
}

const expSrc =
  readFileSync("src/content/guide-expansions.ts", "utf8") +
  "\n" +
  readFileSync("src/content/guide-expansions-b.ts", "utf8") +
  "\n" +
  readFileSync("src/content/guide-expansions-c.ts", "utf8");
const expansions = splitBySlug(expSrc, String.raw`"([a-z0-9-]+)":\s*\[`);

const rows = [];
for (const slug of base.keys()) {
  const text = (base.get(slug) || "") + "\n" + (expansions.get(slug) || "");
  rows.push({ slug, words: wordsIn(text) });
}
rows.sort((a, b) => a.words - b.words);
console.log("guides", rows.length);
for (const r of rows) console.log(r.words, r.slug);
const under = rows.filter((r) => r.words < 800);
console.log("under800", under.map((r) => `${r.slug}:${r.words}`));
