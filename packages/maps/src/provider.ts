/**
 * Resolves whether the Mapbox provider is enabled for client use.
 */
export function isMapProviderEnabled(): boolean {
  return getMapProviderToken() !== null;
}

/**
 * Retrieves the public map token.
 * Returns null if absent, or if the token appears to be a secret key (must start with pk.).
 */
export function getMapProviderToken(): string | null {
  if (
    typeof window !== "undefined" && 
    window.location.search.includes("forceMapboxProvider=1") &&
    process.env.NODE_ENV !== "production"
  ) {
    return "pk.test.force_enabled_token_for_playwright";
  }

  const token = process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN?.trim();
  
  if (!token) {
    return null;
  }

  // Reject secret tokens (sk...) or anything not starting with pk.
  if (!token.startsWith("pk.")) {
    return null;
  }

  return token;
}
