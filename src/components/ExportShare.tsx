"use client";

import { useCallback, useMemo, useState } from "react";
import { useHistoryOptional } from "@/components/HistoryDrawer";
import { buildToolRecord } from "@/lib/history-store";
import { downloadShareCard } from "@/lib/share-card";
import {
  buildForumShareText,
  buildShareUrl,
  formatShortLink,
  type SharePayload,
} from "@/lib/share-url";

type ExportShareProps = SharePayload & {
  className?: string;
};

type ToastKind = "copied" | "downloaded" | null;

async function writeClipboard(text: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

function ShareToast({ kind }: { kind: Exclude<ToastKind, null> }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-full bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg"
    >
      {kind === "copied" ? "Link copied!" : "Card downloaded!"}
    </div>
  );
}

/**
 * Export & Share — copy a forum-ready short link or download a branded PNG card.
 */
export function ExportShare({
  title,
  path,
  kind = "pronunciation",
  phonetic,
  detail,
  audioPreview,
  className = "",
}: ExportShareProps) {
  const history = useHistoryOptional();
  const [toast, setToast] = useState<ToastKind>(null);
  const [busy, setBusy] = useState<"share" | "png" | null>(null);

  const payload = useMemo<SharePayload>(
    () => ({
      title,
      path,
      kind,
      phonetic,
      detail,
      audioPreview,
    }),
    [title, path, kind, phonetic, detail, audioPreview],
  );

  const shortLink = useMemo(() => formatShortLink(path), [path]);

  const flash = useCallback((kind: Exclude<ToastKind, null>) => {
    setToast(kind);
    window.setTimeout(() => setToast(null), 2200);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("speakur:interaction"));
    }
  }, []);

  const shareResult = useCallback(async () => {
    setBusy("share");
    try {
      const text = buildForumShareText(payload);
      await writeClipboard(text);
      history?.recordItem(
        buildToolRecord(
          buildShareUrl(path),
          path,
          "Shared result link",
          `share:${path}`,
        ),
      );
      flash("copied");
    } catch {
      /* ignore */
    } finally {
      setBusy(null);
    }
  }, [payload, path, history, flash]);

  const downloadCard = useCallback(async () => {
    setBusy("png");
    try {
      await downloadShareCard(payload);
      history?.recordItem(
        buildToolRecord(title, path, "Downloaded share card", `png:${path}`),
      );
      flash("downloaded");
    } catch {
      /* ignore */
    } finally {
      setBusy(null);
    }
  }, [payload, title, path, history, flash]);

  return (
    <div
      className={`rounded-xl border border-paper-line bg-paper/60 p-3 ${className}`}
      aria-label="Export and share"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-ink-muted">
          Export &amp; Share
        </p>
        <p className="truncate text-[0.65rem] text-ink-muted">{shortLink}</p>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void shareResult()}
          disabled={busy !== null}
          className="inline-flex min-h-[2.5rem] flex-1 items-center justify-center rounded-full bg-voice px-3 py-1.5 text-xs font-medium text-paper-raised transition hover:bg-voice-dark disabled:opacity-60 sm:flex-none sm:text-sm"
        >
          {busy === "share" ? "Copying…" : "Share Result"}
        </button>
        <button
          type="button"
          onClick={() => void downloadCard()}
          disabled={busy !== null}
          className="inline-flex min-h-[2.5rem] flex-1 items-center justify-center rounded-full border border-paper-line bg-paper-raised px-3 py-1.5 text-xs font-medium text-ink transition hover:border-voice hover:text-voice-dark disabled:opacity-60 sm:flex-none sm:text-sm"
        >
          {busy === "png" ? "Rendering…" : "Download card"}
        </button>
      </div>
      <p className="mt-2 text-[0.65rem] leading-relaxed text-ink-muted">
        Paste into Discord, Reddit, or forums — includes a direct link and optional PNG preview
        card.
      </p>
      {toast ? <ShareToast kind={toast} /> : null}
    </div>
  );
}

export default ExportShare;
