"use client";

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  HISTORY_STORAGE_KEY,
  clearHistoryRecent,
  historyKindLabel,
  loadHistoryItems,
  removeHistoryItem,
  saveHistoryItem,
  toggleHistoryFavorite,
  type HistoryRecord,
  type HistoryRecordInput,
} from "@/lib/history-store";

type HistoryTab = "recent" | "favorites";

type HistoryContextValue = {
  items: HistoryRecord[];
  recent: HistoryRecord[];
  favorites: HistoryRecord[];
  recordItem: (input: HistoryRecordInput) => void;
  toggleFavorite: (id: string) => void;
  removeItem: (id: string) => void;
  clearRecent: () => void;
  open: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  tab: HistoryTab;
  setTab: (tab: HistoryTab) => void;
};

const HistoryContext = createContext<HistoryContextValue | null>(null);

export function useHistory(): HistoryContextValue {
  const ctx = useContext(HistoryContext);
  if (!ctx) {
    throw new Error("useHistory must be used within HistoryProvider");
  }
  return ctx;
}

/** Safe for optional recording outside HistoryProvider (no-op when absent). */
export function useHistoryOptional(): HistoryContextValue | null {
  return useContext(HistoryContext);
}

function formatWhen(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

type HistoryProviderProps = {
  children: ReactNode;
};

export function HistoryProvider({ children }: HistoryProviderProps) {
  const [items, setItems] = useState<HistoryRecord[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<HistoryTab>("recent");

  useEffect(() => {
    setItems(loadHistoryItems());
    setHydrated(true);

    function onStorage(event: StorageEvent) {
      if (event.key === HISTORY_STORAGE_KEY) {
        setItems(loadHistoryItems());
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const recordItem = useCallback((input: HistoryRecordInput) => {
    setItems(saveHistoryItem(input));
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setItems(toggleHistoryFavorite(id));
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(removeHistoryItem(id));
  }, []);

  const clearRecent = useCallback(() => {
    setItems(clearHistoryRecent());
  }, []);

  const recent = useMemo(() => items.filter((item) => !item.favorited), [items]);
  const favorites = useMemo(() => items.filter((item) => item.favorited), [items]);

  const value = useMemo(
    () => ({
      items,
      recent,
      favorites,
      recordItem,
      toggleFavorite,
      removeItem,
      clearRecent,
      open,
      openDrawer: () => setOpen(true),
      closeDrawer: () => setOpen(false),
      toggleDrawer: () => setOpen((v) => !v),
      tab,
      setTab,
    }),
    [
      items,
      recent,
      favorites,
      recordItem,
      toggleFavorite,
      removeItem,
      clearRecent,
      open,
      tab,
    ],
  );

  return (
    <HistoryContext.Provider value={value}>
      {children}
      {hydrated ? <HistoryDrawer /> : null}
    </HistoryContext.Provider>
  );
}

function HistoryRow({
  item,
  onToggleFavorite,
  onRemove,
  onNavigate,
}: {
  item: HistoryRecord;
  onToggleFavorite: (id: string) => void;
  onRemove: (id: string) => void;
  onNavigate: () => void;
}) {
  const external = /^https?:\/\//i.test(item.href);

  const body = (
    <>
      <span className="mt-0.5 shrink-0 text-base leading-none" aria-hidden>
        {item.kind === "pronunciation" ? "🔊" : item.kind === "tool" ? "⚙" : "📄"}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-ink">{item.label}</span>
        <span className="mt-0.5 block truncate text-xs text-ink-muted">
          {item.detail || historyKindLabel(item.kind)} · {formatWhen(item.usedAt)}
        </span>
      </span>
    </>
  );

  return (
    <li className="flex items-center gap-1 border-b border-paper-line/80 last:border-0">
      {external ? (
        <a
          href={item.href}
          onClick={onNavigate}
          className="flex min-w-0 flex-1 items-start gap-3 px-4 py-3 text-sm transition hover:bg-voice-glow/60"
        >
          {body}
        </a>
      ) : (
        <Link
          href={item.href}
          onClick={onNavigate}
          className="flex min-w-0 flex-1 items-start gap-3 px-4 py-3 text-sm transition hover:bg-voice-glow/60"
        >
          {body}
        </Link>
      )}
      <button
        type="button"
        onClick={() => onToggleFavorite(item.id)}
        className={`mr-1 shrink-0 rounded-full px-2 py-2 text-sm transition hover:bg-paper ${
          item.favorited ? "text-amber-500" : "text-ink-muted"
        }`}
        aria-label={item.favorited ? "Remove from favorites" : "Add to favorites"}
      >
        {item.favorited ? "★" : "☆"}
      </button>
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="mr-2 shrink-0 rounded-full px-2 py-2 text-xs text-ink-muted transition hover:bg-paper hover:text-ink"
        aria-label="Remove from history"
      >
        ✕
      </button>
    </li>
  );
}

/** Floating pill + slide-up drawer for recent / favorited items. */
export function HistoryDrawer() {
  const {
    items,
    recent,
    favorites,
    open,
    closeDrawer,
    toggleDrawer,
    tab,
    setTab,
    toggleFavorite,
    removeItem,
    clearRecent,
  } = useHistory();

  const visible = tab === "favorites" ? favorites : recent;
  const totalBadge = items.length;

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeDrawer();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, closeDrawer]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={toggleDrawer}
        className="fixed bottom-5 right-5 z-[150] inline-flex max-w-[calc(100vw-2.5rem)] items-center gap-2 rounded-full border border-voice/30 bg-voice px-4 py-2.5 text-sm font-semibold text-paper-raised shadow-lg transition hover:bg-voice-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-voice"
        aria-expanded={open}
        aria-controls="speakur-history-drawer"
      >
        <span aria-hidden>🕘</span>
        <span>Recent / Favorites</span>
        {totalBadge > 0 ? (
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold tabular-nums">
            {totalBadge}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[160]" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-ink/35 backdrop-blur-[1px]"
            aria-label="Close history"
            onClick={closeDrawer}
          />
          <aside
            id="speakur-history-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-drawer-title"
            className="absolute bottom-0 left-0 right-0 mx-auto max-h-[min(70vh,28rem)] w-full max-w-lg overflow-hidden rounded-t-2xl border border-paper-line bg-paper-raised shadow-card sm:bottom-6 sm:right-6 sm:left-auto sm:rounded-2xl"
          >
            <div className="flex items-center justify-between border-b border-paper-line px-4 py-3">
              <div>
                <h2 id="history-drawer-title" className="font-display text-lg text-ink">
                  Recently Used
                </h2>
                <p className="text-xs text-ink-muted">Saved on this device · localStorage</p>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="rounded-full px-2 py-1 text-sm text-ink-muted hover:bg-paper hover:text-ink"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="flex gap-1 border-b border-paper-line px-4 py-2">
              <button
                type="button"
                onClick={() => setTab("recent")}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  tab === "recent"
                    ? "bg-voice text-paper-raised"
                    : "text-ink-muted hover:bg-paper"
                }`}
              >
                Recent ({recent.length})
              </button>
              <button
                type="button"
                onClick={() => setTab("favorites")}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  tab === "favorites"
                    ? "bg-voice text-paper-raised"
                    : "text-ink-muted hover:bg-paper"
                }`}
              >
                Favorites ({favorites.length})
              </button>
              {tab === "recent" && recent.length > 0 ? (
                <button
                  type="button"
                  onClick={clearRecent}
                  className="ml-auto text-xs text-ink-muted underline-offset-2 hover:underline"
                >
                  Clear recent
                </button>
              ) : null}
            </div>

            {visible.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-ink-muted">
                {tab === "favorites"
                  ? "Star items in Recent to pin them here."
                  : "Play audio or use a tool — your history appears here instantly."}
              </p>
            ) : (
              <ul className="max-h-[min(50vh,20rem)] overflow-y-auto py-1">
                {visible.map((item) => (
                  <HistoryRow
                    key={item.id}
                    item={item}
                    onToggleFavorite={toggleFavorite}
                    onRemove={removeItem}
                    onNavigate={closeDrawer}
                  />
                ))}
              </ul>
            )}
          </aside>
        </div>
      ) : null}
    </>
  );
}

export default HistoryProvider;
