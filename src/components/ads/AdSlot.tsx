"use client";

import { useEffect, useRef } from "react";
import type { AdSlotType } from "@/site.config";

export type AdSlotProps = {
  slotType: AdSlotType;
  /** Kept for API compatibility; Ezoic placements ignore the traffic gate. */
  minTrafficRequired?: number;
  className?: string;
};

declare global {
  interface Window {
    ezstandalone?: {
      cmd: Array<() => void>;
      showAds: (...args: unknown[]) => void;
    };
  }
}

/**
 * Ezoic standalone placement — one showAds({}) call per spot.
 * Header/privacy scripts in root layout must load first.
 */
export function AdSlot({ slotType, className = "" }: AdSlotProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el || el.dataset.ezoicAds === "1") return;
    el.dataset.ezoicAds = "1";

    window.ezstandalone = window.ezstandalone || { cmd: [], showAds() {} };
    window.ezstandalone.cmd = window.ezstandalone.cmd || [];
    window.ezstandalone.cmd.push(function () {
      window.ezstandalone?.showAds({});
    });
  }, []);

  return (
    <div
      ref={mountRef}
      className={`ad-slot ad-slot-${slotType} flex w-full justify-center ${className}`}
      style={{ minHeight: 90 }}
      data-ad-network="ezoic"
      data-slot={slotType}
      aria-label="Advertisement"
    />
  );
}

export default AdSlot;
