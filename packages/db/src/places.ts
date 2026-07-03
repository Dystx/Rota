import { CreatePlaceSchema, PlaceSchema, type CreatePlaceInput, type Place, type UpdatePlaceInput } from "@repo/types";
import { resolveDataClient, type DataClientOptions } from "./clients";

type RawPlaceRow = {
  id: string;
  name: string;
  region: string;
  category: string;
  quality: number | null;
  source_confidence: string;
};

function slugifyPlaceId(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `place-${Date.now()}`;
}

function parsePlaceRow(row: RawPlaceRow): Place {
  return PlaceSchema.parse({
    category: row.category,
    id: row.id,
    name: row.name,
    quality: row.quality,
    region: row.region,
    sourceConfidence: row.source_confidence
  });
}

export async function listPlaces(limit = 100, options?: DataClientOptions): Promise<Place[]> {
  const { data, error } = await resolveDataClient(options)
    .from("places")
    .select("id,name,region,category,quality,source_confidence")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return ((data as RawPlaceRow[] | null) ?? []).map((row) => parsePlaceRow(row));
}

export async function getPlaceById(id: string, options?: DataClientOptions): Promise<Place | null> {
  const { data, error } = await resolveDataClient(options)
    .from("places")
    .select("id,name,region,category,quality,source_confidence")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return parsePlaceRow(data as RawPlaceRow);
}

export async function createPlace(input: CreatePlaceInput, options?: DataClientOptions): Promise<Place> {
  const place = CreatePlaceSchema.parse(input);
  const nextId = place.id?.trim() || slugifyPlaceId(place.name);

  const { data, error } = await resolveDataClient(options)
    .from("places")
    .insert({
      category: place.category,
      id: nextId,
      name: place.name,
      quality: place.quality ?? null,
      region: place.region,
      source_confidence: place.sourceConfidence
    })
    .select("id,name,region,category,quality,source_confidence")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create place.");
  }

  return parsePlaceRow(data as RawPlaceRow);
}

export async function updatePlace(id: string, patch: UpdatePlaceInput, options?: DataClientOptions): Promise<Place | null> {
  const nextPatch = CreatePlaceSchema.partial().parse(patch);
  const updates: Record<string, string | number | null> = {};

  if (nextPatch.name !== undefined) {
    updates.name = nextPatch.name;
  }

  if (nextPatch.region !== undefined) {
    updates.region = nextPatch.region;
  }

  if (nextPatch.category !== undefined) {
    updates.category = nextPatch.category;
  }

  if (nextPatch.quality !== undefined) {
    updates.quality = nextPatch.quality;
  }

  if (nextPatch.sourceConfidence !== undefined) {
    updates.source_confidence = nextPatch.sourceConfidence;
  }

  const { data, error } = await resolveDataClient(options)
    .from("places")
    .update(updates)
    .eq("id", id)
    .select("id,name,region,category,quality,source_confidence")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return parsePlaceRow(data as RawPlaceRow);
}

/** Floor for `places.quality`. The specialist feedback
 *  loop never drops a place below this — once a place
 *  hits the floor, it's flagged for editorial review
 *  rather than continuing to decay. */
export const MIN_PLACE_QUALITY = 0;
/** Maximum decrement per specialist action. Prevents
 *  a single bad-faith action from tanking a place. */
export const MAX_DECREMENT_PER_ACTION = 2;

/** Specialist feedback loop: decrement a place's
 *  `quality` field by `delta` (capped at
 *  `MAX_DECREMENT_PER_ACTION` per call, floored at
 *  `MIN_PLACE_QUALITY`). Returns the new quality, or
 *  null if the place doesn't exist.
 *
 * The loop is wired in two places:
 *   - The side-by-side review panel's
 *     `onSwapForHiddenGem` callback (PR-10) — when a
 *     specialist swaps a stop, decrement by 1.
 *   - The "Fix logistics bottleneck" action — decrement
 *     by 1.
 *
 * A future PR adds the periodic aggregation job: if N
 *  specialists in M days all flag the same place, the
 *  platform automatically applies a larger decrement.
 *  That lives in `apps/workers` (QStash-cron). This PR
 *  ships the single-action API. */
export async function decrementPlaceQuality(
  id: string,
  delta = 1,
  options?: DataClientOptions
): Promise<{ newQuality: number; place: Place } | null> {
  const safeDelta = Math.max(0, Math.min(delta, MAX_DECREMENT_PER_ACTION));
  const current = await getPlaceById(id, options);
  if (!current) return null;
  const currentQuality = current.quality ?? 5;
  const newQuality = Math.max(MIN_PLACE_QUALITY, currentQuality - safeDelta);
  if (newQuality === currentQuality) {
    // Already at the floor; no-op.
    return { newQuality, place: current };
  }
  const updated = await updatePlace(
    id,
    { ...current, quality: newQuality },
    options
  );
  if (!updated) return null;
  return { newQuality, place: updated };
}
