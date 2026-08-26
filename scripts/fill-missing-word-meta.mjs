/**
 * Slowly fill missing definitions + syllable counts on static word pages.
 *
 * Scans catalog word pages for:
 *   - "Definition lookup was unavailable" / empty meanings
 *   - missing <dt>Syllables</dt>
 *
 * Fetches Free Dictionary API + Datamuse with polite delays and checkpointing.
 *
 * Usage:
 *   node scripts/fill-missing-word-meta.mjs
 *   node scripts/fill-missing-word-meta.mjs --delay=2500 --limit=200
 *   node scripts/fill-missing-word-meta.mjs --resume
 *   node scripts/fill-missing-word-meta.mjs --category=food
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { lookupWord, syllableCount } from "./lib/word-html.mjs";

const ROOT = process.cwd();
const catalog = JSON.parse(readFileSync(join(ROOT, "data/catalog.json"), "utf8"));
const PROGRESS_PATH = join(ROOT, "data/fill-meta-progress.json");

const args = process.argv.slice(2);
const opt = Object.fromEntries(
  args
    .filter((a) => a.startsWith("--"))
    .map((a) => {
      const [k, v] = a.replace(/^--/, "").split("=");
      return [k, v === undefined ? true : v];
    }),
);

const DELAY_MS = Number(opt.delay || 2500);
const LIMIT = opt.limit ? Number(opt.limit) : Infinity;
const ONLY_CAT = opt.category ? String(opt.category) : null;
const RESUME = Boolean(opt.resume);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function escapeHtml(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function loadProgress() {
  if (!RESUME || !existsSync(PROGRESS_PATH)) {
    return { done: {}, updated: 0, skipped: 0, failed: 0, startedAt: new Date().toISOString() };
  }
  try {
    return JSON.parse(readFileSync(PROGRESS_PATH, "utf8"));
  } catch {
    return { done: {}, updated: 0, skipped: 0, failed: 0, startedAt: new Date().toISOString() };
  }
}

function saveProgress(progress) {
  mkdirSync(join(ROOT, "data"), { recursive: true });
  progress.updatedAt = new Date().toISOString();
  writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2));
}

function needsWork(html) {
  const missingDefs =
    html.includes("Definition lookup was unavailable") ||
    html.includes("Phonetic spelling unavailable") ||
    !/<section class="meanings">[\s\S]*?<p class="def">/.test(html);
  const missingSyllables = !/<dt>Syllables<\/dt>/.test(html);
  return { missingDefs, missingSyllables, any: missingDefs || missingSyllables };
}

function meaningsFromEntry(entry) {
  const meanings = [];
  for (const meaning of entry.meanings || []) {
    for (const def of meaning.definitions || []) {
      if (!def.definition) continue;
      meanings.push({
        pos: meaning.partOfSpeech || "unknown",
        def: def.definition,
        ex: def.example || null,
      });
      if (meanings.length >= 5) return meanings;
    }
  }
  return meanings;
}

function patchPage(filePath, html, { entry, syllables, missingDefs, missingSyllables }) {
  let next = html;
  let changed = false;

  if (missingSyllables && syllables != null && Number(syllables) > 0) {
    if (/<dt>Syllables<\/dt>/.test(next)) {
      next = next.replace(
        /<div><dt>Syllables<\/dt><dd>[\s\S]*?<\/dd><\/div>/,
        `<div><dt>Syllables</dt><dd>${escapeHtml(String(syllables))}</dd></div>`,
      );
    } else if (/<dl class="meta">/.test(next)) {
      next = next.replace(
        /<dl class="meta">/,
        `<dl class="meta">\n          <div><dt>Syllables</dt><dd>${escapeHtml(String(syllables))}</dd></div>`,
      );
    } else {
      next = next.replace(
        /(<div><dt>Path<\/dt>)/,
        `<div><dt>Syllables</dt><dd>${escapeHtml(String(syllables))}</dd></div>\n          $1`,
      );
    }
    changed = true;
  }

  if (missingDefs && entry) {
    const phonetic =
      entry.phonetic || entry.phonetics?.find((p) => p.text)?.text || null;
    const meanings = meaningsFromEntry(entry);

    if (phonetic) {
      next = next.replace(
        /<p class="ipa">[\s\S]*?<\/p>/,
        `<p class="ipa">${escapeHtml(phonetic)}</p>`,
      );
      changed = true;
    }

    if (meanings.length) {
      const meaningsHtml = `<section class="meanings">
        <h2>Meaning</h2>
        ${meanings
          .map(
            (m) => `<div class="sense">
            <p class="pos">${escapeHtml(m.pos)}</p>
            <p class="def">${escapeHtml(m.def)}</p>
            ${m.ex ? `<p class="ex">“${escapeHtml(m.ex)}”</p>` : ""}
          </div>`,
          )
          .join("")}
      </section>`;
      if (/<section class="meanings">[\s\S]*?<\/section>/.test(next)) {
        next = next.replace(/<section class="meanings">[\s\S]*?<\/section>/, meaningsHtml);
      } else {
        next = next.replace(/<\/main>/, `${meaningsHtml}\n    </main>`);
      }
      changed = true;
    }
  }

  if (changed) writeFileSync(filePath, next);
  return changed;
}

function collectJobs() {
  const jobs = [];
  for (const category of catalog.categories) {
    if (ONLY_CAT && category.slug !== ONLY_CAT) continue;
    for (const raw of category.words) {
      const word = String(raw).toLowerCase();
      const filePath = join(ROOT, category.slug, word, "index.html");
      if (!existsSync(filePath)) continue;
      jobs.push({ key: `${category.slug}/${word}`, category: category.slug, word, filePath });
    }
  }
  return jobs;
}

async function main() {
  const progress = loadProgress();
  const jobs = collectJobs();
  console.log(
    `Scanning ${jobs.length} pages (delay=${DELAY_MS}ms, limit=${LIMIT === Infinity ? "none" : LIMIT}, resume=${RESUME})`,
  );

  let processed = 0;
  for (const job of jobs) {
    if (processed >= LIMIT) break;
    if (progress.done[job.key]) continue;

    const html = readFileSync(job.filePath, "utf8");
    const need = needsWork(html);
    if (!need.any) {
      progress.done[job.key] = "ok";
      progress.skipped += 1;
      if (progress.skipped % 500 === 0) saveProgress(progress);
      continue;
    }

    processed += 1;
    process.stdout.write(
      `[${processed}] /${job.key}/ defs=${need.missingDefs} syl=${need.missingSyllables} ... `,
    );

    let entry = null;
    let syllables = null;
    try {
      if (need.missingDefs) {
        const looked = await lookupWord(job.word);
        entry = looked.ok ? looked.entry : null;
      }
      if (need.missingSyllables) {
        syllables = await syllableCount(job.word);
      }
      const changed = patchPage(job.filePath, html, {
        entry,
        syllables,
        missingDefs: need.missingDefs,
        missingSyllables: need.missingSyllables,
      });
      if (changed) {
        progress.updated += 1;
        progress.done[job.key] = "updated";
        console.log("updated");
      } else {
        progress.failed += 1;
        progress.done[job.key] = "no-data";
        console.log("no-data");
      }
    } catch (err) {
      progress.failed += 1;
      progress.done[job.key] = `error:${err.message}`;
      console.log(`error ${err.message}`);
    }

    saveProgress(progress);
    await sleep(DELAY_MS);
  }

  saveProgress(progress);
  console.log(
    `Done. updated=${progress.updated} skipped=${progress.skipped} failed=${progress.failed}`,
  );
  console.log(`Progress file: ${PROGRESS_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
