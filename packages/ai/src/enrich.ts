import { createHash } from "node:crypto";

import {
  createNoopAnalyticsProvider,
  resolveDefaultAnalyticsProvider,
  tryCapture,
  type AnalyticsProvider
} from "@repo/analytics";
import { geocodeBatch, offsetDuplicateCoords, type GeocodeInput, type GeocodeResult } from "@repo/maps";
import type { Itinerary, TripBrief } from "@repo/types";

const MAX_CACHE_ENTRIES = 200;

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

type EnrichmentMapsClient = {
  geocodeBatch: (inputs: GeocodeInput[], opts: { token: string; fetch?: typeof fetch }) => Promise<GeocodeResult[]>;
  offsetDuplicateCoords: (stops: { lng: number; lat: number; stopIndex: number }[]) => { lng: number; lat: number }[];
};

type EnrichmentOptions = {
  mapsClient?: EnrichmentMapsClient;
  analytics?: AnalyticsProvider;
};

type CachedGeocodeResults = GeocodeResult[];

const itineraryCache = new Map<string, CachedGeocodeResults>();

function getMapboxToken(): string | undefined {
  return process.env.MAPBOX_SECRET_KEY ?? process.env.MAPBOX_PUBLIC_TOKEN ?? process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? process.env.MAPBOX_TOKEN;
}

function sortedStrings(values: readonly string[]): string[] {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function isEnrichmentMapsClient(value: unknown): value is EnrichmentMapsClient {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.geocodeBatch === "function" && typeof candidate.offsetDuplicateCoords === "function";
}

function loadMapsClient(): EnrichmentMapsClient | undefined {
  const module = { geocodeBatch, offsetDuplicateCoords };
  return isEnrichmentMapsClient(module) ? module : undefined;
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

export async function enrichItineraryWithCoords(
  itinerary: Itinerary,
  brief: TripBrief,
  optionsOrMapsClient?: EnrichmentOptions | EnrichmentMapsClient,
): Promise<Itinerary> {
  const stops = itinerary.days.flatMap((day) => day.stops);
  if (!stops.length) return itinerary;

  const options = isEnrichmentMapsClient(optionsOrMapsClient) ? { mapsClient: optionsOrMapsClient } : optionsOrMapsClient;
  const analytics = getAnalyticsProvider(options?.analytics);
  const startedAt = Date.now();
  const client = options?.mapsClient ?? loadMapsClient();
  if (!client) return itinerary;

  const cacheKey = briefCacheKey(brief);
  let geocodeResults: CachedGeocodeResults | undefined = getCachedResults(cacheKey);

  if (!geocodeResults) {
    const token = getMapboxToken();
    if (!token) return itinerary;

    try {
      const fetchedResults = await client.geocodeBatch(
        stops.map((stop) => ({
          placeName: stop.placeName,
          regionBias: brief.regions,
          countries: ["pt", "es"]
        })),
        { token }
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
    const coordCandidates = dayStopIndexes.flatMap((stopIndex) => {
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
      stop.geocodeSource = "mapbox";
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
}
