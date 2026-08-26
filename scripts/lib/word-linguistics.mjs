/**
 * Lightweight linguistic helpers for word reference pages.
 * Prefer structured IPA/API fields; avoid inventing fake certainty.
 */
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

let _mistakes = null;
export function loadCommonMistakes() {
  if (_mistakes) return _mistakes;
  const p = join(ROOT, "data/common-mistakes.json");
  if (!existsSync(p)) {
    _mistakes = {};
    return _mistakes;
  }
  _mistakes = JSON.parse(readFileSync(p, "utf8"));
  return _mistakes;
}

export function getCommonMistake(word) {
  const key = String(word || "").toLowerCase().trim();
  const map = loadCommonMistakes();
  return map[key] || null;
}

/** Rough IPA → uppercase respelling (THY-bone style). Best-effort only. */
export function respellingFromIpa(ipa = "") {
  let s = String(ipa || "").trim();
  if (!s) return "";
  s = s.replace(/^[/\[\]]+|[/\[\]]+$/g, "");
  // stress markers → syllable breaks later
  const primary = s.includes("ˈ") || s.includes("'");
  s = s
    .replace(/tʃ/g, "ch")
    .replace(/dʒ/g, "j")
    .replace(/θ/g, "th")
    .replace(/ð/g, "dh")
    .replace(/ʃ/g, "sh")
    .replace(/ʒ/g, "zh")
    .replace(/ŋ/g, "ng")
    .replace(/æ/g, "a")
    .replace(/ɑː?/g, "ah")
    .replace(/ɒ/g, "o")
    .replace(/ɔː?/g, "aw")
    .replace(/ə/g, "uh")
    .replace(/ɜː?/g, "ur")
    .replace(/ɪ/g, "i")
    .replace(/iː/g, "ee")
    .replace(/ʊ/g, "oo")
    .replace(/uː/g, "oo")
    .replace(/ʌ/g, "uh")
    .replace(/eɪ/g, "ay")
    .replace(/aɪ/g, "eye")
    .replace(/ɔɪ/g, "oy")
    .replace(/aʊ/g, "ow")
    .replace(/əʊ|oʊ/g, "oh")
    .replace(/ɛ/g, "e")
    .replace(/ˈ|ˌ|'|\.|ː|\/|\[|\]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z\-]/g, "");
  if (!s) return "";
  const parts = s.split(/-+/).filter(Boolean);
  if (!parts.length) return "";
  const labeled = parts.map((p, i) => {
    const up = p.toUpperCase();
    return primary && i === 0 ? up : up.toLowerCase();
  });
  // First chunk uppercase when primary stress known
  if (primary && labeled[0]) labeled[0] = labeled[0].toUpperCase();
  return labeled.join("-");
}

/** Describe stress from IPA primary mark + syllable count. */
export function stressFromIpa(ipa = "", syllableCount = null) {
  const s = String(ipa || "");
  if (!s) {
    if (syllableCount === 1) return "Single syllable";
    return "";
  }
  const cleaned = s.replace(/^[/\[\]]+|[/\[\]]+$/g, "");
  const chunks = cleaned.split(/[.\s]+/).filter(Boolean);
  // Split on stress marks preserving order
  const re = /([ˈ'ˌ])?([^ˈ'ˌ]+)/g;
  const syls = [];
  let m;
  while ((m = re.exec(cleaned.replace(/[.\s]+/g, "")))) {
    if (m[2]) syls.push({ mark: m[1] || "", text: m[2] });
  }
  const primaryIdx = syls.findIndex((x) => x.mark === "ˈ" || x.mark === "'");
  const n = syllableCount || syls.length || chunks.length || null;
  if (primaryIdx >= 0 && n) {
    const ord = primaryIdx + 1;
    const label =
      ord === 1 ? "1st" : ord === 2 ? "2nd" : ord === 3 ? "3rd" : `${ord}th`;
    return `Primary stress on ${label} of ${n} syllable${n === 1 ? "" : "s"}`;
  }
  if (n === 1) return "Single syllable";
  if (n) return `${n} syllables (stress unmarked in source IPA)`;
  return "";
}

/** thigh-bone style breaks when we know syllable count. */
export function hyphenateByCount(word = "", count = null) {
  const w = String(word || "").toLowerCase().replace(/[^a-z']/g, "");
  if (!w) return "";
  const n = Number(count);
  if (!n || n < 2 || n >= w.length) return w;
  // Prefer vowel-centered splits
  const vowels = /[aeiouy]/gi;
  const idxs = [];
  let m;
  while ((m = vowels.exec(w))) {
    idxs.push(m.index);
  }
  if (idxs.length < n) {
    // even character splits as last resort
    const size = Math.ceil(w.length / n);
    const parts = [];
    for (let i = 0; i < w.length; i += size) parts.push(w.slice(i, i + size));
    return parts.filter(Boolean).join("-");
  }
  // Pick split points after vowel nuclei, aiming for n parts
  const cuts = [];
  const step = (idxs.length - 1) / (n - 1);
  for (let i = 1; i < n; i++) {
    const vIdx = idxs[Math.round(i * step)] ?? idxs[idxs.length - 1];
    const cut = Math.min(w.length - 1, vIdx + 1);
    if (!cuts.includes(cut) && cut > 0) cuts.push(cut);
  }
  cuts.sort((a, b) => a - b);
  const parts = [];
  let start = 0;
  for (const cut of cuts) {
    if (cut <= start) continue;
    parts.push(w.slice(start, cut));
    start = cut;
  }
  parts.push(w.slice(start));
  const joined = parts.filter(Boolean).join("-");
  // Reject low-quality breaks (tiny trailing shards)
  const bits = joined.split("-");
  if (bits.some((b) => b.length < 2) || bits.length !== n) return "";
  return joined;
}

export function extractOrigin(entry) {
  const o = entry?.origin || entry?.etymology || "";
  return String(o || "").trim();
}

export function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}
