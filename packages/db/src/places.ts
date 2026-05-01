import { CreatePlaceSchema, PlaceSchema, type CreatePlaceInput, type Place, type UpdatePlaceInput } from "@repo/types";
import { createAdminClient } from "./index";

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

export async function listPlaces(limit = 100): Promise<Place[]> {
  const { data, error } = await createAdminClient()
    .from("places")
    .select("id,name,region,category,quality,source_confidence")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return ((data as RawPlaceRow[] | null) ?? []).map((row) => parsePlaceRow(row));
}

export async function getPlaceById(id: string): Promise<Place | null> {
  const { data, error } = await createAdminClient()
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

export async function createPlace(input: CreatePlaceInput): Promise<Place> {
  const place = CreatePlaceSchema.parse(input);
  const nextId = place.id?.trim() || slugifyPlaceId(place.name);

  const { data, error } = await createAdminClient()
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

export async function updatePlace(id: string, patch: UpdatePlaceInput): Promise<Place | null> {
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

  const { data, error } = await createAdminClient()
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
