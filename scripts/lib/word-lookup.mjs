/**
 * Multi-source word lookup: Free Dictionary API → Wiktionary → Datamuse.
 */
import { fetchJson } from "./fetch-json.mjs";

function stripIpaBrackets(s) {
  return String(s || "")
    .replace(/^\/+|\/+$/g, "")
    .trim();
}

export function normalizeIpa(raw) {
  let s = String(raw || "").trim();
  if (!s) return "";
  const m = s.match(/\/[^/\n]+\/|\[[^\]\n]+\]/);
  if (m) s = m[0];
  s = s.replace(/^\[|\]$/g, "");
  if (!s.startsWith("/")) s = `/${stripIpaBrackets(s)}/`;
  return s;
}

function englishWikitextSlice(wt) {
  const text = String(wt || "");
  // Level-2 English section only; stop at next level-2 heading (==Word==), not ===Sub===.
  const m = text.match(
    /==\s*English\s*==\s*\n([\s\S]*?)(?=\n==(?!=)[^\n]*==\s*(?:\n|$)|$)/i,
  );
  if (m) return m[1];
  return text.slice(0, 20000);
}

async function lookupFreeDictionary(word) {
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
  const primary = await fetchJson(url);
  if (primary.ok && Array.isArray(primary.data) && primary.data[0]) {
    return {
      ok: true,
      entry: {
        ...primary.data[0],
        source: "dictionaryapi.dev",
        reliability: "high",
      },
      source: "dictionaryapi.dev",
    };
  }
  return {
    ok: false,
    status: primary.status,
    reason: primary.status === 404 ? "not_found" : "upstream",
  };
}

async function lookupWiktionary(word) {
  const defUrl = `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`;
  const defs = await fetchJson(defUrl, {
    headers: { Accept: "application/json", "User-Agent": "SpeakurBot/1.0 (pronunciation research; contact@speakur.com)" },
  });

  const byPos = new Map();
  if (defs.ok && defs.data && typeof defs.data === "object") {
    for (const block of defs.data.en || []) {
      const pos = (block.partOfSpeech || "unknown").toLowerCase();
      if (!byPos.has(pos)) byPos.set(pos, []);
      for (const d of block.definitions || []) {
        const text = String(d.definition || "")
          .replace(/<[^>]+>/g, "")
          .replace(/\s+/g, " ")
          .trim();
        if (!text) continue;
        byPos.get(pos).push({ definition: text });
        if ([...byPos.values()].reduce((n, a) => n + a.length, 0) >= 5) break;
      }
      if ([...byPos.values()].reduce((n, a) => n + a.length, 0) >= 5) break;
    }
  }

  const parseUrl =
    `https://en.wiktionary.org/w/api.php?action=parse&page=${encodeURIComponent(word)}` +
    `&prop=wikitext&format=json&redirects=1`;
  const parsed = await fetchJson(parseUrl, {
    headers: { "User-Agent": "SpeakurBot/1.0 (pronunciation research; contact@speakur.com)" },
  });

  let phonetic = "";
  const phonetics = [];
  if (parsed.ok && parsed.data?.parse?.wikitext?.["*"]) {
    const enSection = englishWikitextSlice(parsed.data.parse.wikitext["*"]);
    const ipaRe = /\{\{(?:IPA\|en\|([^}]+)|IPA\|([^}|]+)\|lang=en)\}\}/gi;
    let match;
    while ((match = ipaRe.exec(enSection)) !== null) {
      const payload = match[1] || match[2] || "";
      const parts = payload
        .split("|")
        .map((p) => p.trim())
        .filter(Boolean);
      for (const part of parts) {
        if (/^(a|qual|qual2|q)=/i.test(part)) continue;
        if (!/[\/\[]/.test(part) && !/[\u0250-\u02AF\u1D00-\u1DBFˈˌː]/.test(part)) continue;
        const ipa = normalizeIpa(part);
        if (ipa && ipa.length > 2) {
          phonetics.push({ text: ipa, source: "wiktionary" });
          if (!phonetic) phonetic = ipa;
        }
      }
      if (phonetics.length >= 4) break;
    }
    // Also catch bare /.../ lines under Pronunciation when templates are missing
    if (!phonetic) {
      const bare = enSection.match(/Pronunciation[\s\S]{0,800}?(\/[^\n\/]{2,80}\/)/i);
      if (bare) {
        phonetic = normalizeIpa(bare[1]);
        if (phonetic) phonetics.push({ text: phonetic, source: "wiktionary-bare" });
      }
    }
  }

  const meanings = [...byPos.entries()].map(([partOfSpeech, definitions]) => ({
    partOfSpeech,
    definitions,
  }));

  if (!meanings.length && !phonetic) {
    return { ok: false, reason: "not_found" };
  }

  return {
    ok: true,
    source: "wiktionary",
    entry: {
      word,
      phonetic,
      phonetics,
      meanings,
      source: "wiktionary",
      reliability: "high",
    },
  };
}

async function lookupDatamuse(word) {
  const dm = await fetchJson(
    `https://api.datamuse.com/words?sp=${encodeURIComponent(word)}&qe=sp&md=dpsr&max=1`,
  );
  if (!dm.ok || !Array.isArray(dm.data) || !dm.data[0]) {
    return { ok: false, reason: "not_found" };
  }
  const row = dm.data[0];
  if (String(row.word || "").toLowerCase() !== String(word).toLowerCase()) {
    return { ok: false, reason: "not_found" };
  }
  const defs = row.defs || [];
  if (!defs.length) return { ok: false, reason: "not_found" };

  const byPos = new Map();
  for (const line of defs.slice(0, 8)) {
    const tab = line.indexOf("\t");
    const pos = tab === -1 ? "unknown" : line.slice(0, tab);
    const definition = tab === -1 ? line : line.slice(tab + 1);
    if (!definition) continue;
    if (!byPos.has(pos)) byPos.set(pos, []);
    byPos.get(pos).push({ definition });
  }
  const meanings = [...byPos.entries()].map(([partOfSpeech, definitions]) => ({
    partOfSpeech,
    definitions,
  }));

  return {
    ok: true,
    source: "datamuse",
    entry: {
      word,
      phonetic: "",
      phonetics: [],
      meanings,
      source: "datamuse",
      reliability: "medium",
    },
  };
}

function mergePhonetics(primary, secondary) {
  if (!primary?.entry || !secondary?.entry) return primary;
  const hasIpa =
    primary.entry.phonetic || (primary.entry.phonetics || []).some((p) => p.text);
  if (hasIpa) return primary;
  if (secondary.entry.phonetic || (secondary.entry.phonetics || []).length) {
    return {
      ...primary,
      entry: {
        ...primary.entry,
        phonetic: secondary.entry.phonetic || "",
        phonetics: [
          ...(primary.entry.phonetics || []),
          ...(secondary.entry.phonetics || []),
        ],
        ipaSource: secondary.source,
      },
      sources: [...new Set([primary.source, secondary.source].filter(Boolean))],
    };
  }
  return primary;
}

/** Ranked lookup. Prefer dictionaryapi → wiktionary → datamuse. */
export async function lookupWordMulti(word) {
  const w = String(word || "")
    .trim()
    .toLowerCase();
  if (!w) return { ok: false, reason: "empty" };

  const notes = [];
  const free = await lookupFreeDictionary(w);
  if (free.ok) {
    notes.push({ source: "dictionaryapi.dev", result: "hit" });
    const hasIpa =
      free.entry.phonetic || (free.entry.phonetics || []).some((p) => p.text);
    if (!hasIpa) {
      const wt = await lookupWiktionary(w);
      notes.push({
        source: "wiktionary",
        result: wt.ok ? (wt.entry.phonetic ? "ipa" : "partial") : wt.reason || "miss",
      });
      if (wt.ok) return { ...mergePhonetics(free, wt), notes };
    }
    return { ...free, notes };
  }
  notes.push({ source: "dictionaryapi.dev", result: free.reason || "miss" });

  const wt = await lookupWiktionary(w);
  if (wt.ok) {
    notes.push({ source: "wiktionary", result: "hit" });
    return { ...wt, notes };
  }
  notes.push({ source: "wiktionary", result: wt.reason || "miss" });

  const dm = await lookupDatamuse(w);
  if (dm.ok) {
    notes.push({ source: "datamuse", result: "hit" });
    return { ...dm, notes };
  }
  notes.push({ source: "datamuse", result: dm.reason || "miss" });
  return { ok: false, reason: "not_found", notes };
}
