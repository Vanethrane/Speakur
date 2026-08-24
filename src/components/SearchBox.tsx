"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Suggestion } from "@/lib/types";

type SearchBoxProps = {
  initialQuery?: string;
  autoFocus?: boolean;
};

export function SearchBox({ initialQuery = "", autoFocus = true }: SearchBoxProps) {
  const router = useRouter();
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
    router.push(`/w/${encodeURIComponent(next.toLowerCase())}`);
  }

  return (
    <form
      ref={boxRef}
      className="relative"
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
        placeholder="Type a word — epitome, Worcestershire, GIF…"
        className="w-full rounded-2xl border border-paper-line bg-paper-raised px-5 py-4 text-lg text-ink shadow-card outline-none ring-voice/30 placeholder:text-ink-muted/70 focus:ring-4"
        autoComplete="off"
        spellCheck={false}
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-ink px-4 py-2 text-sm font-medium text-paper-raised"
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
  );
}
