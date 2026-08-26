"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

export const SPEAKUR_TOOLS = [
  { href: "/tools/ipa", label: "IPA cheat sheet" },
  { href: "/tools/minimal-pairs", label: "Minimal-pair trainer" },
  { href: "/tools/homophones", label: "Homophone check" },
  { href: "/tools/danger-list", label: "Danger-list deck" },
  { href: "/tools/us-uk", label: "US ↔ UK switcher" },
  { href: "/tools/syllable-stress", label: "Syllable & stress highlighter" },
  { href: "/tools/name-coach", label: "Name coach" },
  { href: "/tools/warm-up", label: "Speaking warm-up" },
] as const;

export function ToolsNavDropdown() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDetailsElement>(null);
  const id = useId();

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <details
      ref={rootRef}
      className="nav-dropdown relative"
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
    >
      <summary
        className="nav-pill inline-flex cursor-pointer list-none items-center gap-1 rounded-full border border-paper-line bg-paper-raised px-3 py-1.5 text-sm font-medium text-voice-dark hover:border-voice hover:bg-voice-glow [&::-webkit-details-marker]:hidden"
        aria-controls={id}
      >
        Tools
        <span aria-hidden="true" className="text-[0.7em] opacity-75">
          ▾
        </span>
      </summary>
      <ul
        id={id}
        className="nav-dropdown-menu absolute left-0 z-50 mt-2 min-w-[15.5rem] list-none rounded-xl border border-paper-line bg-paper-raised p-1.5 shadow-lg"
        role="list"
      >
        <li>
          <Link
            href="/tools"
            className="block rounded-lg px-3 py-2 text-sm text-ink hover:bg-voice-glow hover:text-voice-dark"
            onClick={() => setOpen(false)}
          >
            <strong>All tools</strong>
          </Link>
        </li>
        {SPEAKUR_TOOLS.map((t) => (
          <li key={t.href}>
            <Link
              href={t.href}
              className="block rounded-lg px-3 py-2 text-sm text-ink hover:bg-voice-glow hover:text-voice-dark"
              onClick={() => setOpen(false)}
            >
              {t.label}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}
