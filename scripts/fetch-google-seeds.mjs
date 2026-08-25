/**
 * Download Google-derived frequency word lists for catalog expansion.
 * Source: david47k/top-english-wordlists (Google Books n-gram corpus derivatives).
 */
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SEED_DIR = join(ROOT, "data/seeds");

const LISTS = [
  {
    out: "google-50k.txt",
    url: "https://raw.githubusercontent.com/david47k/top-english-wordlists/master/top_english_words_lower_50000.txt",
  },
  {
    out: "google-100k.txt",
    url: "https://raw.githubusercontent.com/david47k/top-english-wordlists/master/top_english_words_lower_100000.txt",
  },
  {
    out: "google-500k.txt",
    url: "https://raw.githubusercontent.com/david47k/top-english-wordlists/master/top_english_words_lower_500000.txt",
  },
];

async function fetchOne({ out, url }) {
  const path = join(SEED_DIR, out);
  if (existsSync(path)) {
    console.log(`${out} already exists — skipping download`);
    return;
  }
  console.log(`Fetching Google frequency list → ${out}…`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  const text = await res.text();
  writeFileSync(path, text);
  const lines = text.split(/\r?\n/).filter(Boolean).length;
  console.log(`Wrote data/seeds/${out} (${lines} lines)`);
}

async function main() {
  mkdirSync(SEED_DIR, { recursive: true });
  for (const list of LISTS) {
    await fetchOne(list);
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
