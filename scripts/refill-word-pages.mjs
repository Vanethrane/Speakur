/**
 * Re-fetch dictionary data for word pages that were generated without definitions.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import { spawnSync } from "child_process";

const ROOT = process.cwd();
const catalog = JSON.parse(readFileSync(join(ROOT, "data/catalog.json"), "utf8"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function accentFromAudio(audio = "") {
  const lower = audio.toLowerCase();
  if (lower.includes("-us") || lower.includes("_us") || lower.includes("/us/")) return "us";
  if (lower.includes("-uk") || lower.includes("_uk") || lower.includes("/uk/")) return "uk";
  return "other";
}

function escapeHtml(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function lookupWord(word, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
      );
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const entries = await res.json();
      return entries[0] || null;
    } catch (err) {
      await sleep(400 * (i + 1));
      if (i === tries - 1) {
        console.warn(`  still failing ${word}: ${err.message}`);
        return null;
      }
    }
  }
  return null;
}

function patchPage(filePath, word, entry) {
  if (!entry) return false;
  let html = readFileSync(filePath, "utf8");
  if (!html.includes("Definition lookup was unavailable") && !html.includes("Phonetic spelling unavailable")) {
    return false;
  }

  const phonetic =
    entry.phonetic || entry.phonetics?.find((p) => p.text)?.text || "Phonetic spelling unavailable";
  const phonetics = (entry.phonetics || [])
    .map((p) => ({
      accent: p.audio ? accentFromAudio(p.audio) : "other",
      text: p.text || null,
      audio: p.audio || null,
    }))
    .filter((p) => p.text || p.audio);
  const usAudio = phonetics.find((p) => p.accent === "us" && p.audio)?.audio || "";
  const ukAudio = phonetics.find((p) => p.accent === "uk" && p.audio)?.audio || "";
  const anyAudio = usAudio || ukAudio || phonetics.find((p) => p.audio)?.audio || "";
  const ipaList = [...new Set(phonetics.map((p) => p.text).filter(Boolean))];

  const meanings = [];
  for (const meaning of entry.meanings || []) {
    for (const def of meaning.definitions || []) {
      if (!def.definition) continue;
      meanings.push({
        pos: meaning.partOfSpeech || "unknown",
        def: def.definition,
        ex: def.example || null,
      });
      if (meanings.length >= 5) break;
    }
    if (meanings.length >= 5) break;
  }

  html = html.replace(
    /<p class="ipa">[\s\S]*?<\/p>/,
    `<p class="ipa">${escapeHtml(phonetic)}</p>`,
  );

  // Replace play buttons' data-audio attributes in order: main, US, UK, slow
  let n = 0;
  html = html.replace(/data-audio="[^"]*"/g, () => {
    n += 1;
    if (n === 1 || n === 4) return `data-audio="${escapeHtml(anyAudio)}"`;
    if (n === 2) return `data-audio="${escapeHtml(usAudio)}"`;
    if (n === 3) return `data-audio="${escapeHtml(ukAudio)}"`;
    return `data-audio=""`;
  });

  if (ipaList.length) {
    if (html.includes("<dt>IPA</dt>")) {
      html = html.replace(
        /<div><dt>IPA<\/dt><dd>[\s\S]*?<\/dd><\/div>/,
        `<div><dt>IPA</dt><dd>${escapeHtml(ipaList.join(" · "))}</dd></div>`,
      );
    } else {
      html = html.replace(
        /(<div><dt>Path<\/dt>)/,
        `<div><dt>IPA</dt><dd>${escapeHtml(ipaList.join(" · "))}</dd></div>\n          $1`,
      );
    }
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
    html = html.replace(/<section class="meanings">[\s\S]*?<\/section>/, meaningsHtml);
  }

  writeFileSync(filePath, html);
  return true;
}

async function main() {
  let updated = 0;
  for (const category of catalog.categories) {
    for (const word of category.words.map((w) => w.toLowerCase())) {
      const filePath = join(ROOT, category.slug, word, "index.html");
      if (!existsSync(filePath)) continue;
      const html = readFileSync(filePath, "utf8");
      if (!html.includes("Definition lookup was unavailable") && !html.includes('data-audio=""')) {
        continue;
      }
      process.stdout.write(`Refill /${category.slug}/${word}/ ... `);
      const entry = await lookupWord(word);
      if (patchPage(filePath, word, entry)) {
        updated += 1;
        console.log("updated");
      } else {
        console.log(entry ? "skip" : "no data");
      }
      await sleep(250);
    }
  }
  console.log(`Refilled ${updated} pages`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
