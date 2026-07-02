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

export interface StaticImageParams {
  lng: number;
  lat: number;
  zoom: number;
  width?: number;
  height?: number;
  overlay?: string;
}

/**
 * Builds a Mapbox Static Images API URL only when a valid public token is available
 * and the requested coordinates are finite. Returns null in every other case so that
 * callers can render a design-system schematic fallback instead of a broken/ORB-
 * blocked image response.
 */
export function getMapStaticImageUrl(params: StaticImageParams): string | null {
  const token = getMapProviderToken();
  if (!token) return null;
  
  // If we're forcing a dummy token for playwright or local tests, don't make the network call
  // as it will return a 401 JSON and trigger ORB.
  if (token === "pk.test.force_enabled_token_for_playwright") {
    return null;
  }

  if (!Number.isFinite(params.lng) || !Number.isFinite(params.lat) || !Number.isFinite(params.zoom)) {
    return null;
  }
  const width = params.width ?? 1200;
  const height = params.height ?? 600;
  const overlay = params.overlay && params.overlay.length > 0
    ? `${params.overlay}/${params.lng},${params.lat},${params.zoom}`
    : `${params.lng},${params.lat},${params.zoom}`;
  
  // Mapbox static API does not support the "standard" 3D style.
  // Use a compatible 2D style like "light-v11" to prevent JSON error responses causing ORB.
  return `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/${overlay}/${width}x${height}?access_token=${encodeURIComponent(token)}`;
}
