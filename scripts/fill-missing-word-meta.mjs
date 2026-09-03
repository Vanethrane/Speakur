/**
 * Fill missing IPA + definitions on static word pages (source: HTML at category/word/).
 *
 * Sources (ranked): dictionaryapi.dev → Wiktionary → Datamuse
 * Progress: data/fill-meta-progress.json
 * Chart: research/ipa-definition-sources.md (+ append-only JSONL log)
 *
 * Usage:
 *   node scripts/fill-missing-word-meta.mjs --resume --delay=1200
 *   node scripts/fill-missing-word-meta.mjs --retry-failed --limit=100
 *   node scripts/fill-missing-word-meta.mjs --category=food --limit=50
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from "fs";
import { join } from "path";
import { lookupWord, syllableCount } from "./lib/word-html.mjs";

const ROOT = process.cwd();
const catalog = JSON.parse(readFileSync(join(ROOT, "data/catalog.json"), "utf8"));
const PROGRESS_PATH = join(ROOT, "data/fill-meta-progress.json");
const CHART_PATH = join(ROOT, "research/ipa-definition-sources.md");
const LOG_PATH = join(ROOT, "research/ipa-definition-fill-log.jsonl");

const args = process.argv.slice(2);
const opt = Object.fromEntries(
  args
    .filter((a) => a.startsWith("--"))
    .map((a) => {
      const [k, v] = a.replace(/^--/, "").split("=");
      return [k, v === undefined ? true : v];
    }),
);

const DELAY_MS = Number(opt.delay || 1200);
const LIMIT = opt.limit ? Number(opt.limit) : Infinity;
const ONLY_CAT = opt.category ? String(opt.category) : null;
const RESUME = Boolean(opt.resume);
const RETRY_FAILED = Boolean(opt["retry-failed"]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function escapeHtml(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function loadProgress() {
  if ((!RESUME && !RETRY_FAILED) || !existsSync(PROGRESS_PATH)) {
    return {
      done: {},
      updated: 0,
      skipped: 0,
      failed: 0,
      sources: {},
      startedAt: new Date().toISOString(),
    };
  }
  try {
    return JSON.parse(readFileSync(PROGRESS_PATH, "utf8"));
  } catch {
    return {
      done: {},
      updated: 0,
      skipped: 0,
      failed: 0,
      sources: {},
      startedAt: new Date().toISOString(),
    };
  }
}

function saveProgress(progress) {
  mkdirSync(join(ROOT, "data"), { recursive: true });
  progress.updatedAt = new Date().toISOString();
  writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2));
}

function ensureChart() {
  mkdirSync(join(ROOT, "research"), { recursive: true });
  if (existsSync(CHART_PATH)) return;
  writeFileSync(
    CHART_PATH,
    `# IPA & definition source chart

Running log of how Speakur fills missing pronunciation (IPA) and definitions on existing word pages.

## Source ranking (prefer first)

| Rank | Source | What it gives | Reliability | Notes |
| --- | --- | --- | --- | --- |
| 1 | [Free Dictionary API](https://dictionaryapi.dev/) (\`api.dictionaryapi.dev\`) | IPA + definitions + audio URLs | High for common EN lemmas | Primary; occasional 404s on rare/inflected forms |
| 2 | [Wiktionary](https://en.wiktionary.org/) (REST defs + parse wikitext \`{{IPA\\|en\\|...}}\`) | IPA + glosses | High (community-reviewed) | Best for rare food/medical/proper forms; rate-limit politely |
| 3 | [Datamuse](https://www.datamuse.com/api/) | Definitions (WordNet-ish) | Medium | Weak/no IPA; last resort for sense text |
| 4 | Manual / editorial | Both | Highest | Use for showcase / disputed lemmas |

## How pages are updated

- **Source of truth for generated pages:** \`scripts/lib/word-html.mjs\` + \`data/catalog.json\`
- **In-place fill for existing HTML:** \`scripts/fill-missing-word-meta.mjs\` (this chart’s runner)
- **Scan gaps:** \`node scripts/scan-missing-word-meta.mjs\` → \`data/missing-meta-scan.json\`

## Session log

Append-only machine log: [\`ipa-definition-fill-log.jsonl\`](./ipa-definition-fill-log.jsonl)

| When (UTC) | Word path | IPA? | Def? | Source(s) | Notes |
| --- | --- | --- | --- | --- |
`,
  );
}

function appendChartRow({ key, ipa, def, sources, note }) {
  ensureChart();
  const when = new Date().toISOString();
  const src = (sources || []).join(", ") || "—";
  appendFileSync(
    CHART_PATH,
    `| ${when} | \`${key}\` | ${ipa ? "yes" : "no"} | ${def ? "yes" : "no"} | ${src} | ${note || ""} |\n`,
  );
  appendFileSync(
    LOG_PATH,
    JSON.stringify({ when, key, ipa: !!ipa, def: !!def, sources: sources || [], note: note || "" }) + "\n",
  );
}

function needsWork(html) {
  const ipaMatch = html.match(/<p class="ipa"[^>]*>([\s\S]*?)<\/p>/);
  const ipaText = ipaMatch ? ipaMatch[1].replace(/<[^>]+>/g, "").trim() : "";
  const missingIpa =
    !ipaText ||
    /phonetic spelling unavailable|ipa unavailable/i.test(ipaText) ||
    ipaText === "—" ||
    ipaText === "-";
  const missingDefs =
    html.includes("Definition lookup was unavailable") ||
    !/<p class="def">/.test(html);
  const missingSyllables = !/<dt>Syllables<\/dt>/.test(html);
  return {
    missingIpa,
    missingDefs,
    missingSyllables,
    any: missingIpa || missingDefs || missingSyllables,
  };
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

function patchPage(filePath, html, { entry, syllables, missingIpa, missingDefs, missingSyllables }) {
  let next = html;
  let changed = false;
  let gotIpa = false;
  let gotDef = false;

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

  if (entry && (missingIpa || missingDefs)) {
    const phonetic =
      entry.phonetic || entry.phonetics?.find((p) => p.text)?.text || null;
    const meanings = meaningsFromEntry(entry);

    if (missingIpa && phonetic) {
      if (/<p class="ipa"[^>]*>[\s\S]*?<\/p>/.test(next)) {
        next = next.replace(
          /<p class="ipa"[^>]*>[\s\S]*?<\/p>/,
          `<p class="ipa" lang="en-fonipa">${escapeHtml(phonetic)}</p>`,
        );
      } else {
        next = next.replace(
          /(<h1>[^<]*<\/h1>)/,
          `$1\n            <p class="ipa" lang="en-fonipa">${escapeHtml(phonetic)}</p>`,
        );
      }
      gotIpa = true;
      changed = true;
    }

    if (missingDefs && meanings.length) {
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
      gotDef = true;
      changed = true;
    }
  }

  if (changed) writeFileSync(filePath, next);
  return { changed, gotIpa, gotDef };
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

function shouldSkip(progress, key) {
  const prev = progress.done[key];
  if (!prev) return false;
  if (RETRY_FAILED && (prev === "no-data" || String(prev).startsWith("error:"))) return false;
  if (RESUME && prev) return true;
  return Boolean(prev);
}

async function main() {
  ensureChart();
  const progress = loadProgress();
  if (!progress.sources) progress.sources = {};
  const jobs = collectJobs();
  console.log(
    `Scanning ${jobs.length} pages (delay=${DELAY_MS}ms, limit=${LIMIT === Infinity ? "none" : LIMIT}, resume=${RESUME}, retryFailed=${RETRY_FAILED})`,
  );

  let processed = 0;
  for (const job of jobs) {
    if (processed >= LIMIT) break;
    if (shouldSkip(progress, job.key)) continue;

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
      `[${processed}] /${job.key}/ ipa=${need.missingIpa} defs=${need.missingDefs} syl=${need.missingSyllables} ... `,
    );

    let entry = null;
    let syllables = null;
    let looked = null;
    try {
      if (need.missingIpa || need.missingDefs) {
        looked = await lookupWord(job.word);
        entry = looked.ok ? looked.entry : null;
      }
      if (need.missingSyllables) {
        syllables = await syllableCount(job.word);
      }
      const result = patchPage(job.filePath, html, {
        entry,
        syllables,
        missingIpa: need.missingIpa,
        missingDefs: need.missingDefs,
        missingSyllables: need.missingSyllables,
      });
      const sources = looked?.sources || (looked?.source ? [looked.source] : entry?.source ? [entry.source] : []);
      if (result.changed) {
        progress.updated += 1;
        progress.done[job.key] = "updated";
        for (const s of sources) {
          progress.sources[s] = (progress.sources[s] || 0) + 1;
        }
        appendChartRow({
          key: job.key,
          ipa: result.gotIpa || !need.missingIpa,
          def: result.gotDef || !need.missingDefs,
          sources,
          note: looked?.notes?.map((n) => `${n.source}:${n.result}`).join("; ") || "patched",
        });
        console.log(`updated [${sources.join("+") || "syl"}]`);
      } else {
        progress.failed += 1;
        progress.done[job.key] = "no-data";
        appendChartRow({
          key: job.key,
          ipa: false,
          def: false,
          sources: [],
          note: looked?.notes?.map((n) => `${n.source}:${n.result}`).join("; ") || "no-data",
        });
        console.log("no-data");
      }
    } catch (err) {
      progress.failed += 1;
      progress.done[job.key] = `error:${err.message}`;
      appendChartRow({
        key: job.key,
        ipa: false,
        def: false,
        sources: [],
        note: `error:${err.message}`,
      });
      console.log(`error ${err.message}`);
    }

    saveProgress(progress);
    await sleep(DELAY_MS);
  }

  saveProgress(progress);
  console.log(
    `Done. updated=${progress.updated} skipped=${progress.skipped} failed=${progress.failed}`,
  );
  console.log(`Sources tally:`, progress.sources);
  console.log(`Progress: ${PROGRESS_PATH}`);
  console.log(`Chart: ${CHART_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
