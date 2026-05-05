import { createHash } from "node:crypto";

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

type GeocodeInput = {
  placeName: string;
  regionBias?: string[];
  countries?: string[];
};

type GeocodeResult = { lng: number; lat: number; confidence: number; matchedPlace: string } | null;

type EnrichmentMapsClient = {
  geocodeBatch: (inputs: GeocodeInput[], opts: { token: string; fetch?: typeof fetch }) => Promise<GeocodeResult[]>;
  offsetDuplicateCoords: (stops: { lng: number; lat: number; stopIndex: number }[]) => { lng: number; lat: number }[];
};

type CachedGeocodeResults = GeocodeResult[];

const itineraryCache = new Map<string, CachedGeocodeResults>();

function getMapboxToken(): string | undefined {
  return process.env.MAPBOX_PUBLIC_TOKEN ?? process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? process.env.MAPBOX_TOKEN;
}

function sortedStrings(values: readonly string[]): string[] {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function isEnrichmentMapsClient(value: unknown): value is EnrichmentMapsClient {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.geocodeBatch === "function" && typeof candidate.offsetDuplicateCoords === "function";
}

async function loadMapsClient(): Promise<EnrichmentMapsClient | undefined> {
  const mapsModulePath = "@repo/maps";
  const sourceModulePath = "../../maps/src/" + "geocoding";

  try {
    const module = await import(mapsModulePath);
    if (isEnrichmentMapsClient(module)) return module;
  } catch {
    // Continue to workspace source fallback below.
  }

  try {
    const module = await import(sourceModulePath);
    return isEnrichmentMapsClient(module) ? module : undefined;
  } catch {
    return undefined;
  }
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
  mapsClient?: EnrichmentMapsClient,
): Promise<Itinerary> {
  const stops = itinerary.days.flatMap((day) => day.stops);
  if (!stops.length) return itinerary;

  const client = mapsClient ?? await loadMapsClient();
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
          regionBias: [stop.region]
        })),
        { token }
      );
      geocodeResults = fetchedResults;
      setCachedResults(cacheKey, fetchedResults);
    } catch {
      return itinerary;
    }
  }

  if (!geocodeResults) return itinerary;

  const readyResults = geocodeResults;

  const coordCandidates = readyResults.flatMap((result, stopIndex) => {
    if (!result) return [];
    return [{ lng: result.lng, lat: result.lat, stopIndex }];
  });
  const adjustedCoords = client.offsetDuplicateCoords(coordCandidates);
  let adjustedIndex = 0;

  readyResults.forEach((result, stopIndex) => {
    if (!result) return;

    const adjusted = adjustedCoords[adjustedIndex];
    adjustedIndex += 1;

    if (!adjusted) return;

    const stop = stops[stopIndex];
    if (!stop) return;

    stop.lng = adjusted.lng;
    stop.lat = adjusted.lat;
    stop.geocodeConfidence = result.confidence;
    stop.geocodeSource = "mapbox";
  });

  return itinerary;
}

export function __resetItineraryCache(): void {
  itineraryCache.clear();
}
