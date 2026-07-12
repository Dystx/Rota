import {
  ACTIVITY_REGIONS,
  type ActivityRegion,
  type EditorialActivity
} from "@/lib/content/activities";

export type GeometryPrecision = "exact" | "approximate";
export type LocationPrivacy = "public" | "coarse";

/** The reviewed, privacy-safe projection consumed by the optional map. */
export type ActivityMapPoint = {
  activityId: string;
  title: string;
  region: ActivityRegion;
  coordinates: { lng: number; lat: number };
  locality: string;
  geometryPrecision: GeometryPrecision;
  locationPrivacy: LocationPrivacy;
  editorialStatus: "reviewed";
  reviewedAt: string;
  verdict: string;
  bestFor: readonly string[];
  durationMinutes: number;
  bestTime: string;
  avoidWhen: string | null;
  bookingNeed: "none" | "consider" | "essential";
  pairWith: readonly string[];
  alternativeId: string | null;
  weatherFit: readonly ("sun" | "rain" | "either")[];
  effortLevel: "easy" | "moderate" | "demanding";
  costBand: "free" | "low" | "medium" | "high" | "varies";
  mobilityNotes: string | null;
  evidenceUrl: string;
  evidenceAttribution: string;
};

/**
 * The content corpus predates the map contract. The input deliberately keeps
 * every map field optional so the adapter can accept either the current
 * EditorialActivity records or a future server-projected ActivityMapPoint.
 */
export type ActivityMapInput =
  Partial<Omit<ActivityMapPoint, "editorialStatus" | "coordinates">> & {
    id?: string;
    placeId?: string;
    editorialStatus?: "reviewed" | "draft" | string;
    coordinates?: { lng?: unknown; lat?: unknown };
  };

export type ActivityMapListItem = {
  activityId: string;
  title: string;
  verdict: string;
  bestTime: string;
  durationMinutes: number | null;
  evidenceUrl: string | null;
  evidenceAttribution: string | null;
  geometryLabel: string;
};

export type ActivityMapFeatureProperties = {
  activityId: string;
  title: string;
  markerLabel: string;
  locality: string;
  geometryPrecision: GeometryPrecision;
  locationPrivacy: LocationPrivacy;
  selected: boolean;
};

export type ActivityMapFallbackModel = {
  required: boolean;
  reason: "invalid-or-missing-geometry" | "no-reviewed-activities" | null;
  message: string;
  items: readonly ActivityMapListItem[];
};

export type ActivityMapModel = {
  points: readonly ActivityMapPoint[];
  features: GeoJSON.FeatureCollection<GeoJSON.Point, ActivityMapFeatureProperties>;
  byActivityId: ReadonlyMap<string, ActivityMapPoint>;
  list: readonly ActivityMapListItem[];
  fallback: ActivityMapFallbackModel;
  invalidActivityIds: readonly string[];
  truncated: boolean;
};

export type ActivityMapViewState = {
  mode: "list" | "map";
  selectedActivityId: string | null;
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
  reducedMotion: boolean;
};

type LocationHint = {
  coordinates: { lng: number; lat: number };
  locality: string;
  geometryPrecision: GeometryPrecision;
  locationPrivacy: LocationPrivacy;
};

/**
 * Coarse public activity areas. These are intentionally not venue entrances
 * or private addresses. A reviewed server projection can replace this table
 * without changing the product facade.
 */
export const ACTIVITY_MAP_LOCATION_HINTS: Readonly<Record<string, LocationHint>> = {
  "porto-ribeira": { coordinates: { lng: -8.611, lat: 41.14 }, locality: "Porto", geometryPrecision: "approximate", locationPrivacy: "coarse" },
  "porto-miguel-bombarda": { coordinates: { lng: -8.621, lat: 41.153 }, locality: "Porto", geometryPrecision: "approximate", locationPrivacy: "coarse" },
  "porto-clerigos": { coordinates: { lng: -8.615, lat: 41.145 }, locality: "Porto", geometryPrecision: "approximate", locationPrivacy: "coarse" },
  "porto-se": { coordinates: { lng: -8.611, lat: 41.143 }, locality: "Porto", geometryPrecision: "approximate", locationPrivacy: "coarse" },
  "porto-palacio-da-bolsa": { coordinates: { lng: -8.615, lat: 41.141 }, locality: "Porto", geometryPrecision: "approximate", locationPrivacy: "coarse" },
  "porto-casa-da-musica": { coordinates: { lng: -8.63, lat: 41.158 }, locality: "Porto", geometryPrecision: "approximate", locationPrivacy: "coarse" },
  "lisbon-alfama": { coordinates: { lng: -9.13, lat: 38.712 }, locality: "Lisbon", geometryPrecision: "approximate", locationPrivacy: "coarse" },
  "lisbon-alfama-fado": { coordinates: { lng: -9.13, lat: 38.712 }, locality: "Lisbon", geometryPrecision: "approximate", locationPrivacy: "coarse" },
  "lisbon-belem": { coordinates: { lng: -9.197, lat: 38.696 }, locality: "Lisbon", geometryPrecision: "approximate", locationPrivacy: "coarse" },
  "lisbon-maat": { coordinates: { lng: -9.19, lat: 38.696 }, locality: "Lisbon", geometryPrecision: "approximate", locationPrivacy: "coarse" },
  "lisbon-rua-augusta-arch": { coordinates: { lng: -9.136, lat: 38.708 }, locality: "Lisbon", geometryPrecision: "approximate", locationPrivacy: "coarse" },
  "lisbon-gulbenkian": { coordinates: { lng: -9.154, lat: 38.736 }, locality: "Lisbon", geometryPrecision: "approximate", locationPrivacy: "coarse" },
  "douro-pinhao-station": { coordinates: { lng: -7.545, lat: 41.191 }, locality: "Pinhão", geometryPrecision: "approximate", locationPrivacy: "coarse" },
  "douro-quinta": { coordinates: { lng: -7.63, lat: 41.18 }, locality: "Douro Valley", geometryPrecision: "approximate", locationPrivacy: "coarse" },
  "douro-casal-de-loivos": { coordinates: { lng: -7.53, lat: 41.2 }, locality: "Douro Valley", geometryPrecision: "approximate", locationPrivacy: "coarse" },
  "douro-museum": { coordinates: { lng: -7.79, lat: 41.16 }, locality: "Peso da Régua", geometryPrecision: "approximate", locationPrivacy: "coarse" },
  "douro-river": { coordinates: { lng: -7.75, lat: 41.17 }, locality: "Douro Valley", geometryPrecision: "approximate", locationPrivacy: "coarse" },
  "algarve-via-algarviana": { coordinates: { lng: -8.65, lat: 37.24 }, locality: "Algarve", geometryPrecision: "approximate", locationPrivacy: "coarse" },
  "algarve-ponta-da-piedade": { coordinates: { lng: -8.67, lat: 37.084 }, locality: "Lagos", geometryPrecision: "approximate", locationPrivacy: "coarse" },
  "algarve-praia-da-marinha": { coordinates: { lng: -8.412, lat: 37.09 }, locality: "Lagoa", geometryPrecision: "approximate", locationPrivacy: "coarse" },
  "algarve-ria-formosa": { coordinates: { lng: -7.98, lat: 37.02 }, locality: "Ria Formosa", geometryPrecision: "approximate", locationPrivacy: "coarse" },
  "algarve-alvor": { coordinates: { lng: -8.59, lat: 37.13 }, locality: "Alvor", geometryPrecision: "approximate", locationPrivacy: "coarse" },
  "azores-sete-cidades": { coordinates: { lng: -25.77, lat: 37.86 }, locality: "São Miguel", geometryPrecision: "approximate", locationPrivacy: "coarse" },
  "azores-furnas": { coordinates: { lng: -25.34, lat: 37.77 }, locality: "São Miguel", geometryPrecision: "approximate", locationPrivacy: "coarse" },
  "azores-lagoa-do-fogo": { coordinates: { lng: -25.47, lat: 37.76 }, locality: "São Miguel", geometryPrecision: "approximate", locationPrivacy: "coarse" },
  "azores-ponta-da-madrugada": { coordinates: { lng: -25.09, lat: 37.74 }, locality: "São Miguel", geometryPrecision: "approximate", locationPrivacy: "coarse" },
  "azores-vila-franca-do-campo": { coordinates: { lng: -25.43, lat: 37.72 }, locality: "São Miguel", geometryPrecision: "approximate", locationPrivacy: "coarse" },
  "azores-porto-formoso-tea": { coordinates: { lng: -25.43, lat: 37.82 }, locality: "São Miguel", geometryPrecision: "approximate", locationPrivacy: "coarse" }
};

const DEFAULT_CENTER: [number, number] = [-8.2245, 39.3999];
const MAP_POINT_LIMIT = 5;

function isEditorialActivity(input: ActivityMapInput): input is ActivityMapInput & Pick<EditorialActivity, "id" | "placeId"> {
  return typeof input.id === "string" && typeof input.placeId === "string";
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function number(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function list(value: unknown): readonly string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0) : [];
}

function validRegion(value: unknown): value is ActivityRegion {
  return typeof value === "string" && (ACTIVITY_REGIONS as readonly string[]).includes(value);
}

function resolveHint(input: ActivityMapInput, activityId: string): LocationHint | undefined {
  return ACTIVITY_MAP_LOCATION_HINTS[activityId] ?? (input.placeId ? ACTIVITY_MAP_LOCATION_HINTS[input.placeId] : undefined);
}

function fallbackItem(input: ActivityMapInput, index: number): ActivityMapListItem {
  const activityId = text(input.activityId) ?? text(input.id) ?? `selected-activity-${index + 1}`;
  return {
    activityId,
    title: text(input.title) ?? "Selected activity",
    verdict: text(input.verdict) ?? "Editorial detail remains available in the activity list.",
    bestTime: text(input.bestTime) ?? "Timing to be confirmed",
    durationMinutes: number(input.durationMinutes),
    evidenceUrl: text(input.evidenceUrl),
    evidenceAttribution: text(input.evidenceAttribution) ?? (isEditorialActivity(input) ? text(input.evidenceUrl) : null),
    geometryLabel: "Location details are not available for the map yet."
  };
}

function projectPoint(input: ActivityMapInput, index: number): { point?: ActivityMapPoint; error?: string } {
  const editorialInput = isEditorialActivity(input);
  const activityId = text(input.activityId) ?? text(input.id);
  const title = text(input.title);
  const region = input.region;
  const hint = activityId ? resolveHint(input, activityId) : undefined;
  const coordinates = input.coordinates ?? hint?.coordinates;
  const lng = number(coordinates?.lng);
  const lat = number(coordinates?.lat);
  const editorialStatus = input.editorialStatus;
  const reviewedAt = text(input.reviewedAt);
  const verdict = text(input.verdict);
  const bestTime = text(input.bestTime);
  const durationMinutes = number(input.durationMinutes);
  const evidenceUrl = text(input.evidenceUrl);
  const evidenceAttribution = text(input.evidenceAttribution) ?? (editorialInput ? evidenceUrl : null);
  const geometryPrecision = input.geometryPrecision ?? (editorialInput ? hint?.geometryPrecision : undefined);
  const locationPrivacy = input.locationPrivacy ?? (editorialInput ? hint?.locationPrivacy : undefined);

  if (!activityId) return { error: `record ${index + 1} has no stable activity id` };
  if (editorialStatus !== "reviewed") return { error: `${activityId} is not reviewed` };
  if (!title || !validRegion(region)) return { error: `${activityId} is missing title or region` };
  if (lng === null || lat === null || lng < -180 || lng > 180 || lat < -90 || lat > 90) {
    return { error: `${activityId} has invalid or missing coordinates` };
  }
  if (geometryPrecision !== "exact" && geometryPrecision !== "approximate") {
    return { error: `${activityId} is missing geometry precision` };
  }
  if (locationPrivacy !== "public" && locationPrivacy !== "coarse") {
    return { error: `${activityId} is missing location privacy` };
  }
  if (!reviewedAt || !verdict || !bestTime || durationMinutes === null || durationMinutes <= 0) {
    return { error: `${activityId} is missing reviewed activity metadata` };
  }
  if (!evidenceUrl || !evidenceAttribution) return { error: `${activityId} is missing evidence attribution` };

  const bookingNeed = input.bookingNeed === "consider" || input.bookingNeed === "essential" ? input.bookingNeed : "none";
  const weatherFit = list(input.weatherFit).filter((weather): weather is "sun" | "rain" | "either" => weather === "sun" || weather === "rain" || weather === "either");
  const point: ActivityMapPoint = {
    activityId,
    title,
    region,
    coordinates: { lng, lat },
    locality: text(input.locality) ?? hint?.locality ?? region,
    geometryPrecision,
    locationPrivacy,
    editorialStatus: "reviewed",
    reviewedAt,
    verdict,
    bestFor: list(input.bestFor),
    durationMinutes,
    bestTime,
    avoidWhen: text(input.avoidWhen),
    bookingNeed,
    pairWith: list(input.pairWith),
    alternativeId: text(input.alternativeId),
    weatherFit,
    effortLevel: input.effortLevel === "easy" || input.effortLevel === "demanding" ? input.effortLevel : "moderate",
    costBand: input.costBand === "free" || input.costBand === "low" || input.costBand === "medium" || input.costBand === "high" ? input.costBand : "varies",
    mobilityNotes: text(input.mobilityNotes),
    evidenceUrl,
    evidenceAttribution
  };
  return { point };
}

function toFeature(point: ActivityMapPoint, index: number): GeoJSON.Feature<GeoJSON.Point, ActivityMapFeatureProperties> {
  return {
    type: "Feature",
    id: point.activityId,
    geometry: { type: "Point", coordinates: [point.coordinates.lng, point.coordinates.lat] },
    properties: {
      activityId: point.activityId,
      title: point.title,
      markerLabel: String(index + 1),
      locality: point.locality,
      geometryPrecision: point.geometryPrecision,
      locationPrivacy: point.locationPrivacy,
      selected: false
    }
  };
}

/**
 * Converts reviewed records to the stable, renderer-agnostic map projection.
 * Invalid records never disappear from `fallback.items`; the list is the
 * authoritative recovery path whenever a point cannot be safely rendered.
 */
export function buildActivityMapModel(inputs: readonly ActivityMapInput[]): ActivityMapModel {
  const points: ActivityMapPoint[] = [];
  const invalidActivityIds: string[] = [];
  const seenIds = new Set<string>();
  const fallbackItems = inputs.map((input, index) => fallbackItem(input, index));

  inputs.forEach((input, index) => {
    const result = projectPoint(input, index);
    const id = text(input.activityId) ?? text(input.id) ?? `selected-activity-${index + 1}`;
    if (!result.point || seenIds.has(result.point.activityId)) {
      invalidActivityIds.push(id);
      return;
    }
    seenIds.add(result.point.activityId);
    points.push(result.point);
  });

  const visiblePoints = points.slice(0, MAP_POINT_LIMIT);
  const byActivityId = new Map(visiblePoints.map((point) => [point.activityId, point] as const));
  const hasInvalid = invalidActivityIds.length > 0;
  const fallbackRequired = hasInvalid || visiblePoints.length === 0;

  return {
    points: visiblePoints,
    features: {
      type: "FeatureCollection",
      features: visiblePoints.map(toFeature)
    },
    byActivityId,
    list: fallbackItems,
    fallback: {
      required: fallbackRequired,
      reason: visiblePoints.length === 0 ? (hasInvalid ? "invalid-or-missing-geometry" : "no-reviewed-activities") : (hasInvalid ? "invalid-or-missing-geometry" : null),
      message: visiblePoints.length === 0
        ? "The activity list is still available while map location evidence is checked."
        : hasInvalid
          ? "Some selected activities do not have safe public map geometry yet; the complete list remains available."
          : "",
      items: fallbackItems
    },
    invalidActivityIds,
    truncated: points.length > MAP_POINT_LIMIT
  };
}

/** Alias kept explicit for callers that prefer an adapter-shaped name. */
export const createActivityMapModel = buildActivityMapModel;

export function getActivityMapBounds(points: readonly ActivityMapPoint[]): [[number, number], [number, number]] | null {
  if (points.length === 0) return null;
  const lngs = points.map((point) => point.coordinates.lng);
  const lats = points.map((point) => point.coordinates.lat);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  if (minLng === maxLng && minLat === maxLat) {
    return [[minLng - 0.01, minLat - 0.01], [maxLng + 0.01, maxLat + 0.01]];
  }
  return [[minLng, minLat], [maxLng, maxLat]];
}

function mapZoom(points: readonly ActivityMapPoint[]): number {
  if (points.length <= 1) return 12;
  const bounds = getActivityMapBounds(points);
  if (!bounds) return 5.6;
  const span = Math.max(bounds[1][0] - bounds[0][0], bounds[1][1] - bounds[0][1]);
  if (span > 8) return 4.6;
  if (span > 3) return 5.5;
  if (span > 1) return 7;
  return 9;
}

export function createActivityMapViewState(
  points: readonly ActivityMapPoint[],
  reducedMotion = false
): ActivityMapViewState {
  const center = points.length === 0
    ? DEFAULT_CENTER
    : [
        points.reduce((total, point) => total + point.coordinates.lng, 0) / points.length,
        points.reduce((total, point) => total + point.coordinates.lat, 0) / points.length
      ] as [number, number];
  return {
    mode: "list",
    selectedActivityId: points[0]?.activityId ?? null,
    center,
    zoom: mapZoom(points),
    pitch: 0,
    bearing: 0,
    reducedMotion
  };
}
