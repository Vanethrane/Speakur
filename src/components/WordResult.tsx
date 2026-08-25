"use client";

import { useMemo, useState } from "react";
import { ExportShare } from "./ExportShare";
import { PlayButton } from "./PlayButton";
import { QuickCopyButton } from "./QuickCopyButton";
import { StableSlot } from "./StableSlot";
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

function formatCopyText(result: PronounceResult): string {
  const parts = [result.word];
  if (result.phonetic) parts.push(result.phonetic);
  if (result.syllables) parts.push(`(${result.syllables} syllables)`);
  return parts.join(" ");
}

/**
 * Mobile-first pronunciation tool — play controls and copy sit above the fold.
 */
export function WordResult({ result }: WordResultProps) {
  const [playbackRate, setPlaybackRate] = useState(1);

  const freeClips = result.phonetics.filter((item) => item.audio);
  const usFree = freeClips.find((item) => item.accent === "us")?.audio ?? null;
  const ukFree = freeClips.find((item) => item.accent === "uk")?.audio ?? null;
  const primaryFree = usFree ?? ukFree ?? freeClips[0]?.audio ?? null;
  const primaryLang = usFree ? "us" : ukFree ? "uk" : freeClips[0]?.accent ?? "us";

  const copyText = useMemo(() => formatCopyText(result), [result]);
  const rateLabel = playbackRate === 1 ? "1×" : `${playbackRate.toFixed(2).replace(/0$/, "")}×`;
  const wordPath = `/w/${encodeURIComponent(result.word.toLowerCase())}`;
  const shareDetail = [
    result.syllables ? `${result.syllables} syllables` : null,
    usFree || ukFree ? "US · UK audio" : "Click-to-play audio",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <StableSlot minHeight="11rem" className="word-result-slot">
      <article className="rounded-2xl border border-paper-line bg-paper-raised shadow-card sm:rounded-[28px] sm:p-8 sm:shadow-card">
        {/* Above-the-fold tool panel */}
        <div className="border-b border-paper-line p-4 sm:border-0 sm:p-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-voice">
              Pronunciation
            </p>
            <QuickCopyButton
              text={copyText}
              historyHref={`/w/${encodeURIComponent(result.word.toLowerCase())}`}
            />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl leading-none tracking-tight text-ink sm:text-5xl">
              {result.word}
            </h1>
            <PlayButton
              label="Play"
              word={result.word}
              historyDetail={result.phonetic ?? undefined}
              freeAudioUrl={primaryFree}
              rate={playbackRate}
              lang={ACCENT_LANG[primaryLang]}
              voice={primaryLang === "uk" ? "uk" : "us"}
              useStudioVoice={!primaryFree}
            />
          </div>

          <p className="mt-2 font-display text-xl text-ink-muted sm:text-2xl">
            {result.phonetic ?? "Phonetic spelling unavailable"}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <PlayButton
              label={ACCENT_LABEL.us}
              word={result.word}
              historyDetail={result.phonetic ?? undefined}
              freeAudioUrl={usFree}
              rate={playbackRate}
              lang="en-US"
              voice="us"
              useStudioVoice={!usFree}
            />
            <PlayButton
              label={ACCENT_LABEL.uk}
              word={result.word}
              historyDetail={result.phonetic ?? undefined}
              freeAudioUrl={ukFree}
              rate={playbackRate}
              lang="en-GB"
              voice="uk"
              useStudioVoice={!ukFree}
            />
          </div>

          <label className="mt-3 flex items-center gap-3 text-xs text-ink-muted">
            <span className="shrink-0 font-medium uppercase tracking-wide">Speed</span>
            <input
              type="range"
              min={0.6}
              max={1}
              step={0.05}
              value={playbackRate}
              onChange={(event) => setPlaybackRate(Number(event.target.value))}
              className="h-2 min-w-[8rem] flex-1 cursor-pointer accent-voice"
              aria-valuetext={`Playback speed ${rateLabel}`}
            />
            <span className="w-8 shrink-0 text-right font-medium text-ink">{rateLabel}</span>
          </label>

          <ExportShare
            className="mt-4"
            title={result.word}
            path={wordPath}
            kind="pronunciation"
            phonetic={result.phonetic}
            detail={shareDetail}
            audioPreview="▶  US & UK audio preview"
          />
        </div>

        {/* Detail below the fold on small screens */}
        <div className="p-4 sm:px-0 sm:pb-0 sm:pt-6">
          <dl className="flex flex-wrap gap-6 text-sm text-ink-muted">
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

          <p className="mt-4 text-xs text-ink-muted">
            Audio uses free dictionary clips when available, otherwise free on-demand TTS —
            generated only when you click Play, then cached. Browser speech is the final $0
            fallback.
          </p>

          {result.meanings.length > 0 && (
            <section className="mt-8 border-t border-paper-line pt-6 sm:mt-10 sm:pt-8">
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
        </div>
      </article>
    </StableSlot>
  );
}

export default WordResult;
