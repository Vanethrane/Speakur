"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useHistoryOptional } from "@/components/HistoryDrawer";
import { buildSearchRecord } from "@/lib/history-store";
import type { Suggestion } from "@/lib/types";
import { StableSlot } from "@/components/StableSlot";

type SearchBoxProps = {
  initialQuery?: string;
  autoFocus?: boolean;
  /** Tighter layout for above-the-fold tool strips on mobile */
  compact?: boolean;
};

export function SearchBox({
  initialQuery = "",
  autoFocus = true,
  compact = false,
}: SearchBoxProps) {
  const router = useRouter();
  const history = useHistoryOptional();
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    const handle = window.setTimeout(async () => {
      const response = await fetch(`/api/suggest?q=${encodeURIComponent(q)}`);
      if (!response.ok) return;
      const data = (await response.json()) as Suggestion[];
      setSuggestions(data);
      setOpen(data.length > 0);
      setActive(0);
    }, 160);
    return () => window.clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (!boxRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const visible = useMemo(
    () => (open ? suggestions.slice(0, 8) : []),
    [open, suggestions],
  );

  function go(word: string) {
    const next = word.trim();
    if (!next) return;
    setOpen(false);
    history?.recordItem(buildSearchRecord(next));
    router.push(`/w/${encodeURIComponent(next.toLowerCase())}`);
  }

  const slotMin = compact ? "3.25rem" : "4.25rem";

  return (
    <StableSlot minHeight={slotMin} className="search-slot">
    <form
      ref={boxRef}
      className="relative"
      style={{ contain: "layout", minHeight: slotMin }}
      onSubmit={(event) => {
        event.preventDefault();
        const chosen = visible[active]?.word ?? query;
        go(chosen);
      }}
    >
      <label className="sr-only" htmlFor="speakur-search">
        Search a word to hear its pronunciation
      </label>
      <input
        id="speakur-search"
        autoFocus={autoFocus}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onKeyDown={(event) => {
          if (!visible.length) return;
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActive((index) => (index + 1) % visible.length);
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive((index) => (index - 1 + visible.length) % visible.length);
          }
        }}
        placeholder={
          compact
            ? "Search a word to hear it…"
            : "Type a word — epitome, Worcestershire, GIF…"
        }
        className={`w-full rounded-2xl border border-paper-line bg-paper-raised text-ink shadow-card outline-none ring-voice/30 placeholder:text-ink-muted/70 focus:ring-4 ${
          compact ? "px-4 py-2.5 pr-[5.5rem] text-base" : "px-5 py-4 pr-[6.5rem] text-lg"
        }`}
        autoComplete="off"
        spellCheck={false}
      />
      <button
        type="submit"
        className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-ink font-medium text-paper-raised ${
          compact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
        }`}
      >
        Hear it
      </button>
      {visible.length > 0 && (
        <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-paper-line bg-paper-raised shadow-card">
          {visible.map((item, index) => (
            <li key={item.word}>
              <button
                type="button"
                onMouseEnter={() => setActive(index)}
                onClick={() => go(item.word)}
                className={`flex w-full items-center justify-between px-5 py-3 text-left text-base ${
                  index === active ? "bg-voice-glow text-voice-dark" : "text-ink"
                }`}
              >
                <span>{item.word}</span>
                <span className="text-xs uppercase tracking-wide text-ink-muted">pronounce</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
    </StableSlot>
  );
}
