"use client";

import Link from "next/link";
import { splitLinkParts } from "@/lib/guide-links";

export function GuideParagraph({ text }: { text: string }) {
  const parts = splitLinkParts(text);
  return (
    <p>
      {parts.map((part, i) =>
        part.type === "link" && part.href ? (
          <Link
            key={`${part.href}-${i}`}
            href={part.href}
            className="text-voice-dark underline underline-offset-4"
          >
            {part.value}
          </Link>
        ) : (
          <span key={i}>{part.value}</span>
        ),
      )}
    </p>
  );
}
