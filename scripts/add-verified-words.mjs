/**
 * Add only real dictionary-verified words missing from the catalog.
 * Requires definitions + syllable count (dictionaryapi with retries, Datamuse fallback).
 *
 * Usage:
 *   node scripts/add-verified-words.mjs --limit=100 --delay=1800 --seed=google-100k.txt
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import {
  syllableCount,
  guessCategory,
  renderWordPage,
  renderCategoryPage,
  renderWordsHub,
} from "./lib/word-html.mjs";

const ROOT = process.cwd();
const args = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((a) => a.startsWith("--"))
    .map((a) => {
      const [k, v] = a.replace(/^--/, "").split("=");
      return [k, v === undefined ? true : v];
    }),
);
const LIMIT = Number(args.limit || 100);
const DELAY = Number(args.delay || 1800);
const SEED_NAME = String(args.seed || "google-100k.txt");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const BLOCK = new Set([
  "ass", "shit", "damn", "hell", "crap", "piss", "slut", "whore", "fuck", "fucking",
  "bastard", "bitch", "dick", "cock", "pussy", "sex", "sexy", "porn", "nude", "naked",
]);
const STOP = new Set(
  `a an the and or but if of to in on for at by is are was were be been am do does did
  i you he she it we they my your his her its our their this that these those with from as
  into about over after before between through during without within along across not no yes
  so than then when where who what which how why all any both each few more most other some
  such only own same too very can will just should now also back even still well new one two
  first last long great little old right big high different small large next early young
  important public bad able out up down off again further once here there com org net www
  http https html pdf jpg png gif`.split(/\s+/),
);

const CURATED = [
  ["bouillabaisse", "food"], ["otolaryngology", "medical"], ["gastroenterology", "medical"],
  ["synecdoche", "arts"], ["fjord", "nature"], ["axolotl", "animals"], ["narwhal", "animals"],
  ["albuquerque", "places"], ["marseille", "places"], ["amortization", "business"],
  ["fiduciary", "business"], ["taekwondo", "sports"], ["persephone", "mythology"],
  ["anubis", "mythology"], ["saoirse", "names"], ["cillian", "names"], ["fathom", "everyday"],
];

function normalize(word) {
  return String(word)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z'-]/g, "");
}

function isUsefulCandidate(word) {
  if (!word || word.length < 5 || word.length > 28) return false;
  if (!/^[a-z]+(?:'[a-z]+)?$/.test(word)) return false;
  if (BLOCK.has(word) || STOP.has(word)) return false;
  return true;
}

function loadCatalog() {
  return JSON.parse(readFileSync(join(ROOT, "data/catalog.json"), "utf8"));
}

function saveCatalog(catalog) {
  writeFileSync(join(ROOT, "data/catalog.json"), JSON.stringify(catalog, null, 2) + "\n");
}

function existingSet(catalog) {
  const set = new Set();
  for (const cat of catalog.categories) {
    for (const w of cat.words) set.add(String(w).toLowerCase());
  }
  return set;
}

function loadSeedWords(existing) {
  const path = join(ROOT, "data/seeds", SEED_NAME);
  if (!existsSync(path)) return [];
  const out = [];
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const word = normalize(line.split(/[\s,]/)[0] || "");
    if (!isUsefulCandidate(word) || existing.has(word)) continue;
    out.push(word);
  }
  return out;
}

async function fetchJson(url, tries = 5) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url);
      if (res.status === 404) return { ok: false, reason: "not_found" };
      if (res.status === 429 || res.status >= 500) {
        await sleep(2500 * (i + 1));
        continue;
      }
      if (!res.ok) return { ok: false, reason: "upstream", status: res.status };
      return { ok: true, data: await res.json() };
    } catch {
      await sleep(1500 * (i + 1));
    }
  }
  return { ok: false, reason: "upstream" };
}

async function verifyWord(word) {
  const dict = await fetchJson(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
  );
  if (dict.ok && Array.isArray(dict.data) && dict.data[0]) {
    const entry = dict.data[0];
    let hasDef = false;
    for (const m of entry.meanings || []) {
      for (const d of m.definitions || []) {
        if (d.definition) {
          hasDef = true;
          break;
        }
      }
      if (hasDef) break;
    }
    if (hasDef) {
      let syllables = await syllableCount(word);
      if (!syllables) {
        const dm = await fetchJson(
          `https://api.datamuse.com/words?sp=${encodeURIComponent(word)}&qe=sp&md=s&max=1`,
        );
        syllables = dm.ok ? dm.data?.[0]?.numSyllables : null;
      }
      if (syllables && Number(syllables) > 0) {
        return { ok: true, entry, syllables: Number(syllables), source: "dictionaryapi" };
      }
    }
  }

  const dm = await fetchJson(
    `https://api.datamuse.com/words?sp=${encodeURIComponent(word)}&qe=sp&md=ds&max=1`,
  );
  if (!dm.ok || !Array.isArray(dm.data) || !dm.data[0]) {
    return { ok: false, reason: dict.reason || "not_found" };
  }
  const row = dm.data[0];
  if (String(row.word || "").toLowerCase() !== word) return { ok: false, reason: "mismatch" };
  const defs = row.defs || [];
  const syllables = row.numSyllables;
  if (!defs.length || !syllables) return { ok: false, reason: "incomplete" };

  const meanings = defs.slice(0, 5).map((line) => {
    const [pos, ...rest] = String(line).split("\t");
    return {
      partOfSpeech: pos || "unknown",
      definitions: [{ definition: rest.join("\t") || String(line) }],
    };
  });
  return {
    ok: true,
    entry: { word, meanings, phonetics: [], phonetic: "" },
    syllables: Number(syllables),
    source: "datamuse",
  };
}

function refreshHubs(catalog) {
  mkdirSync(join(ROOT, "words"), { recursive: true });
  writeFileSync(join(ROOT, "words", "index.html"), renderWordsHub(catalog.categories));
  for (const category of catalog.categories) {
    const words = [...new Set(category.words.map((w) => w.toLowerCase()))].sort();
    mkdirSync(join(ROOT, category.slug), { recursive: true });
    writeFileSync(join(ROOT, category.slug, "index.html"), renderCategoryPage(category, words));
  }
}

function writeWordIndex(catalog) {
  const flat = [];
  for (const category of catalog.categories) {
    for (const word of category.words) {
      flat.push({
        word: word.toLowerCase(),
        category: category.slug,
        path: `/${category.slug}/${word.toLowerCase()}/`,
      });
    }
  }
  writeFileSync(
    join(ROOT, "assets/word-index.js"),
    `window.SPEAKUR_WORD_INDEX = ${JSON.stringify(flat)};\n`,
  );
}

async function main() {
  let catalog = loadCatalog();
  const existing = existingSet(catalog);
  const queue = [];
  const seen = new Set();

  for (const [raw, category] of CURATED) {
    const word = normalize(raw);
    if (!isUsefulCandidate(word) || existing.has(word) || seen.has(word)) continue;
    seen.add(word);
    queue.push({ word, category });
  }
  for (const word of loadSeedWords(existing)) {
    if (seen.has(word)) continue;
    seen.add(word);
    queue.push({ word, category: guessCategory(word, catalog) });
  }

  console.log(`Queue size ${queue.length} from curated + ${SEED_NAME} (limit ${LIMIT})`);
  let added = 0;
  let skipped = 0;
  const addedRows = [];

  for (const item of queue) {
    if (added >= LIMIT) break;
    process.stdout.write(`verify ${item.word} ... `);
    try {
      const verified = await verifyWord(item.word);
      if (!verified.ok) {
        console.log(`skip (${verified.reason})`);
        skipped += 1;
        await sleep(DELAY);
        continue;
      }

      catalog = loadCatalog();
      if (existingSet(catalog).has(item.word)) {
        console.log("exists");
        await sleep(DELAY);
        continue;
      }

      let category = catalog.categories.find((c) => c.slug === item.category);
      if (!category) {
        const slug = guessCategory(item.word, catalog);
        category = catalog.categories.find((c) => c.slug === slug);
      }
      if (!category) {
        console.log("fail (no category)");
        skipped += 1;
        await sleep(DELAY);
        continue;
      }

      category.words.push(item.word);
      category.words = [...new Set(category.words.map((w) => w.toLowerCase()))].sort();
      saveCatalog(catalog);

      const pageDir = join(ROOT, category.slug, item.word);
      mkdirSync(pageDir, { recursive: true });
      writeFileSync(
        join(pageDir, "index.html"),
        renderWordPage({
          category,
          word: item.word,
          entry: verified.entry,
          syllables: verified.syllables,
          siblings: category.words,
        }),
      );

      added += 1;
      existing.add(item.word);
      addedRows.push({
        word: item.word,
        path: `/${category.slug}/${item.word}/`,
        syllables: verified.syllables,
        source: verified.source,
      });
      console.log(`added /${category.slug}/${item.word}/ (${verified.syllables} syl, ${verified.source})`);

      // Refresh hubs periodically (not every word — too slow)
      if (added % 10 === 0) {
        refreshHubs(catalog);
        writeWordIndex(catalog);
      }
    } catch (err) {
      console.log(`error ${err.message}`);
      skipped += 1;
    }
    await sleep(DELAY);
  }

  catalog = loadCatalog();
  refreshHubs(catalog);
  writeWordIndex(catalog);

  const logPath = join(ROOT, "data/add-verified-words-log.json");
  writeFileSync(
    logPath,
    JSON.stringify(
      { at: new Date().toISOString(), added, skipped, limit: LIMIT, seed: SEED_NAME, addedRows },
      null,
      2,
    ),
  );
  console.log(`Done. added=${added} skipped=${skipped}. Log: ${logPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
