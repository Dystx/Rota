import type { WebVitalsDeviceCategory } from "@repo/analytics";

/**
 * Classify the current browser into a low-cardinality device bucket.
 * Uses viewport width breakpoints aligned with Tailwind's `md`/`lg`
 * (768px tablet, 1024px desktop) so the dimension stays bounded for
 * analytics dashboards and never carries user-agent free text.
 */
export function getDeviceCategory(viewportWidth: number): WebVitalsDeviceCategory {
  if (viewportWidth >= 1024) return "desktop";
  if (viewportWidth >= 768) return "tablet";
  return "mobile";
}

const ANON_DISTINCT_ID_KEY = "rota.analytics.anon_id";

/**
 * Stable opaque distinct id for browser-side analytics. Generated once
 * per browser via `crypto.randomUUID` and cached in `localStorage`.
 * Never an email, never auth-derived. Falls back to a per-session id if
 * storage is unavailable (private mode, SSR).
 */
export function getOrCreateAnonDistinctId(): string {
  try {
    if (typeof window === "undefined") return "anon-ssr";
    const existing = window.localStorage.getItem(ANON_DISTINCT_ID_KEY);
    if (existing && existing.length > 0) return existing;
    const fresh =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `anon-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
    const id = `anon-${fresh}`;
    window.localStorage.setItem(ANON_DISTINCT_ID_KEY, id);
    return id;
  } catch {
    return "anon-fallback";
  }
}
