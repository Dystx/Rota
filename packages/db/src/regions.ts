import { CreateRegionSchema, RegionSchema, type CreateRegionInput, type Region, type UpdateRegionInput } from "@repo/types";
import { resolveDataClient, type DataClientOptions } from "./clients";

type RawRegionRow = {
  id: string;
  name: string;
  country_slug: string;
  best_for: string[];
  seasonality: string;
  launch_status: string;
  description: string;
};

function slugifyRegionId(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `region-${Date.now()}`;
}

function parseRegionRow(row: RawRegionRow): Region {
  return RegionSchema.parse({
    bestFor: row.best_for,
    countrySlug: row.country_slug,
    description: row.description,
    id: row.id,
    launchStatus: row.launch_status,
    name: row.name,
    seasonality: row.seasonality
  });
}

export async function listRegions(limit = 100, options?: DataClientOptions): Promise<Region[]> {
  const { data, error } = await resolveDataClient(options)
    .from("regions")
    .select("id,name,country_slug,best_for,seasonality,launch_status,description")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return ((data as RawRegionRow[] | null) ?? []).map((row) => parseRegionRow(row));
}

export async function getRegionById(id: string, options?: DataClientOptions): Promise<Region | null> {
  const { data, error } = await resolveDataClient(options)
    .from("regions")
    .select("id,name,country_slug,best_for,seasonality,launch_status,description")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return parseRegionRow(data as RawRegionRow);
}

export async function createRegion(input: CreateRegionInput, options?: DataClientOptions): Promise<Region> {
  const region = CreateRegionSchema.parse(input);
  const nextId = region.id?.trim() || slugifyRegionId(region.name);

  const { data, error } = await resolveDataClient(options)
    .from("regions")
    .insert({
      best_for: region.bestFor,
      country_slug: region.countrySlug,
      description: region.description,
      id: nextId,
      launch_status: region.launchStatus,
      name: region.name,
      seasonality: region.seasonality
    })
    .select("id,name,country_slug,best_for,seasonality,launch_status,description")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create region.");
  }

  return parseRegionRow(data as RawRegionRow);
}

export async function updateRegion(id: string, patch: UpdateRegionInput, options?: DataClientOptions): Promise<Region | null> {
  const nextPatch = CreateRegionSchema.partial().parse(patch);
  const updates: Record<string, string | string[]> = {};

  if (nextPatch.name !== undefined) updates.name = nextPatch.name;
  if (nextPatch.countrySlug !== undefined) updates.country_slug = nextPatch.countrySlug;
  if (nextPatch.bestFor !== undefined) updates.best_for = nextPatch.bestFor;
  if (nextPatch.seasonality !== undefined) updates.seasonality = nextPatch.seasonality;
  if (nextPatch.launchStatus !== undefined) updates.launch_status = nextPatch.launchStatus;
  if (nextPatch.description !== undefined) updates.description = nextPatch.description;

  const { data, error } = await resolveDataClient(options)
    .from("regions")
    .update(updates)
    .eq("id", id)
    .select("id,name,country_slug,best_for,seasonality,launch_status,description")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return parseRegionRow(data as RawRegionRow);
}
