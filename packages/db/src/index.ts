import { TripBriefSchema, type TripBrief } from "@repo/types";

export * from "./analytics";
export * from "./access-control";
export * from "./audit";
export * from "./booking-clicks";
export * from "./clients";
export * from "./partners";
export * from "./places";
export * from "./regions";
export * from "./reviewer-assignments";
export * from "./reviewers";
export * from "./roles";

import { createPrivilegedServerDataClient, resolvePrivilegedServerDataClient, type DataClientOptions } from "./clients";

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
  ownerUserId: string | null;
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
  owner_user_id?: string | null;
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

type TripExistenceQuery = PromiseLike<{
  count: number | null;
  error: { message: string } | null;
}>;


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
    ownerUserId: row.owner_user_id ?? null,
    status: row.status,
    title: row.title,
    tripBriefId: String(tripBrief.id),
    tripBriefStatus: tripBrief.status,
    visibility: row.visibility
  };
}

function selectTripsQuery(options?: DataClientOptions) {
  return resolvePrivilegedServerDataClient(options).from("trips").select(
    "id,title,status,visibility,is_paid,has_human_review,owner_user_id,created_at,trip_briefs!inner(id,normalized_json,status)"
  );
}

type RawCreateTripDraftRpcRow = {
  trip_id: number;
  trip_brief_id: number;
};

export async function createTripDraft(brief: TripBrief, options: DataClientOptions & { ownerUserId: string }): Promise<SavedTripDraft> {
  const { data, error } = await resolvePrivilegedServerDataClient(options)
    .rpc("create_trip_draft", {
      p_accommodation_location: brief.accommodationLocation,
      p_avoidances: brief.avoidances,
      p_budget_level: brief.budgetLevel,
      p_destination_country: brief.destinationCountry,
      p_destination_regions: brief.regions,
      p_end_date: brief.endDate || null,
      p_food_preferences: brief.foodPreferences,
      p_interests: brief.interests,
      p_normalized_json: brief,
      p_owner_user_id: options.ownerUserId,
      p_pace: brief.pace,
      p_raw_input: brief.rawBrief,
      p_start_date: brief.startDate || null,
      p_title: buildTripTitle(brief),
      p_transport_mode: brief.transportMode,
      p_traveler_type: brief.travelerType,
      p_travelers_count: brief.travelersCount,
      p_trip_length_days: brief.tripLengthDays
    })
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create draft trip.");
  }

  const tripDraft = data as RawCreateTripDraftRpcRow;

  return {
    tripBriefId: String(tripDraft.trip_brief_id),
    tripId: String(tripDraft.trip_id)
  };
}

export type PaymentWebhookFulfillmentInput = {
  eventId: string;
  purchaseKind: "unlock" | "human_review";
  stripeSessionId: string;
  tripId: string;
  userId: string;
};

export type PaymentWebhookFulfillmentResult = {
  status: "fulfilled" | "duplicate" | "invalid";
  trip?: TripDraftDetail | null;
};

export async function fulfillTripPaymentWebhook(input: PaymentWebhookFulfillmentInput, options?: DataClientOptions): Promise<PaymentWebhookFulfillmentResult> {
  const numericTripId = toNumericTripId(input.tripId);
  if (numericTripId === null) {
    throw new Error("Invalid trip ID");
  }

  const { data, error } = await resolvePrivilegedServerDataClient(options)
    .rpc("fulfill_trip_payment_webhook", {
      p_event_id: input.eventId,
      p_purchase_kind: input.purchaseKind,
      p_stripe_session_id: input.stripeSessionId,
      p_trip_id: numericTripId,
      p_user_id: input.userId
    })
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // The RPC returns { fulfillment_status: "fulfilled" | "duplicate" | "invalid" }.
  // Normalize at the boundary so callers receive a plain status string.
  const rpcRow = data as { fulfillment_status: "fulfilled" | "duplicate" | "invalid" } | null;
  const status: "fulfilled" | "duplicate" | "invalid" = rpcRow?.fulfillment_status ?? "invalid";

  const trip = await getTripDraftById(input.tripId, options);

  return { status, trip };
}

export async function getTripDraftById(tripId: string, options?: DataClientOptions): Promise<TripDraftDetail | null> {
  const numericTripId = toNumericTripId(tripId);

  if (numericTripId === null) {
    return null;
  }

  const { data, error } = await selectTripsQuery(options).eq("id", numericTripId).single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }

    throw new Error(error.message);
  }

  return parseTripRow(data as RawTripRow | null);
}

/**
 * Checks whether a numeric trip ID exists without reading any trip or brief
 * data. This is only for internal access-result classification.
 */
export async function tripDraftExists(tripId: string, options?: DataClientOptions): Promise<boolean> {
  const numericTripId = toNumericTripId(tripId);

  if (numericTripId === null) {
    return false;
  }

  const { count, error } = await (resolvePrivilegedServerDataClient(options)
    .from("trips")
    .select("id", { count: "exact", head: true })
    .eq("id", numericTripId) as unknown as TripExistenceQuery);

  if (error) {
    throw new Error(error.message);
  }

  return (count ?? 0) > 0;
}

/**
 * Fetch a draft only when it belongs to the supplied authenticated owner.
 * This query is deliberately separate from privileged reviewer/admin reads.
 */
export async function getTripDraftByIdForOwner(
  tripId: string,
  ownerUserId: string,
  options?: DataClientOptions
): Promise<TripDraftDetail | null> {
  const numericTripId = toNumericTripId(tripId);

  if (numericTripId === null) {
    return null;
  }

  const { data, error } = await selectTripsQuery(options)
    .eq("id", numericTripId)
    .eq("owner_user_id", ownerUserId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }

    throw new Error(error.message);
  }

  return parseTripRow(data as RawTripRow | null);
}

/** Update only the transport preference for an owned trip draft. */
export async function updateTripTransportMode(
  tripId: string,
  transportMode: "no-car" | "rental-car" | "train-and-transfers",
  ownerUserId: string,
  options?: DataClientOptions
): Promise<boolean> {
  const trip = await getTripDraftByIdForOwner(tripId, ownerUserId, options);
  if (!trip) return false;
  const client = resolvePrivilegedServerDataClient(options);
  const { data, error } = await client
    .from("trip_briefs")
    .update({ transport_mode: transportMode, normalized_json: { ...trip.brief, transportMode } })
    .eq("id", trip.tripBriefId)
    .eq("owner_user_id", ownerUserId)
    .select("id")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return Boolean(data);
}

export async function markTripAsPaid(tripId: string, options?: DataClientOptions): Promise<TripDraftDetail | null> {
  const numericTripId = toNumericTripId(tripId);

  if (numericTripId === null) {
    return null;
  }

  const { data, error } = await resolvePrivilegedServerDataClient(options)
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

  return getTripDraftById(tripId, options);
}

export async function requestTripHumanReview(tripId: string, options?: DataClientOptions): Promise<TripDraftDetail | null> {
  const trip = await getTripDraftById(tripId, options);

  if (!trip || !trip.isPaid || trip.hasHumanReview || trip.status === "in_review") {
    return trip;
  }

  const numericTripId = toNumericTripId(tripId);

  if (numericTripId === null) {
    return null;
  }

  const { data, error } = await resolvePrivilegedServerDataClient(options)
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

  return getTripDraftById(tripId, options);
}

export async function markTripAsHumanReviewed(tripId: string, options?: DataClientOptions): Promise<TripDraftDetail | null> {
  const trip = await getTripDraftById(tripId, options);

  if (!trip || !trip.isPaid || trip.hasHumanReview) {
    return trip;
  }

  const numericTripId = toNumericTripId(tripId);

  if (numericTripId === null) {
    return null;
  }

  const { data, error } = await resolvePrivilegedServerDataClient(options)
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

  return getTripDraftById(tripId, options);
}

export async function listTripDrafts(limit = 12, options?: DataClientOptions): Promise<TripDraftListItem[]> {
  const { data, error } = await selectTripsQuery(options).order("created_at", { ascending: false }).limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data as RawTripRow[] | null) ?? [];

  return rows
    .map((row) => parseTripRow(row))
    .filter((row): row is TripDraftDetail => row !== null)
    .map(({ brief, createdAt, hasHumanReview, id, isPaid, status, title, tripBriefStatus, visibility, ownerUserId }) => ({
      brief,
      createdAt,
      hasHumanReview,
      id,
      isPaid,
      ownerUserId,
      status,
      title,
      tripBriefStatus,
      visibility
    }));
}

/**
 * Fetch the trip drafts OWNED BY a specific user. The base
 * `listTripDrafts` returns every row visible under the current
 * data client's RLS context; the /itineraries page needs a
 * per-user list, so this helper adds an explicit
 * `.eq("owner_user_id", userId)` filter. Calls land under
 * RLS regardless (the service-role bypass doesn't override the
 * WHERE — it just relaxes the row-level filter), so a traveler
 * who has a non-null owner_user_id will only see their own rows.
 *
 * Anonymous callers receive no rows. This keeps a missed route-level auth
 * guard from silently falling back to a privileged, unscoped list query.
 */
export async function getTripsForUser(
  userId: string | null | undefined,
  limit = 24,
  options?: DataClientOptions
): Promise<TripDraftListItem[]> {
  if (!userId) {
    return [];
  }
  const { data, error } = await selectTripsQuery(options)
    .eq("owner_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    throw new Error(error.message);
  }
  const rows = (data as RawTripRow[] | null) ?? [];
  return rows
    .map((row) => parseTripRow(row))
    .filter((row): row is TripDraftDetail => row !== null)
    .map(({ brief, createdAt, hasHumanReview, id, isPaid, status, title, tripBriefStatus, visibility, ownerUserId }) => ({
      brief,
      createdAt,
      hasHumanReview,
      id,
      isPaid,
      ownerUserId,
      status,
      title,
      tripBriefStatus,
      visibility
    }));
}

export {
  SpecialistProfileInputSchema,
  getSpecialistCapabilities,
  getSpecialistProfileByUserId,
  listSpecialists,
  setSpecialistCapabilities,
  setSpecialistVerified,
  upsertSpecialistProfile,
  type CapabilityType,
  type SpecialistCapabilities,
  type SpecialistProfile,
  type SpecialistProfileInput
} from "./specialists";

export {
  getOrgBySlug,
  getOrgBranding,
  type OrgBranding,
  type PublicOrg
} from "./organizations";
