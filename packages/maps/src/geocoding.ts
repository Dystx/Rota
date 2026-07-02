type MapboxGeocodeFeature = {
  place_name?: string;
  properties?: {
    name?: string;
  };
  geometry?: {
    coordinates?: [number, number];
  };
};

export type GeocodeInput = {
  placeName: string;
  regionBias?: string[];
  countries?: string[];
};

export type GeocodeResult =
  | { lng: number; lat: number; confidence: number; matchedPlace: string }
  | null;

export class GeocodingError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "GeocodingError";
    this.status = status;
  }
}

const REGION_CENTROIDS: Record<string, { lng: number; lat: number }> = {
  lisboa: { lng: -9.1393, lat: 38.7223 },
  porto: { lng: -8.6291, lat: 41.1579 },
  madrid: { lng: -3.7038, lat: 40.4168 },
  barcelona: { lng: 2.1734, lat: 41.3851 },
};

const DEFAULT_COUNTRIES = ["pt", "es"];
const MAPBOX_FORWARD_URL = "https://api.mapbox.com/search/geocode/v6/forward";

function getProximity(regionBias?: string[]): string | undefined {
  const key = regionBias?.[0]?.trim().toLowerCase();
  const centroid = key ? REGION_CENTROIDS[key] : undefined;
  return centroid ? `${centroid.lng},${centroid.lat}` : undefined;
}

function getCountries(countries?: string[]): string[] {
  const values = countries?.length ? countries : DEFAULT_COUNTRIES;
  return values.map((country) => country.trim().toLowerCase()).filter(Boolean);
}

async function readJsonResponse(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function parseFeature(feature: MapboxGeocodeFeature): GeocodeResult {
  const coordinates = feature.geometry?.coordinates;
  if (!coordinates || coordinates.length !== 2) {
    return null;
  }

  const relevance = "relevance" in feature ? (feature as { relevance?: unknown }).relevance : undefined;
  if (typeof relevance === "number" && relevance < 0.6) {
    return null;
  }

  return {
    lng: coordinates[0],
    lat: coordinates[1],
    confidence: typeof relevance === "number" ? relevance : 1,
    matchedPlace: feature.place_name ?? feature.properties?.name ?? "",
  };
}

export async function geocodePlace(
  input: GeocodeInput,
  opts: { token: string; fetch?: typeof fetch },
): Promise<GeocodeResult> {
  const fetchImpl = opts.fetch ?? fetch;
  const url = new URL(MAPBOX_FORWARD_URL);
  url.searchParams.set("q", input.placeName);
  url.searchParams.set("access_token", opts.token);
  url.searchParams.set("country", getCountries(input.countries).join(","));

  const proximity = getProximity(input.regionBias);
  if (proximity) {
    url.searchParams.set("proximity", proximity);
  }

  const response = await fetchImpl(url.toString());
  if (!response.ok) {
    const body = await readJsonResponse(response);
    const message = typeof body === "object" && body && "message" in body
      ? String((body as { message?: unknown }).message ?? "Geocoding request failed")
      : "Geocoding request failed";
    throw new GeocodingError(message, response.status);
  }

  const json = (await response.json()) as { features?: MapboxGeocodeFeature[] };
  const feature = json.features?.[0];
  return feature ? parseFeature(feature) : null;
}

export async function geocodeBatch(
  inputs: GeocodeInput[],
  opts: { token: string; fetch?: typeof fetch },
): Promise<GeocodeResult[]> {
  const limit = 4;
  let active = 0;
  const queue: Array<() => void> = [];
  const run = async <T>(task: () => Promise<T>): Promise<T> => {
    if (active >= limit) await new Promise<void>((resolve) => queue.push(resolve));
    active += 1;
    try { return await task(); } finally { active -= 1; queue.shift()?.(); }
  };

  return Promise.all(inputs.map((input) => run(() => geocodePlace(input, opts))));
}

function distanceMeters(a: { lng: number; lat: number }, b: { lng: number; lat: number }): number {
  const rad = Math.PI / 180;
  const earthRadiusMeters = 6371000;
  const deltaLat = (b.lat - a.lat) * rad;
  const deltaLng = (b.lng - a.lng) * rad;
  const sinLat = Math.sin(deltaLat / 2);
  const sinLng = Math.sin(deltaLng / 2);
  const haversine = sinLat * sinLat + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * sinLng * sinLng;
  return 2 * earthRadiusMeters * Math.asin(Math.min(1, Math.sqrt(haversine)));
}

export function offsetDuplicateCoords(
  stops: { lng: number; lat: number; stopIndex: number }[],
): { lng: number; lat: number }[] {
  const adjusted: { lng: number; lat: number }[] = [];
  for (const stop of stops) {
    const duplicate = adjusted.find((coord) => distanceMeters(coord, stop) <= 5);
    if (duplicate) {
      const offset = stop.stopIndex * 17 * 1e-6;
      adjusted.push({ lng: stop.lng + offset, lat: stop.lat + offset });
      continue;
    }
    adjusted.push({ lng: stop.lng, lat: stop.lat });
  }
  return adjusted;
}
