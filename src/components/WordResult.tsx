import { PlayButton } from "./PlayButton";
import type { PronounceResult } from "@/lib/types";

const ACCENT_LABEL = {
  us: "US",
  uk: "UK",
  other: "Audio",
} as const;

const ACCENT_LANG = {
  us: "en-US",
  uk: "en-GB",
  other: "en-US",
} as const;

type WordResultProps = {
  result: PronounceResult;
};

export function WordResult({ result }: WordResultProps) {
  const freeClips = result.phonetics.filter((item) => item.audio);
  const usFree = freeClips.find((item) => item.accent === "us")?.audio ?? null;
  const ukFree = freeClips.find((item) => item.accent === "uk")?.audio ?? null;
  const primaryFree = usFree ?? ukFree ?? freeClips[0]?.audio ?? null;
  const primaryLang = usFree ? "us" : ukFree ? "uk" : freeClips[0]?.accent ?? "us";

  return (
    <article className="rounded-[28px] border border-paper-line bg-paper-raised p-8 shadow-card">
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-voice">
        Pronunciation
      </p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl tracking-tight text-ink sm:text-6xl">
            {result.word}
          </h1>
          <p className="mt-3 font-display text-2xl text-ink-muted">
            {result.phonetic ?? "Phonetic spelling unavailable"}
          </p>
        </div>
        <PlayButton
          label="Play"
          word={result.word}
          freeAudioUrl={primaryFree}
          lang={ACCENT_LANG[primaryLang]}
          voice={primaryLang === "uk" ? "uk" : "us"}
          useStudioVoice={!primaryFree}
        />
      </div>

      <dl className="mt-6 flex flex-wrap gap-6 text-sm text-ink-muted">
        {result.syllables ? (
          <div>
            <dt className="uppercase tracking-wide">Syllables</dt>
            <dd className="mt-1 text-lg text-ink">
              {result.syllables}
              {result.hyphenation ? ` · ${result.hyphenation}` : ""}
            </dd>
          </div>
        ) : null}
        {result.phonetics.some((item) => item.text) ? (
          <div>
            <dt className="uppercase tracking-wide">IPA</dt>
            <dd className="mt-1 text-lg text-ink">
              {result.phonetics
                .filter((item) => item.text)
                .map((item) => item.text)
                .filter((value, index, list) => list.indexOf(value) === index)
                .join("  ·  ")}
            </dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-8 flex flex-wrap gap-3">
        <PlayButton
          label="US (free)"
          word={result.word}
          freeAudioUrl={usFree}
          lang="en-US"
          voice="us"
          useStudioVoice={!usFree}
        />
        <PlayButton
          label="UK (free)"
          word={result.word}
          freeAudioUrl={ukFree}
          lang="en-GB"
          voice="uk"
          useStudioVoice={!ukFree}
        />
        <PlayButton
          label="Slow"
          word={result.word}
          freeAudioUrl={primaryFree}
          rate={0.72}
          lang={ACCENT_LANG[primaryLang]}
          voice={primaryLang === "uk" ? "uk" : "us"}
          useStudioVoice={!primaryFree}
        />
      </div>

      <p className="mt-4 text-xs text-ink-muted">
        Audio uses free dictionary clips when available, otherwise free on-demand TTS — generated
        only when you click Play, then cached. Browser speech is the final $0 fallback.
      </p>

      {result.meanings.length > 0 && (
        <section className="mt-10 border-t border-paper-line pt-8">
          <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-ink-muted">
            Meaning
          </h2>
          <ul className="mt-4 space-y-5">
            {result.meanings.map((sense, index) => (
              <li key={`${sense.partOfSpeech}-${index}`}>
                <p className="text-xs font-semibold uppercase tracking-wide text-voice">
                  {sense.partOfSpeech}
                </p>
                <p className="mt-1 text-lg leading-relaxed text-ink">{sense.definition}</p>
                {sense.example ? (
                  <p className="mt-2 text-ink-muted">“{sense.example}”</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
