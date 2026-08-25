"use client";

import { useCallback, useState } from "react";
import { useHistoryOptional } from "@/components/HistoryDrawer";
import { buildToolRecord } from "@/lib/history-store";

type QuickCopyButtonProps = {
  text: string;
  label?: string;
  className?: string;
  /** Page to reopen from history (defaults to current path) */
  historyHref?: string;
};

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

/**
 * Copies a result string and shows an immediate green "Copied!" toast.
 */
export function QuickCopyButton({
  text,
  label = "Quick Copy Result",
  className = "",
  historyHref,
}: QuickCopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const history = useHistoryOptional();

  const copy = useCallback(async () => {
    try {
      await writeClipboard(text);
      const href =
        historyHref ||
        (typeof window !== "undefined" ? window.location.pathname : "/");
      history?.recordItem(
        buildToolRecord(text.slice(0, 80), href, "Copied result", `copy:${href}`),
      );
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      /* ignore */
    }
  }, [text, historyHref, history]);

  return (
    <>
      <button
        type="button"
        onClick={() => void copy()}
        className={`inline-flex min-h-[2.5rem] shrink-0 items-center rounded-full border border-paper-line bg-paper px-3 py-1.5 text-xs font-medium text-ink transition hover:border-voice hover:text-voice-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-voice sm:text-sm ${className}`}
      >
        {label}
      </button>
      {copied ? (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-full bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg"
        >
          Copied!
        </div>
      ) : null}
    </>
  );
}

export default QuickCopyButton;
