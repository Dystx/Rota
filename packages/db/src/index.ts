import { createClient } from "@supabase/supabase-js";
import { TripBriefSchema, type TripBrief } from "@repo/types";

export { createAdminClient };
export * from "./booking-clicks";
export * from "./places";
export * from "./partners";
export * from "./regions";
export * from "./reviewer-assignments";
export * from "./reviewers";

type SavedTripDraft = {
  tripBriefId: string;
  tripId: string;
};

export type TripDraftListItem = {
  id: string;
  title: string;
  status: string;
  visibility: string;
  createdAt: string;
  brief: TripBrief;
  hasHumanReview: boolean;
  isPaid: boolean;
  tripBriefStatus: string;
};

export type TripDraftDetail = TripDraftListItem & {
  hasHumanReview: boolean;
  isPaid: boolean;
  tripBriefId: string;
  tripBriefStatus: string;
};

type RawTripRow = {
  id: number | string;
  title: string;
  status: string;
  visibility: string;
  created_at: string;
  is_paid?: boolean;
  has_human_review?: boolean;
  trip_briefs:
    | {
        id: number | string;
        normalized_json: unknown;
        status: string;
      }
    | {
        id: number | string;
        normalized_json: unknown;
        status: string;
      }[]
    | null;
};

function requireEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "SUPABASE_SERVICE_ROLE_KEY") {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function createAdminClient() {
  return createClient(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false
    }
  });
}

function buildTripTitle(brief: TripBrief) {
  const firstRegion = brief.regions[0]?.replace(/-/g, " ") ?? "Portugal";

  return `${brief.tripLengthDays}-day ${firstRegion} route`;
}

function toNumericTripId(tripId: string) {
  const numericTripId = Number(tripId);

  return Number.isInteger(numericTripId) ? numericTripId : null;
}

function parseTripRow(row: RawTripRow | null): TripDraftDetail | null {
  if (!row?.trip_briefs) {
    return null;
  }

  const tripBrief = Array.isArray(row.trip_briefs) ? row.trip_briefs[0] : row.trip_briefs;

  if (!tripBrief) {
    return null;
  }

  const parsedBrief = TripBriefSchema.safeParse(tripBrief.normalized_json);

  if (!parsedBrief.success) {
    throw new Error("Saved trip brief payload is invalid.");
  }

  return {
    brief: parsedBrief.data,
    createdAt: row.created_at,
    hasHumanReview: row.has_human_review ?? false,
    id: String(row.id),
    isPaid: row.is_paid ?? false,
    status: row.status,
    title: row.title,
    tripBriefId: String(tripBrief.id),
    tripBriefStatus: tripBrief.status,
    visibility: row.visibility
  };
}

function selectTripsQuery() {
  return createAdminClient().from("trips").select(
    "id,title,status,visibility,is_paid,has_human_review,created_at,trip_briefs!inner(id,normalized_json,status)"
  );
}

export function isPersistenceConfigError(error: unknown) {
  return error instanceof Error && error.message.startsWith("Missing required environment variable");
}

export async function createTripDraft(brief: TripBrief): Promise<SavedTripDraft> {
  const supabase = createAdminClient();

  const { data: tripBrief, error: tripBriefError } = await supabase
    .from("trip_briefs")
    .insert({
      accommodation_location: brief.accommodationLocation,
      avoidances: brief.avoidances,
      budget_level: brief.budgetLevel,
      destination_country: brief.destinationCountry,
      destination_regions: brief.regions,
      end_date: brief.endDate || null,
      food_preferences: brief.foodPreferences,
      interests: brief.interests,
      normalized_json: brief,
      pace: brief.pace,
      raw_input: brief.rawBrief,
      start_date: brief.startDate || null,
      status: "submitted",
      transport_mode: brief.transportMode,
      traveler_type: brief.travelerType,
      travelers_count: brief.travelersCount,
      trip_length_days: brief.tripLengthDays
    })
    .select("id")
    .single();

  if (tripBriefError || !tripBrief) {
    throw new Error(tripBriefError?.message ?? "Failed to save trip brief.");
  }

  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .insert({
      country_slug: brief.destinationCountry,
      has_human_review: false,
      is_paid: false,
      status: "draft",
      title: buildTripTitle(brief),
      trip_brief_id: tripBrief.id,
      visibility: "private"
    })
    .select("id")
    .single();

  if (tripError || !trip) {
    throw new Error(tripError?.message ?? "Failed to create draft trip.");
  }

  return {
    tripBriefId: String(tripBrief.id),
    tripId: String(trip.id)
  };
}

export async function getTripDraftById(tripId: string): Promise<TripDraftDetail | null> {
  const numericTripId = toNumericTripId(tripId);

  if (numericTripId === null) {
    return null;
  }

  const { data, error } = await selectTripsQuery().eq("id", numericTripId).single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }

    throw new Error(error.message);
  }

  return parseTripRow(data as RawTripRow | null);
}

export async function markTripAsPaid(tripId: string): Promise<TripDraftDetail | null> {
  const numericTripId = toNumericTripId(tripId);

  if (numericTripId === null) {
    return null;
  }

  const { data, error } = await createAdminClient()
    .from("trips")
    .update({ is_paid: true, status: "paid" })
    .eq("id", numericTripId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return getTripDraftById(tripId);
}

export async function requestTripHumanReview(tripId: string): Promise<TripDraftDetail | null> {
  const trip = await getTripDraftById(tripId);

  if (!trip || !trip.isPaid || trip.hasHumanReview || trip.status === "in_review") {
    return trip;
  }

  const numericTripId = toNumericTripId(tripId);

  if (numericTripId === null) {
    return null;
  }

  const { data, error } = await createAdminClient()
    .from("trips")
    .update({ status: "in_review" })
    .eq("id", numericTripId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return getTripDraftById(tripId);
}

export async function markTripAsHumanReviewed(tripId: string): Promise<TripDraftDetail | null> {
  const trip = await getTripDraftById(tripId);

  if (!trip || !trip.isPaid || trip.hasHumanReview) {
    return trip;
  }

  const numericTripId = toNumericTripId(tripId);

  if (numericTripId === null) {
    return null;
  }

  const { data, error } = await createAdminClient()
    .from("trips")
    .update({ has_human_review: true, status: "reviewed" })
    .eq("id", numericTripId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return getTripDraftById(tripId);
}

export async function listTripDrafts(limit = 12): Promise<TripDraftListItem[]> {
  const { data, error } = await selectTripsQuery().order("created_at", { ascending: false }).limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data as RawTripRow[] | null) ?? [];

  return rows
    .map((row) => parseTripRow(row))
    .filter((row): row is TripDraftDetail => row !== null)
    .map(({ brief, createdAt, hasHumanReview, id, isPaid, status, title, tripBriefStatus, visibility }) => ({
      brief,
      createdAt,
      hasHumanReview,
      id,
      isPaid,
      status,
      title,
      tripBriefStatus,
      visibility
    }));
}
