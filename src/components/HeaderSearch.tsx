"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getHeaderSearchIndex,
  guessWordCategorySlug,
  normalizeSearchQuery,
  resolveHeaderSearch,
  searchHeaderIndex,
  type HeaderSearchEntry,
} from "@/lib/header-search";

type HeaderSearchProps = {
  className?: string;
};

export function HeaderSearch({ className = "" }: HeaderSearchProps) {
  const router = useRouter();
  const index = useMemo(() => getHeaderSearchIndex(), []);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLFormElement>(null);

  const results = useMemo(() => {
    const q = normalizeSearchQuery(query);
    if (q.length < 1) return [];
    return searchHeaderIndex(q, index, 8);
  }, [query, index]);

  useEffect(() => {
    setActive(0);
    setOpen(results.length > 0 && query.trim().length > 0);
  }, [results.length, query]);

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function navigate(entry?: HeaderSearchEntry) {
    const raw = query.trim();
    if (!raw && !entry) return;

    let href: string;
    if (entry) {
      href = entry.href;
    } else {
      href = resolveHeaderSearch(raw, index, { staticSite: false });
    }

    setOpen(false);
    if (/^https?:\/\//i.test(href)) {
      window.location.href = href;
      return;
    }
    router.push(href);
  }

  const visible = open ? results : [];

  return (
    <form
      ref={wrapRef}
      role="search"
      className={`relative ${className}`}
      onSubmit={(event) => {
        event.preventDefault();
        navigate(visible[active]);
      }}
    >
      <label className="sr-only" htmlFor="speakur-header-search">
        Search guides, tools, and topics
      </label>
      <input
        id="speakur-header-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        onKeyDown={(event) => {
          if (!visible.length) return;
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActive((i) => (i + 1) % visible.length);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive((i) => (i - 1 + visible.length) % visible.length);
          } else if (event.key === "Escape") {
            setOpen(false);
          }
        }}
        placeholder="Search guides, tools, words…"
        autoComplete="off"
        spellCheck={false}
        className="w-full rounded-full border border-paper-line bg-paper-raised py-2 pl-4 pr-10 text-sm text-ink shadow-sm outline-none ring-voice/25 placeholder:text-ink-muted/80 focus:ring-2"
      />
      <button
        type="submit"
        className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-voice px-3 py-1 text-xs font-medium text-paper-raised hover:bg-voice-dark"
        aria-label="Search"
      >
        Go
      </button>
      {visible.length > 0 ? (
        <ul
          className="absolute z-50 mt-1.5 max-h-72 w-full overflow-auto rounded-xl border border-paper-line bg-paper-raised py-1 shadow-card"
          role="listbox"
          aria-label="Search suggestions"
        >
          {visible.map((item, index) => (
            <li key={item.id} role="option" aria-selected={index === active}>
              <button
                type="button"
                onMouseEnter={() => setActive(index)}
                onClick={() => navigate(item)}
                className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm ${
                  index === active ? "bg-voice-glow text-voice-dark" : "text-ink"
                }`}
              >
                <span className="truncate font-medium">{item.label}</span>
                <span className="shrink-0 text-[0.65rem] uppercase tracking-wide text-ink-muted">
                  {item.hint}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </form>
  );
}

export default HeaderSearch;
