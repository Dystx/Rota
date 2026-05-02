/**
 * Resolves whether the Mapbox provider is enabled for client use.
 * Does not throw on missing unrelated config.
 */
export function isMapProviderEnabled(): boolean {
  if (typeof window !== "undefined" && window.location.search.includes("forceMapboxProvider=1")) {
    return true;
  }
  return Boolean(process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN?.trim());
}

/**
 * Retrieves the public map token.
 * Returns null if absent.
 */
export function getMapProviderToken(): string | null {
  if (typeof window !== "undefined" && window.location.search.includes("forceMapboxProvider=1")) {
    return "pk.test.force_enabled_token_for_playwright";
  }
  return process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN?.trim() || null;
}
