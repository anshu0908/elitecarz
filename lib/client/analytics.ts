"use client";
// GA4-style event hook (BRIEF §17.10). Events always go to window.dataLayer; the GA
// tag itself is only loaded after analytics consent (see components/site/Analytics.tsx).

type Params = Record<string, string | number | boolean | undefined | null>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(event: string, params: Params = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...params });
  window.gtag?.("event", event, params);
  if (process.env.NODE_ENV !== "production") console.debug("[track]", event, params);
}

/** Records a WhatsApp/call click as a lead event without blocking navigation. */
export function beaconLead(type: "whatsapp_click", carId?: string) {
  try {
    const body = JSON.stringify({ type, carId, pageUrl: location.pathname, utm: readUtm() });
    navigator.sendBeacon?.("/api/leads", new Blob([body], { type: "application/json" }));
  } catch {
    /* ignore */
  }
}

/** UTM params captured on landing and kept for the session (saved into leads). */
export function readUtm(): Record<string, string> | undefined {
  try {
    const stored = sessionStorage.getItem("ec_utm");
    if (stored) return JSON.parse(stored);
    const p = new URLSearchParams(location.search);
    const utm: Record<string, string> = {};
    for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid"]) {
      const v = p.get(k);
      if (v) utm[k] = v;
    }
    if (Object.keys(utm).length) {
      sessionStorage.setItem("ec_utm", JSON.stringify(utm));
      return utm;
    }
  } catch {
    /* ignore */
  }
  return undefined;
}
