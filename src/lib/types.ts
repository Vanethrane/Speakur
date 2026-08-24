export type Phonetic = {
  accent: "us" | "uk" | "other";
  text: string | null;
  audio: string | null;
};

export type Sense = {
  partOfSpeech: string;
  definition: string;
  example: string | null;
  synonyms: string[];
};

export type PronounceResult = {
  word: string;
  phonetic: string | null;
  phonetics: Phonetic[];
  syllables: number | null;
  hyphenation: string | null;
  meanings: Sense[];
  related: string[];
};

export type Suggestion = {
  word: string;
  score: number;
};
