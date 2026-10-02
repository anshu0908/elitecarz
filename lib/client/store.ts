"use client";
// Tiny localStorage-backed stores (shortlist, compare, recently viewed, consent).
// Every access is wrapped: storage can be unavailable (private mode, blocked).
import { useSyncExternalStore } from "react";

type Listener = () => void;

function createListStore(key: string, max: number) {
  const listeners = new Set<Listener>();
  let cache: string[] | null = null;
  const EMPTY: string[] = [];

  const read = (): string[] => {
    if (cache) return cache;
    try {
      const v = JSON.parse(window.localStorage.getItem(key) ?? "[]");
      cache = Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, max) : [];
    } catch {
      cache = [];
    }
    return cache;
  };
  const write = (next: string[]) => {
    cache = next.slice(0, max);
    try {
      window.localStorage.setItem(key, JSON.stringify(cache));
    } catch {
      /* ignore */
    }
    listeners.forEach((l) => l());
  };
  const subscribe = (l: Listener) => {
    listeners.add(l);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) {
        cache = null;
        l();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(l);
      window.removeEventListener("storage", onStorage);
    };
  };

  return {
    max,
    use: () => useSyncExternalStore(subscribe, read, () => EMPTY),
    toggle(id: string): boolean {
      const cur = read();
      if (cur.includes(id)) {
        write(cur.filter((x) => x !== id));
        return false;
      }
      if (cur.length >= max) return false;
      write([...cur, id]);
      return true;
    },
    remove: (id: string) => write(read().filter((x) => x !== id)),
    pushFront: (id: string) => write([id, ...read().filter((x) => x !== id)]),
    clear: () => write([]),
    get: read,
  };
}

export const shortlistStore = createListStore("ec_shortlist", 50);
export const compareStore = createListStore("ec_compare", 3);
export const recentStore = createListStore("ec_recent", 8);

// Consent: "all" | "essential" | null (not chosen yet)
const consentListeners = new Set<Listener>();
export type Consent = "all" | "essential" | null;
function readConsent(): Consent {
  try {
    const v = window.localStorage.getItem("ec_consent");
    return v === "all" || v === "essential" ? v : null;
  } catch {
    return null;
  }
}
export function setConsent(v: Exclude<Consent, null>) {
  try {
    window.localStorage.setItem("ec_consent", v);
  } catch {
    /* ignore */
  }
  consentListeners.forEach((l) => l());
}
export function useConsent(): Consent | "unknown" {
  return useSyncExternalStore(
    (l) => {
      consentListeners.add(l);
      return () => consentListeners.delete(l);
    },
    readConsent,
    () => "unknown" as const,
  );
}
