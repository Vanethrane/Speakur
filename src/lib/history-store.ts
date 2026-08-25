export type HistoryKind = "pronunciation" | "tool" | "guide" | "search";

export type HistoryRecord = {
  id: string;
  kind: HistoryKind;
  label: string;
  detail?: string;
  href: string;
  favorited: boolean;
  usedAt: number;
};

export type HistoryRecordInput = {
  id: string;
  kind: HistoryKind;
  label: string;
  detail?: string;
  href: string;
  favorited?: boolean;
};

type HistoryState = {
  version: 1;
  items: HistoryRecord[];
};

export const HISTORY_STORAGE_KEY = "speakur.history.v1";
const MAX_ITEMS = 48;

function isHistoryState(value: unknown): value is HistoryState {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as HistoryState).version === 1 &&
    Array.isArray((value as HistoryState).items)
  );
}

function readRaw(): HistoryState {
  if (typeof window === "undefined") {
    return { version: 1, items: [] };
  }
  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return { version: 1, items: [] };
    const parsed: unknown = JSON.parse(raw);
    if (!isHistoryState(parsed)) return { version: 1, items: [] };
    return {
      version: 1,
      items: parsed.items
        .filter(
          (item) =>
            item &&
            typeof item.id === "string" &&
            typeof item.label === "string" &&
            typeof item.href === "string",
        )
        .slice(0, MAX_ITEMS + 12),
    };
  } catch {
    return { version: 1, items: [] };
  }
}

function writeRaw(state: HistoryState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota or private mode */
  }
}

function trimItems(items: HistoryRecord[]): HistoryRecord[] {
  const sorted = [...items].sort((a, b) => b.usedAt - a.usedAt);
  const favorites = sorted.filter((item) => item.favorited);
  const recent = sorted.filter((item) => !item.favorited);
  const keptRecent = recent.slice(0, Math.max(0, MAX_ITEMS - favorites.length));
  return [...favorites, ...keptRecent].sort((a, b) => b.usedAt - a.usedAt);
}

export function loadHistoryItems(): HistoryRecord[] {
  return readRaw().items;
}

export function saveHistoryItem(input: HistoryRecordInput): HistoryRecord[] {
  const state = readRaw();
  const existing = state.items.find((item) => item.id === input.id);
  const next: HistoryRecord = {
    id: input.id,
    kind: input.kind,
    label: input.label.trim(),
    detail: input.detail?.trim() || undefined,
    href: input.href,
    favorited: input.favorited ?? existing?.favorited ?? false,
    usedAt: Date.now(),
  };

  const merged = [next, ...state.items.filter((item) => item.id !== input.id)];
  const items = trimItems(merged);
  writeRaw({ version: 1, items });
  return items;
}

export function toggleHistoryFavorite(id: string): HistoryRecord[] {
  const state = readRaw();
  const items = state.items.map((item) =>
    item.id === id ? { ...item, favorited: !item.favorited } : item,
  );
  writeRaw({ version: 1, items: trimItems(items) });
  return trimItems(items);
}

export function removeHistoryItem(id: string): HistoryRecord[] {
  const state = readRaw();
  const items = state.items.filter((item) => item.id !== id);
  writeRaw({ version: 1, items });
  return items;
}

export function clearHistoryRecent(): HistoryRecord[] {
  const state = readRaw();
  const items = state.items.filter((item) => item.favorited);
  writeRaw({ version: 1, items });
  return items;
}

export function historyKindLabel(kind: HistoryKind): string {
  switch (kind) {
    case "pronunciation":
      return "Pronunciation";
    case "tool":
      return "Tool";
    case "guide":
      return "Guide";
    case "search":
      return "Search";
    default:
      return "Item";
  }
}

export function pronunciationHistoryId(word: string): string {
  return `pronunciation:${word.trim().toLowerCase()}`;
}

export function pronunciationHistoryHref(word: string): string {
  return `/w/${encodeURIComponent(word.trim().toLowerCase())}`;
}

export function buildPronunciationRecord(
  word: string,
  detail?: string,
): HistoryRecordInput {
  const label = word.trim();
  return {
    id: pronunciationHistoryId(label),
    kind: "pronunciation",
    label,
    detail,
    href: pronunciationHistoryHref(label),
  };
}

export function buildSearchRecord(word: string): HistoryRecordInput {
  return buildPronunciationRecord(word, "Pronunciation lookup");
}

export function buildToolRecord(
  label: string,
  href: string,
  detail?: string,
  id?: string,
): HistoryRecordInput {
  return {
    id: id || `tool:${href}`,
    kind: "tool",
    label,
    detail,
    href,
  };
}

export function buildGuideRecord(
  label: string,
  href: string,
  detail?: string,
  id?: string,
): HistoryRecordInput {
  return {
    id: id || `guide:${href}`,
    kind: "guide",
    label,
    detail,
    href,
  };
}
