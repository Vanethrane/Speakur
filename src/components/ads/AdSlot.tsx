"use client";

import { useEffect, useId, useRef } from "react";
import {
  hasAdNetworkScript,
  siteConfig,
  type AdNetworkConfig,
  type AdSlotType,
} from "@/site.config";
import { NativeAffiliateCard } from "./NativeAffiliateCard";

export type AdSlotProps = {
  slotType: AdSlotType;
  /**
   * Minimum estimated monthly visits before a network script is allowed to load.
   * Below this (or if the script is missing in site.config), NativeAffiliateCard renders.
   */
  minTrafficRequired?: number;
  className?: string;
};

declare global {
  interface Window {
    atOptions?: {
      key: string;
      format: string;
      height: number;
      width: number;
      params: Record<string, unknown>;
    };
  }
}

function loadNetworkScript(network: AdNetworkConfig, mount: HTMLElement) {
  // iframe / atOptions-style banner
  if (network.format === "iframe" || (!network.format && network.width && network.height)) {
    window.atOptions = {
      key: network.key,
      format: "iframe",
      height: network.height ?? 60,
      width: network.width ?? 468,
      params: { ...(network.params ?? {}) },
    };
  }

  if (network.containerId) {
    let box = mount.querySelector(`#${CSS.escape(network.containerId)}`);
    if (!box) {
      box = document.createElement("div");
      box.id = network.containerId;
      mount.appendChild(box);
    }
  }

  const existing = mount.querySelector(`script[data-speakur-ad="${network.key}"]`);
  if (existing) return;

  const script = document.createElement("script");
  script.src = network.scriptSrc;
  script.dataset.speakurAd = network.key;
  if (network.async) script.async = true;
  if (network.cfAsyncFalse) script.setAttribute("data-cfasync", "false");
  mount.appendChild(script);
}

/**
 * Modular ad placement. Renders a network unit when configured + traffic gate passes;
 * otherwise a sized NativeAffiliateCard so the layout never collapses to empty space.
 */
export function AdSlot({
  slotType,
  minTrafficRequired = 0,
  className = "",
}: AdSlotProps) {
  const reactId = useId();
  const mountRef = useRef<HTMLDivElement>(null);
  const reserved = siteConfig.ads.reservedHeight[slotType];
  const network = siteConfig.ads.networks[slotType];
  const traffic = siteConfig.estimatedMonthlyVisits;
  const scriptPresent = hasAdNetworkScript(slotType);
  const trafficOk =
    siteConfig.forceNetworkAds === true || traffic >= minTrafficRequired;
  const showNetwork = Boolean(scriptPresent && trafficOk && network);

  const offer = siteConfig.ads.affiliateFallback[slotType];

  useEffect(() => {
    if (!showNetwork || !network || !mountRef.current) return;
    loadNetworkScript(network, mountRef.current);
  }, [showNetwork, network]);

  if (!showNetwork) {
    return (
      <div
        className={`ad-slot ad-slot-${slotType} flex w-full justify-center ${className}`}
        style={{ minHeight: reserved }}
        data-ad-fallback="affiliate"
        data-slot={slotType}
      >
        <NativeAffiliateCard offer={offer} slotType={slotType} minHeight={reserved} />
      </div>
    );
  }

  return (
    <div
      className={`ad-slot ad-slot-${slotType} flex w-full justify-center ${className}`}
      style={{ minHeight: reserved }}
      data-ad-network={network.key}
      data-slot={slotType}
      aria-label="Advertisement"
    >
      <div
        ref={mountRef}
        id={`speakur-ad-${slotType}-${reactId.replace(/:/g, "")}`}
        className="flex w-full max-w-full items-center justify-center overflow-hidden"
        style={{
          minHeight: reserved,
          width: network.width ? Math.min(network.width, 720) : undefined,
        }}
      />
    </div>
  );
}

export default AdSlot;
