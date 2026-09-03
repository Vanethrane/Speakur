import { fetchJson } from "./lib/fetch-json.mjs";

const word = process.argv[2] || "arepa";
const parseUrl =
  `https://en.wiktionary.org/w/api.php?action=parse&page=${encodeURIComponent(word)}` +
  `&prop=wikitext&format=json&redirects=1`;
const parsed = await fetchJson(parseUrl, {
  headers: { "User-Agent": "SpeakurBot/1.0 (pronunciation research)" },
});
const wt = parsed.data?.parse?.wikitext?.["*"] || "";
const m = wt.match(/==\s*English\s*==\s*\n([\s\S]*?)(?=\n==(?!=)[^\n]*==\s*(?:\n|$)|$)/i);
const en = m ? m[1] : wt.slice(0, 8000);
console.log("ok", parsed.ok, "hasEnglish", !!m, "len", en.length);
const lines = en.split(/\n/).filter((l) => /IPA|pron|\/.+\/|enPR|audio/i.test(l)).slice(0, 40);
console.log(lines.join("\n"));
