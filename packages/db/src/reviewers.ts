import { CreateReviewerSchema, ReviewerSchema, type CreateReviewerInput, type Reviewer, type UpdateReviewerInput } from "@repo/types";
import { resolveDataClient, type DataClientOptions } from "./clients";

type RawReviewerRow = {
  id: string;
  name: string;
  country: string;
  regions: string[];
  languages: string[];
  specialties: string[];
  status: string;
  rating: number | null;
  bio: string;
  response_promise: string;
};

function slugifyReviewerId(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `reviewer-${Date.now()}`;
}

function parseReviewerRow(row: RawReviewerRow): Reviewer {
  return ReviewerSchema.parse({
    bio: row.bio,
    country: row.country,
    id: row.id,
    languages: row.languages,
    name: row.name,
    rating: row.rating,
    regions: row.regions,
    responsePromise: row.response_promise,
    specialties: row.specialties,
    status: row.status
  });
}

export async function listReviewers(limit = 100, options?: DataClientOptions): Promise<Reviewer[]> {
  const { data, error } = await resolveDataClient(options)
    .from("reviewers")
    .select("id,name,country,regions,languages,specialties,status,rating,bio,response_promise")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return ((data as RawReviewerRow[] | null) ?? []).map((row) => parseReviewerRow(row));
}

export async function getReviewerById(id: string, options?: DataClientOptions): Promise<Reviewer | null> {
  const { data, error } = await resolveDataClient(options)
    .from("reviewers")
    .select("id,name,country,regions,languages,specialties,status,rating,bio,response_promise")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return parseReviewerRow(data as RawReviewerRow);
}

export async function createReviewer(input: CreateReviewerInput, options?: DataClientOptions): Promise<Reviewer> {
  const reviewer = CreateReviewerSchema.parse(input);
  const nextId = reviewer.id?.trim() || slugifyReviewerId(reviewer.name);

  const { data, error } = await resolveDataClient(options)
    .from("reviewers")
    .insert({
      bio: reviewer.bio,
      country: reviewer.country,
      id: nextId,
      languages: reviewer.languages,
      name: reviewer.name,
      rating: reviewer.rating ?? null,
      regions: reviewer.regions,
      response_promise: reviewer.responsePromise,
      specialties: reviewer.specialties,
      status: reviewer.status
    })
    .select("id,name,country,regions,languages,specialties,status,rating,bio,response_promise")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create reviewer.");
  }

  return parseReviewerRow(data as RawReviewerRow);
}

export async function updateReviewer(id: string, patch: UpdateReviewerInput, options?: DataClientOptions): Promise<Reviewer | null> {
  const nextPatch = CreateReviewerSchema.partial().parse(patch);
  const updates: Record<string, string | string[] | number | null> = {};

  if (nextPatch.name !== undefined) updates.name = nextPatch.name;
  if (nextPatch.country !== undefined) updates.country = nextPatch.country;
  if (nextPatch.regions !== undefined) updates.regions = nextPatch.regions;
  if (nextPatch.languages !== undefined) updates.languages = nextPatch.languages;
  if (nextPatch.specialties !== undefined) updates.specialties = nextPatch.specialties;
  if (nextPatch.status !== undefined) updates.status = nextPatch.status;
  if (nextPatch.rating !== undefined) updates.rating = nextPatch.rating;
  if (nextPatch.bio !== undefined) updates.bio = nextPatch.bio;
  if (nextPatch.responsePromise !== undefined) updates.response_promise = nextPatch.responsePromise;

  const { data, error } = await resolveDataClient(options)
    .from("reviewers")
    .update(updates)
    .eq("id", id)
    .select("id,name,country,regions,languages,specialties,status,rating,bio,response_promise")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return parseReviewerRow(data as RawReviewerRow);
}
