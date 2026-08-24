import type { Phonetic, PronounceResult, Sense } from "./types";

type DictionaryPhonetic = {
  text?: string;
  audio?: string;
};

type DictionaryMeaning = {
  partOfSpeech?: string;
  definitions?: Array<{
    definition?: string;
    example?: string;
    synonyms?: string[];
  }>;
};

type DictionaryEntry = {
  word?: string;
  phonetic?: string;
  phonetics?: DictionaryPhonetic[];
  meanings?: DictionaryMeaning[];
};

function accentFromAudio(audio: string): Phonetic["accent"] {
  const lower = audio.toLowerCase();
  if (lower.includes("-us") || lower.includes("_us") || lower.includes("/us/")) {
    return "us";
  }
  if (lower.includes("-uk") || lower.includes("_uk") || lower.includes("/uk/")) {
    return "uk";
  }
  return "other";
}

function uniquePhonetics(items: Phonetic[]): Phonetic[] {
  const seen = new Set<string>();
  const next: Phonetic[] = [];
  for (const item of items) {
    const key = `${item.accent}:${item.audio ?? ""}:${item.text ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    next.push(item);
  }
  return next.sort((a, b) => {
    const rank = { us: 0, uk: 1, other: 2 };
    return rank[a.accent] - rank[b.accent];
  });
}

async function syllableCount(word: string): Promise<number | null> {
  const url = `https://api.datamuse.com/words?sp=${encodeURIComponent(word)}&qe=sp&md=s&max=1`;
  const response = await fetch(url, { next: { revalidate: 86400 } });
  if (!response.ok) return null;
  const data = (await response.json()) as Array<{ word?: string; numSyllables?: number }>;
  const match = data.find((item) => item.word?.toLowerCase() === word.toLowerCase()) ?? data[0];
  return match?.numSyllables ?? null;
}

function hyphenate(word: string, count: number | null): string | null {
  if (!count || count < 2) return word;
  const vowels = /[aeiouy]+/gi;
  const parts: string[] = [];
  let last = 0;
  let found = 0;
  let match: RegExpExecArray | null;
  const source = word.toLowerCase();
  while ((match = vowels.exec(source)) && found < count - 1) {
    if (match.index === 0) continue;
    parts.push(word.slice(last, match.index));
    last = match.index;
    found += 1;
  }
  parts.push(word.slice(last));
  return parts.filter(Boolean).join("·");
}

async function relatedWords(word: string): Promise<string[]> {
  const url = `https://api.datamuse.com/words?ml=${encodeURIComponent(word)}&max=8`;
  try {
    const response = await fetch(url, { next: { revalidate: 86400 } });
    if (!response.ok) return [];
    const data = (await response.json()) as Array<{ word?: string }>;
    return data
      .map((item) => item.word?.toLowerCase())
      .filter((w): w is string => Boolean(w) && w !== word.toLowerCase() && /^[a-z][a-z'-]*$/i.test(w))
      .slice(0, 8);
  } catch {
    return [];
  }
}

export async function lookupPronunciation(query: string): Promise<PronounceResult | null> {
  const word = query.trim().toLowerCase();
  if (!word) return null;

  const dictUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
  const response = await fetch(dictUrl, { next: { revalidate: 86400 } });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error("Pronunciation lookup failed");
  }

  const entries = (await response.json()) as DictionaryEntry[];
  const entry = entries[0];
  if (!entry?.word) return null;

  const phonetics = uniquePhonetics(
    (entry.phonetics ?? [])
      .map((item) => ({
        accent: item.audio ? accentFromAudio(item.audio) : "other",
        text: item.text ?? null,
        audio: item.audio || null,
      }))
      .filter((item) => item.text || item.audio),
  );

  const meanings: Sense[] = [];
  for (const meaning of entry.meanings ?? []) {
    for (const definition of meaning.definitions ?? []) {
      if (!definition.definition) continue;
      meanings.push({
        partOfSpeech: meaning.partOfSpeech ?? "unknown",
        definition: definition.definition,
        example: definition.example ?? null,
        synonyms: definition.synonyms?.slice(0, 6) ?? [],
      });
      if (meanings.length >= 6) break;
    }
    if (meanings.length >= 6) break;
  }

  const [syllables, related] = await Promise.all([
    syllableCount(entry.word),
    relatedWords(entry.word),
  ]);
  const phonetic =
    entry.phonetic ?? phonetics.find((item) => item.text)?.text ?? null;

  return {
    word: entry.word,
    phonetic,
    phonetics,
    syllables,
    hyphenation: hyphenate(entry.word, syllables),
    meanings,
    related,
  };
}

export async function suggestWords(query: string): Promise<{ word: string; score: number }[]> {
  const q = query.trim();
  if (q.length < 1) return [];
  const url = `https://api.datamuse.com/sug?s=${encodeURIComponent(q)}&max=8`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) return [];
  const data = (await response.json()) as Array<{ word: string; score: number }>;
  return data.filter((item) => /^[a-z][a-z'-]*$/i.test(item.word));
}
