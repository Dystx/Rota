/**
 * Itinerary enrichment — geocodes the place names in an AI-generated
 * itinerary into real coordinates and writes them back onto each
 * stop. The coordinates feed the spatial-engine map surface on
 * `/trip/[tripId]` and `/trip/[tripId]/map`.
 *
 * Phase 1e migration: this module used to import `geocodeBatch`
 * + `offsetDuplicateCoords` from `@repo/maps` (Mapbox-backed).
 * The geocoder is now Nominatim (OpenStreetMap's free forward
 * search) and the dedup helper has been inlined into
 * `./lib/dedup-coords.ts`. The public return shape
 * (`{ lng, lat, confidence, matchedPlace } | null`) is
 * unchanged so the rest of the app doesn't notice.
 *
 * Rate-limit handling: Nominatim's public instance allows 1 req/s
 * per the OSM usage policy. `geocodeBatch` serialises requests
 * (1s between calls) and caches results in a module-level
 * `Map` so a brief that's enriched twice doesn't hit the
 * network twice.
 *
 * The `geocodeSource` enum on `TripStopSchema` keeps the
 * historical `"mapbox"` value for backward compat with any
 * persisted rows, but new enrichments write `"nominatim"`.
 */

import { createHash } from "node:crypto";

import {
  createNoopAnalyticsProvider,
  resolveDefaultAnalyticsProvider,
  tryCapture,
  type AnalyticsProvider
} from "@repo/analytics";
import type { Itinerary, TripBrief } from "@repo/types";

import { offsetDuplicateCoords, type DedupInput } from "./lib/dedup-coords";

const MAX_CACHE_ENTRIES = 200;
const NOMINATIM_MIN_INTERVAL_MS = 1000;
const DEFAULT_NOMINATIM_URL = "https://nominatim.openstreetmap.org";
const DEFAULT_COUNTRIES = ["pt", "es"];

type BriefProjection = {
  destinationCountry: TripBrief["destinationCountry"];
  regions: string[];
  tripLengthDays: TripBrief["tripLengthDays"];
  startDate: TripBrief["startDate"];
  endDate: TripBrief["endDate"];
  travelersCount: TripBrief["travelersCount"];
  travelerType: TripBrief["travelerType"];
  budgetLevel: TripBrief["budgetLevel"];
  pace: TripBrief["pace"];
  interests: string[];
  foodPreferences: string[];
  avoidances: string[];
  transportMode: TripBrief["transportMode"];
  accommodationLocation: TripBrief["accommodationLocation"];
  rawBrief: TripBrief["rawBrief"];
};

export type GeocodeInput = {
  placeName: string;
  regionBias?: string[];
  countries?: string[];
};

export type GeocodeResult =
  | { lng: number; lat: number; confidence: number; matchedPlace: string }
  | null;

/**
 * Public shape of the maps client. Kept compatible with the
 * pre-migration test suite (`packages/ai/src/enrich.test.ts`),
 * which injects its own `geocodeBatch` + `offsetDuplicateCoords`
 * to assert the enrichment flow without hitting Nominatim.
 */
export type EnrichmentMapsClient = {
  geocodeBatch: (inputs: GeocodeInput[]) => Promise<GeocodeResult[]>;
  offsetDuplicateCoords: (stops: DedupInput[]) => { lng: number; lat: number }[];
};

type EnrichmentOptions = {
  mapsClient?: EnrichmentMapsClient;
  analytics?: AnalyticsProvider;
};

type CachedGeocodeResults = GeocodeResult[];

const itineraryCache = new Map<string, CachedGeocodeResults>();
const geocodeCache = new Map<string, GeocodeResult>();
let lastNominatimRequestAt = 0;

function getNominatimUrl(): string {
  return process.env.NEXT_PUBLIC_NOMINATIM_URL?.trim() || DEFAULT_NOMINATIM_URL;
}

function sortedStrings(values: readonly string[]): string[] {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function getResolvedCountries(countries?: string[]): string[] {
  const values = countries && countries.length > 0 ? countries : DEFAULT_COUNTRIES;
  return values.map((country) => country.trim().toLowerCase()).filter(Boolean);
}

function isEnrichmentMapsClient(value: unknown): value is EnrichmentMapsClient {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.geocodeBatch === "function" &&
    typeof candidate.offsetDuplicateCoords === "function"
  );
}

function defaultMapsClient(): EnrichmentMapsClient {
  return {
    geocodeBatch: (inputs) => geocodeBatch(inputs),
    offsetDuplicateCoords
  };
}

function getAnalyticsProvider(analytics?: AnalyticsProvider): AnalyticsProvider {
  if (analytics) return analytics;

  try {
    return resolveDefaultAnalyticsProvider();
  } catch {
    return createNoopAnalyticsProvider();
  }
}

function getAnalyticsTripId(brief: TripBrief): string {
  return briefCacheKey(brief).slice(0, 16);
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Geocoding failed";
}

function logGeocodingFailure(error: unknown): void {
  console.error("Failed to geocode itinerary stops.", error);
}

async function captureGeocodeCompleted(params: {
  analytics: AnalyticsProvider;
  brief: TripBrief;
  stopCount: number;
  geocodedCount: number;
  lowConfidenceCount: number;
  durationMs: number;
  error?: string;
}): Promise<void> {
  await tryCapture(params.analytics, {
    name: "cinematic_geocode_completed",
    distinctId: `trip:${getAnalyticsTripId(params.brief)}`,
    properties: {
      tripId: getAnalyticsTripId(params.brief),
      stopCount: params.stopCount,
      geocodedCount: params.geocodedCount,
      lowConfidenceCount: params.lowConfidenceCount,
      durationMs: params.durationMs,
      ...(params.error ? { error: params.error } : {})
    }
  });
}

export function briefCacheKey(brief: TripBrief): string {
  const sortedProjection: BriefProjection = {
    destinationCountry: brief.destinationCountry,
    regions: sortedStrings(brief.regions),
    tripLengthDays: brief.tripLengthDays,
    startDate: brief.startDate,
    endDate: brief.endDate,
    travelersCount: brief.travelersCount,
    travelerType: brief.travelerType,
    budgetLevel: brief.budgetLevel,
    pace: brief.pace,
    interests: sortedStrings(brief.interests),
    foodPreferences: sortedStrings(brief.foodPreferences),
    avoidances: sortedStrings(brief.avoidances),
    transportMode: brief.transportMode,
    accommodationLocation: brief.accommodationLocation,
    rawBrief: brief.rawBrief
  };

  return createHash("sha1").update(JSON.stringify(sortedProjection)).digest("hex");
}

function getCachedResults(cacheKey: string): CachedGeocodeResults | undefined {
  const cached = itineraryCache.get(cacheKey);
  if (!cached) return undefined;

  itineraryCache.delete(cacheKey);
  itineraryCache.set(cacheKey, cached);
  return cached;
}

function setCachedResults(cacheKey: string, results: CachedGeocodeResults): void {
  if (itineraryCache.has(cacheKey)) {
    itineraryCache.delete(cacheKey);
  }

  itineraryCache.set(cacheKey, results);

  if (itineraryCache.size > MAX_CACHE_ENTRIES) {
    const oldestKey = itineraryCache.keys().next().value;
    if (oldestKey !== undefined) {
      itineraryCache.delete(oldestKey);
    }
  }
}

/**
 * Wait until the OSM-mandated 1-second minimum interval has
 * elapsed since the last Nominatim request. Serialises every
 * call site to stay below the rate limit even under load.
 *
 * The interval is read from `NOMINATIM_MIN_INTERVAL_MS` (in
 * milliseconds) so tests can set it to `0` to skip the wait.
 */
async function waitForNominatimRateLimit(): Promise<void> {
  const interval = Number(process.env.NOMINATIM_MIN_INTERVAL_MS) > -1
    ? Number(process.env.NOMINATIM_MIN_INTERVAL_MS)
    : NOMINATIM_MIN_INTERVAL_MS;
  const elapsed = Date.now() - lastNominatimRequestAt;
  const remaining = interval - elapsed;
  if (remaining > 0) {
    await new Promise<void>((resolve) => setTimeout(resolve, remaining));
  }
  lastNominatimRequestAt = Date.now();
}

type NominatimEntry = {
  lat?: string;
  lon?: string;
  display_name?: string;
  importance?: number;
};

/**
 * Forward-geocode a single place name via Nominatim. Returns
 * `null` when the result is empty, lacks coordinates, or falls
 * below the confidence threshold. The `confidence` field is
 * Nominatim's `importance` (0..1); we treat anything below 0.6
 * as low-confidence and drop it, matching the Mapbox-era
 * behaviour.
 */
async function fetchNominatim(
  input: GeocodeInput,
  fetchImpl: typeof fetch
): Promise<GeocodeResult> {
  const url = new URL(`${getNominatimUrl()}/search`);
  url.searchParams.set("q", input.placeName);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  const countries = getResolvedCountries(input.countries);
  if (countries.length > 0) {
    url.searchParams.set("countrycodes", countries.join(","));
  }

  await waitForNominatimRateLimit();

  const response = await fetchImpl(url.toString(), {
    headers: {
      // Nominatim usage policy requires a descriptive User-Agent.
      "User-Agent": "Rota/1.0 (https://rota.test)"
    }
  });

  if (!response.ok) {
    return null;
  }

  const body = (await response.json()) as NominatimEntry[] | NominatimEntry;
  const entries = Array.isArray(body) ? body : [body];
  const first = entries[0];
  if (!first) return null;

  const lat = Number(first.lat);
  const lng = Number(first.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const importance = typeof first.importance === "number" ? first.importance : 0.5;
  if (importance < 0.6) return null;

  return {
    lat,
    lng,
    confidence: importance,
    matchedPlace: first.display_name ?? input.placeName
  };
}

function geocodeCacheKey(input: GeocodeInput): string {
  const countries = getResolvedCountries(input.countries).join(",");
  const bias = input.regionBias ? sortedStrings(input.regionBias).join(",") : "";
  return `${input.placeName}|${bias}|${countries}`;
}

/**
 * Geocode a single place. Cached in `geocodeCache` for the
 * process lifetime — Nominatim results are stable enough that
 * an in-process `Map` is fine.
 */
export async function geocodePlace(
  input: GeocodeInput,
  fetchImpl: typeof fetch = fetch
): Promise<GeocodeResult> {
  const key = geocodeCacheKey(input);
  if (geocodeCache.has(key)) {
    return geocodeCache.get(key) ?? null;
  }

  const result = await fetchNominatim(input, fetchImpl);
  geocodeCache.set(key, result);
  return result;
}

/**
 * Geocode a batch of inputs. Calls are serialised with a 1s
 * delay between them so a 10-stop batch takes ~10s to complete —
 * Nominatim's public instance is throttled, not concurrent. The
 * 1s delay is bypassed when every input hits the in-process
 * cache.
 */
export async function geocodeBatch(
  inputs: readonly GeocodeInput[],
  fetchImpl: typeof fetch = fetch
): Promise<GeocodeResult[]> {
  const results: GeocodeResult[] = [];
  for (const input of inputs) {
    const key = geocodeCacheKey(input);
    if (geocodeCache.has(key)) {
      results.push(geocodeCache.get(key) ?? null);
      continue;
    }

    const result = await fetchNominatim(input, fetchImpl);
    geocodeCache.set(key, result);
    results.push(result);
  }
  return results;
}

export async function enrichItineraryWithCoords(
  itinerary: Itinerary,
  brief: TripBrief,
  optionsOrMapsClient?: EnrichmentOptions | EnrichmentMapsClient
): Promise<Itinerary> {
  const stops = itinerary.days.flatMap((day) => day.stops);
  if (!stops.length) return itinerary;

  const options = isEnrichmentMapsClient(optionsOrMapsClient)
    ? { mapsClient: optionsOrMapsClient }
    : optionsOrMapsClient;
  const analytics = getAnalyticsProvider(options?.analytics);
  const startedAt = Date.now();
  const client = options?.mapsClient ?? defaultMapsClient();

  const cacheKey = briefCacheKey(brief);
  let geocodeResults: CachedGeocodeResults | undefined = getCachedResults(cacheKey);

  if (!geocodeResults) {
    try {
      const fetchedResults = await client.geocodeBatch(
        stops.map((stop) => ({
          placeName: stop.placeName,
          regionBias: brief.regions,
          countries: DEFAULT_COUNTRIES
        }))
      );
      geocodeResults = fetchedResults;
      setCachedResults(cacheKey, fetchedResults);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      logGeocodingFailure(error);
      await captureGeocodeCompleted({
        analytics,
        brief,
        stopCount: stops.length,
        geocodedCount: 0,
        lowConfidenceCount: stops.length,
        durationMs: Date.now() - startedAt,
        error: errorMessage
      });
      return itinerary;
    }
  }

  if (!geocodeResults) return itinerary;

  const readyResults = geocodeResults;

  let geocodedCount = 0;

  itinerary.days.forEach((day) => {
    const dayStopIndexes = day.stops.map((stop) => stops.indexOf(stop));
    const coordCandidates = dayStopIndexes.flatMap((stopIndex): DedupInput[] => {
      const result = readyResults[stopIndex];
      if (!result) return [];
      return [{ lng: result.lng, lat: result.lat, stopIndex }];
    });
    const adjustedCoords = client.offsetDuplicateCoords(coordCandidates);
    let adjustedIndex = 0;

    for (const stopIndex of dayStopIndexes) {
      const result = readyResults[stopIndex];
      if (!result) continue;

      const adjusted = adjustedCoords[adjustedIndex];
      adjustedIndex += 1;

      if (!adjusted) continue;

      const stop = stops[stopIndex];
      if (!stop) continue;

      stop.lng = adjusted.lng;
      stop.lat = adjusted.lat;
      stop.geocodeConfidence = result.confidence;
      // `"nominatim"` is the new canonical source; `"mapbox"` stays
      // in the schema enum for backward compat with persisted rows.
      stop.geocodeSource = "nominatim";
      geocodedCount += 1;
    }
  });

  await captureGeocodeCompleted({
    analytics,
    brief,
    stopCount: stops.length,
    geocodedCount,
    lowConfidenceCount: readyResults.filter((result) => !result).length,
    durationMs: Date.now() - startedAt
  });

  return itinerary;
}

export function __resetItineraryCache(): void {
  itineraryCache.clear();
  geocodeCache.clear();
}
