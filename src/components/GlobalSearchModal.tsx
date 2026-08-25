"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useGlobalSearch } from "@/components/GlobalSearchProvider";
import { useHistoryOptional } from "@/components/HistoryDrawer";
import {
  buildGuideRecord,
  buildPronunciationRecord,
  buildToolRecord,
} from "@/lib/history-store";
import {
  loadGlobalSearchIndex,
  resolveGlobalSearchHref,
  searchGlobalIndex,
  type GlobalSearchIndex,
  type GlobalSearchResult,
} from "@/lib/global-search";
import { normalizeSearchQuery } from "@/lib/header-search";

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

type GlobalSearchModalProps = {
  index: GlobalSearchIndex | null;
  loading: boolean;
};

function GlobalSearchModal({ index, loading }: GlobalSearchModalProps) {
  const router = useRouter();
  const { open, closeSearch } = useGlobalSearch();
  const history = useHistoryOptional();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const searchState = useMemo(() => {
    if (!index || !query.trim()) {
      return { results: [] as GlobalSearchResult[], isFallback: false, elapsedMs: 0 };
    }
    return searchGlobalIndex(query, index, 12);
  }, [query, index]);

  const { results, isFallback, elapsedMs } = searchState;

  useEffect(() => {
    setActive(0);
  }, [query, results.length]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActive(0);
      return;
    }
    const handle = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(handle);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSearch();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, closeSearch]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function recordNavigation(entry: GlobalSearchResult) {
    if (entry.type === "word") {
      history?.recordItem(
        buildPronunciationRecord(entry.label, entry.hint),
      );
      return;
    }
    if (entry.type === "tool") {
      history?.recordItem(
        buildToolRecord(entry.label, entry.href, entry.hint, entry.id),
      );
      return;
    }
    history?.recordItem(
      buildGuideRecord(entry.label, entry.href, entry.hint, entry.id),
    );
  }

  function navigate(entry?: GlobalSearchResult) {
    if (!index) return;
    const raw = query.trim();
    if (!raw && !entry) return;

    let href: string;
    if (entry) {
      href = entry.href;
      recordNavigation(entry);
    } else {
      href = resolveGlobalSearchHref(raw, index);
      const resolved = searchGlobalIndex(raw, index, 1).results[0];
      if (resolved) recordNavigation(resolved);
    }

    closeSearch();

    if (/^https?:\/\//i.test(href)) {
      window.location.href = href;
      return;
    }
    router.push(href);
  }

  if (!open) return null;

  const q = normalizeSearchQuery(query);
  const showEmptyHint = !loading && index && q.length === 0;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center px-4 pt-[12vh] sm:pt-[14vh]"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
        aria-label="Close search"
        onClick={closeSearch}
      />
      <div
        className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-paper-line bg-paper-raised shadow-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="global-search-title"
      >
        <div className="flex items-center gap-3 border-b border-paper-line px-4 py-3">
          <SearchIcon className="shrink-0 text-ink-muted" />
          <label id="global-search-title" className="sr-only" htmlFor="global-search-input">
            Search Speakur
          </label>
          <input
            ref={inputRef}
            id="global-search-input"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown" && results.length) {
                event.preventDefault();
                setActive((i) => (i + 1) % results.length);
              } else if (event.key === "ArrowUp" && results.length) {
                event.preventDefault();
                setActive((i) => (i - 1 + results.length) % results.length);
              } else if (event.key === "Enter") {
                event.preventDefault();
                navigate(results[active]);
              }
            }}
            placeholder="Search 60,000 words, guides, and tools…"
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-muted/80"
          />
          <kbd className="hidden shrink-0 rounded-md border border-paper-line bg-paper px-1.5 py-0.5 text-[0.65rem] text-ink-muted sm:inline">
            esc
          </kbd>
        </div>

        <div className="max-h-[min(50vh,24rem)] overflow-y-auto">
          {loading ? (
            <p className="px-4 py-6 text-sm text-ink-muted">Loading search index…</p>
          ) : showEmptyHint ? (
            <div className="px-4 py-6 text-sm text-ink-muted">
              <p>Type to search words, guides, and tools instantly.</p>
              <p className="mt-2 text-xs">
                Try <span className="text-ink">epitome</span>,{" "}
                <span className="text-ink">IPA</span>, or{" "}
                <span className="text-ink">Japanese toolkit</span>
              </p>
            </div>
          ) : results.length === 0 && q.length > 0 ? (
            <p className="px-4 py-6 text-sm text-ink-muted">No results — try a different spelling.</p>
          ) : (
            <>
              {isFallback ? (
                <p className="border-b border-paper-line bg-amber-50 px-4 py-2 text-xs text-amber-900">
                  No exact matches — showing the 3 closest tools
                </p>
              ) : null}
              <ul ref={listRef} role="listbox" aria-label="Search results" className="py-1">
                {results.map((item, index) => (
                  <li key={item.id} role="option" aria-selected={index === active}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(index)}
                      onClick={() => navigate(item)}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition ${
                        index === active ? "bg-voice-glow text-voice-dark" : "text-ink hover:bg-paper"
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
            </>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-paper-line px-4 py-2 text-[0.65rem] text-ink-muted">
          <span>
            {index
              ? `${(index.wordCount ?? index.words.length).toLocaleString()} words · ${index.meta?.length ?? 0} guides & tools`
              : "—"}
          </span>
          {elapsedMs > 0 ? (
            <span>{elapsedMs < 1 ? "<1" : elapsedMs.toFixed(1)} ms</span>
          ) : (
            <span className="hidden sm:inline">
              <kbd className="rounded border border-paper-line px-1">↑↓</kbd> navigate ·{" "}
              <kbd className="rounded border border-paper-line px-1">↵</kbd> open
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/** Header trigger + modal shell — index prefetched on idle. */
export function GlobalSearchTrigger({ className = "" }: { className?: string }) {
  const { openSearch, open } = useGlobalSearch();
  const [index, setIndex] = useState<GlobalSearchIndex | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    function prefetch() {
      if (index || loading) return;
      setLoading(true);
      loadGlobalSearchIndex()
        .then((data) => {
          if (!cancelled) setIndex(data);
        })
        .catch(() => {
          /* modal shows loading error state via empty index */
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(prefetch, { timeout: 4000 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(id);
      };
    }

    const t = window.setTimeout(prefetch, 800);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [index, loading]);

  useEffect(() => {
    if (!open || index) return;
    setLoading(true);
    loadGlobalSearchIndex()
      .then(setIndex)
      .finally(() => setLoading(false));
  }, [open, index]);

  return (
    <>
      <button
        type="button"
        onClick={openSearch}
        className={`inline-flex min-h-[2.5rem] w-full max-w-xl items-center gap-2 rounded-full border border-paper-line bg-paper-raised px-3 py-2 text-left text-sm text-ink-muted shadow-sm transition hover:border-voice hover:text-voice-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-voice ${className}`}
        aria-label="Open search (Command K)"
      >
        <SearchIcon className="shrink-0" />
        <span className="min-w-0 flex-1 truncate">Search words, guides, tools…</span>
        <kbd className="hidden shrink-0 rounded-md border border-paper-line bg-paper px-1.5 py-0.5 text-[0.65rem] font-medium text-ink-muted sm:inline">
          ⌘K
        </kbd>
      </button>
      <GlobalSearchModal index={index} loading={loading && !index} />
    </>
  );
}

export default GlobalSearchTrigger;
