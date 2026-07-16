'use client';

import { useSyncExternalStore } from "react";

export interface MediaPreferences {
  prefersReducedMotion: boolean;
  prefersReducedData: boolean;
  isLowPower: boolean;
}

const DEFAULT_MEDIA_PREFERENCES: MediaPreferences = {
  prefersReducedMotion: false,
  prefersReducedData: false,
  isLowPower: false
};

let snapshot: MediaPreferences = DEFAULT_MEDIA_PREFERENCES;
let listeners = new Set<() => void>();

function readMediaPreferences(): MediaPreferences {
  if (typeof window === "undefined") return DEFAULT_MEDIA_PREFERENCES;

  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const prefersReducedData = window.matchMedia?.("(prefers-reduced-data: reduce)").matches ?? false;
  const deviceMemory = "deviceMemory" in navigator ? Number(navigator.deviceMemory) : undefined;
  const hardwareConcurrency = navigator.hardwareConcurrency;
  const isLowPower =
    prefersReducedData ||
    (typeof deviceMemory === "number" && deviceMemory > 0 && deviceMemory <= 2) ||
    (typeof hardwareConcurrency === "number" && hardwareConcurrency > 0 && hardwareConcurrency <= 2);

  if (
    snapshot.prefersReducedMotion === prefersReducedMotion &&
    snapshot.prefersReducedData === prefersReducedData &&
    snapshot.isLowPower === isLowPower
  ) {
    return snapshot;
  }

  snapshot = { prefersReducedMotion, prefersReducedData, isLowPower };
  return snapshot;
}

function notify(): void {
  readMediaPreferences();
  for (const listener of listeners) listener();
}

function subscribe(onStoreChange: () => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => undefined;
  }

  listeners.add(onStoreChange);
  const queries = [
    window.matchMedia("(prefers-reduced-motion: reduce)"),
    window.matchMedia("(prefers-reduced-data: reduce)")
  ];
  for (const query of queries) query.addEventListener?.("change", notify);

  return () => {
    for (const query of queries) query.removeEventListener?.("change", notify);
    listeners.delete(onStoreChange);
  };
}

/** SSR-safe media preferences used by poster-first cinematic surfaces. */
export function useMediaPreferences(): MediaPreferences {
  return useSyncExternalStore(subscribe, readMediaPreferences, () => DEFAULT_MEDIA_PREFERENCES);
}

export { DEFAULT_MEDIA_PREFERENCES };
