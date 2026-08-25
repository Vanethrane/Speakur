"use client";

import { useEffect, useRef, useState } from "react";
import { useHistoryOptional } from "@/components/HistoryDrawer";
import { buildPronunciationRecord } from "@/lib/history-store";

type PlayButtonProps = {
  label: string;
  word: string;
  /** IPA or accent note stored in Recently Used */
  historyDetail?: string;
  /** Prefer free dictionary audio when present ($0). */
  freeAudioUrl?: string | null;
  rate?: number;
  lang?: string;
  /** us | uk — free TTS accent */
  voice?: "us" | "uk";
  /** Skip free dictionary clip and use Speakur TTS / browser. */
  useStudioVoice?: boolean;
};

function pickVoice(lang: string): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  const lower = lang.toLowerCase();
  const preferred = voices.find(
    (v) =>
      v.lang.toLowerCase() === lower ||
      (lower.startsWith("en-us") && /en-US|English.*United States/i.test(`${v.lang} ${v.name}`)) ||
      (lower.startsWith("en-gb") && /en-GB|English.*United Kingdom/i.test(`${v.lang} ${v.name}`)),
  );
  if (preferred) return preferred;
  return voices.find((v) => v.lang.toLowerCase().startsWith(lower.slice(0, 2))) ?? null;
}

function speak(word: string, lang: string, rate: number) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = lang;
  utterance.rate = rate;
  const match = pickVoice(lang);
  if (match) utterance.voice = match;
  window.speechSynthesis.speak(utterance);
}

export function PlayButton({
  label,
  word,
  historyDetail,
  freeAudioUrl = null,
  rate = 1,
  lang = "en-US",
  voice = "us",
  useStudioVoice = false,
}: PlayButtonProps) {
  const history = useHistoryOptional();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [studioUrl, setStudioUrl] = useState<string | null>(null);

  useEffect(() => {
    // Chrome loads voices asynchronously
    const warm = () => window.speechSynthesis?.getVoices();
    warm();
    window.speechSynthesis?.addEventListener("voiceschanged", warm);
    return () => {
      audioRef.current?.pause();
      window.speechSynthesis?.removeEventListener("voiceschanged", warm);
    };
  }, []);

  async function playFromUrl(url: string) {
    if (!audioRef.current || audioRef.current.src !== url) {
      audioRef.current = new Audio(url);
    }
    audioRef.current.playbackRate = rate;
    await audioRef.current.play();
  }

  function trackPlay(accentLabel: string) {
    const detail = [historyDetail, accentLabel].filter(Boolean).join(" · ");
    history?.recordItem(buildPronunciationRecord(word, detail || undefined));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("speakur:interaction"));
    }
  }

  /**
   * Audio is gated behind a real user click.
   * Priority: free dictionary MP3 → cached/free TTS → browser speech ($0).
   */
  async function play() {
    if (freeAudioUrl && !useStudioVoice) {
      try {
        await playFromUrl(freeAudioUrl);
        trackPlay(label);
        return;
      } catch {
        // fall through
      }
    }

    if (studioUrl) {
      try {
        await playFromUrl(studioUrl);
        trackPlay(label);
        return;
      } catch {
        speak(word, lang, rate);
        trackPlay(label);
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetch("/api/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: word, slug: word, voice }),
      });

      const data = (await response.json()) as {
        audioUrl?: string;
        fallback?: string;
      };

      if (response.ok && data.audioUrl) {
        setStudioUrl(data.audioUrl);
        await playFromUrl(data.audioUrl);
        trackPlay(label);
        return;
      }

      speak(word, lang, rate);
      trackPlay(label);
    } catch {
      speak(word, lang, rate);
      trackPlay(label);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void play()}
      disabled={loading}
      className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-full bg-voice px-4 py-2 text-sm font-medium text-paper-raised transition hover:bg-voice-dark disabled:opacity-60"
      style={{ contain: "layout" }}
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15" aria-hidden>
        {loading ? "…" : "▶"}
      </span>
      {loading ? "Loading…" : label}
    </button>
  );
}
