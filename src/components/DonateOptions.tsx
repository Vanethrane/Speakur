"use client";

import { useState } from "react";
import Link from "next/link";

const BTC_ADDRESS = "bc1qdvpp8r9lr2xyjeu7kqaww2xnq4ezx2caw8d9ag";

export function DonateOptions() {
  const [status, setStatus] = useState("");

  async function copyBtc() {
    try {
      await navigator.clipboard.writeText(BTC_ADDRESS);
      setStatus("Address copied.");
    } catch {
      setStatus("Copy failed — select the address manually.");
    }
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="rounded-2xl border border-paper-line bg-paper-raised p-6 shadow-card">
        <h2 className="font-display text-xl text-ink">PayPal</h2>
        <p className="mt-3 text-ink-muted leading-relaxed">
          One-time gifts via PayPal. Any amount helps.
        </p>
        <p className="mt-5">
          <a
            className="inline-flex items-center rounded-full bg-voice px-4 py-2 text-sm font-medium text-paper-raised hover:bg-voice-dark"
            href="https://paypal.me/technivorous"
            target="_blank"
            rel="noopener noreferrer"
          >
            Donate with PayPal
          </a>
        </p>
      </div>

      <div className="rounded-2xl border border-paper-line bg-paper-raised p-6 shadow-card">
        <h2 className="font-display text-xl text-ink">Bitcoin</h2>
        <p className="mt-3 text-ink-muted leading-relaxed">Send BTC to this address:</p>
        <div className="mt-3 flex flex-wrap items-stretch gap-3">
          <p className="min-w-0 flex-1 break-all rounded-xl border border-paper-line bg-paper px-3 py-3 font-mono text-sm text-ink">
            {BTC_ADDRESS}
          </p>
          <button
            type="button"
            onClick={copyBtc}
            className="rounded-xl bg-ink px-4 py-2 text-sm font-medium text-paper-raised hover:bg-voice-dark"
          >
            Copy address
          </button>
        </div>
        <p className="mt-2 min-h-5 text-sm text-voice-dark" role="status" aria-live="polite">
          {status}
        </p>
      </div>

      <p className="text-sm text-ink-muted">
        Questions about donations?{" "}
        <Link href="/contact" className="text-voice-dark underline underline-offset-4">
          Contact us
        </Link>
        .
      </p>
    </div>
  );
}
