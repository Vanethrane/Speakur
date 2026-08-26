/**
 * Lightweight catalog sync from add-real-words progress (no hub regen).
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
const PROGRESS = join(ROOT, "data/add-real-words-progress.json");
const CATALOG = join(ROOT, "data/catalog.json");
const ALT = join(ROOT, "data/catalog.sync.json");

function sleepSync(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {}
}

const catalog = JSON.parse(readFileSync(CATALOG, "utf8"));
const bySlug = new Map(catalog.categories.map((c) => [c.slug, c]));
const have = new Set();
for (const c of catalog.categories) {
  for (const w of c.words) have.add(String(w).toLowerCase());
}

const progress = existsSync(PROGRESS)
  ? JSON.parse(readFileSync(PROGRESS, "utf8"))
  : { done: {} };

let synced = 0;
let fixed = 0;
for (const [word, status] of Object.entries(progress.done || {})) {
  const w = String(word).toLowerCase();
  let slug = null;
  const m = /^added:([a-z0-9-]+)$/.exec(String(status));
  if (m) slug = m[1];

  if (!slug && String(status).startsWith("error:")) {
    for (const s of bySlug.keys()) {
      if (existsSync(join(ROOT, s, w, "index.html"))) {
        slug = s;
        progress.done[w] = `added:${s}`;
        fixed += 1;
        break;
      }
    }
  }
  if (!slug) continue;

  const page = join(ROOT, slug, w, "index.html");
  if (!existsSync(page)) continue;
  const html = readFileSync(page, "utf8");
  if (!html.includes("<dt>Syllables</dt>") || !html.includes('class="def"')) continue;

  if (!have.has(w)) {
    const cat = bySlug.get(slug);
    if (!cat) continue;
    cat.words.push(w);
    have.add(w);
    synced += 1;
    console.log(`+ /${slug}/${w}/`);
  }
}

for (const cat of catalog.categories) {
  cat.words = [...new Set(cat.words.map((x) => String(x).toLowerCase()))].sort();
}

const body = JSON.stringify(catalog, null, 2) + "\n";
writeFileSync(ALT, body);
let saved = false;
for (let i = 0; i < 20; i++) {
  try {
    writeFileSync(CATALOG, body);
    saved = true;
    break;
  } catch (err) {
    console.warn(`catalog lock retry ${i + 1}: ${err.message}`);
    sleepSync(400 * (i + 1));
  }
}

progress.added = Object.values(progress.done).filter((v) => String(v).startsWith("added:")).length;
progress.updatedAt = new Date().toISOString();
writeFileSync(PROGRESS, JSON.stringify(progress, null, 2));

console.log(
  `Done. synced=${synced} fixedMarks=${fixed} progressAdded=${progress.added} catalogSaved=${saved} alt=${ALT}`,
);
