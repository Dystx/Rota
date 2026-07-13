import "server-only";

import { TripBriefSchema, type TripBrief } from "@repo/types";
import { and, desc, eq } from "drizzle-orm";

import { withActor, type DatabaseActor } from "./actor";
import { tripBriefs, trips } from "./schema";

export type PostgresTripDraft = {
  tripBriefId: string;
  tripId: string;
};

export type PostgresTripDraftDetail = {
  brief: TripBrief;
  createdAt: string;
  hasHumanReview: boolean;
  id: string;
  isPaid: boolean;
  ownerUserId: string | null;
  status: string;
  title: string;
  tripBriefId: string;
  tripBriefStatus: string;
  visibility: string;
};

function buildTripTitle(brief: TripBrief) {
  const firstRegion = brief.regions[0]?.replace(/-/g, " ") ?? "Portugal";
  return `${brief.tripLengthDays}-day ${firstRegion} route`;
}

function dateOnly(value: string | undefined) {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

export async function createPostgresTripDraft(brief: TripBrief, actor: DatabaseActor): Promise<PostgresTripDraft> {
  return withActor(actor, async ({ db }) => {
    const [briefRow] = await db
      .insert(tripBriefs)
      .values({
        accommodationLocation: brief.accommodationLocation,
        avoidances: brief.avoidances,
        budgetLevel: brief.budgetLevel,
        destinationCountry: brief.destinationCountry,
        destinationRegions: brief.regions,
        endDate: dateOnly(brief.endDate),
        foodPreferences: brief.foodPreferences,
        interests: brief.interests,
        normalizedJson: brief,
        ownerUserId: actor.userId,
        pace: brief.pace,
        rawInput: brief.rawBrief,
        startDate: dateOnly(brief.startDate),
        transportMode: brief.transportMode,
        travelerType: brief.travelerType,
        travelersCount: brief.travelersCount,
        tripLengthDays: brief.tripLengthDays
      })
      .returning({ id: tripBriefs.id });

    if (!briefRow) {
      throw new Error("Failed to create trip brief.");
    }

    const [tripRow] = await db
      .insert(trips)
      .values({
        countrySlug: brief.destinationCountry,
        ownerUserId: actor.userId,
        title: buildTripTitle(brief),
        tripBriefId: briefRow.id
      })
      .returning({ id: trips.id });

    if (!tripRow) {
      throw new Error("Failed to create trip draft.");
    }

    return { tripBriefId: String(briefRow.id), tripId: String(tripRow.id) };
  });
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function parseTripRow(row: {
  brief: unknown;
  briefId: string;
  briefStatus: string;
  createdAt: Date;
  hasHumanReview: boolean;
  id: string;
  isPaid: boolean;
  ownerUserId: string | null;
  status: string;
  title: string;
  visibility: string;
}): PostgresTripDraftDetail {
  const parsedBrief = TripBriefSchema.safeParse(row.brief);
  if (!parsedBrief.success) {
    throw new Error("Saved trip brief payload is invalid.");
  }

  return {
    brief: parsedBrief.data,
    createdAt: row.createdAt.toISOString(),
    hasHumanReview: row.hasHumanReview,
    id: row.id,
    isPaid: row.isPaid,
    ownerUserId: row.ownerUserId,
    status: row.status,
    title: row.title,
    tripBriefId: row.briefId,
    tripBriefStatus: row.briefStatus,
    visibility: row.visibility
  };
}

async function selectPostgresTripRows(actor: DatabaseActor, ownerUserId?: string, tripId?: string, limit = 24) {
  return withActor(actor, async ({ db }) => {
    if (tripId && !isUuid(tripId)) {
      return [];
    }

    const conditions = [];
    if (ownerUserId) conditions.push(eq(trips.ownerUserId, ownerUserId));
    if (tripId) conditions.push(eq(trips.id, tripId));

    const query = db
      .select({
        brief: tripBriefs.normalizedJson,
        briefId: tripBriefs.id,
        briefStatus: tripBriefs.status,
        createdAt: trips.createdAt,
        hasHumanReview: trips.hasHumanReview,
        id: trips.id,
        isPaid: trips.isPaid,
        ownerUserId: trips.ownerUserId,
        status: trips.status,
        title: trips.title,
        visibility: trips.visibility
      })
      .from(trips)
      .innerJoin(tripBriefs, eq(tripBriefs.id, trips.tripBriefId))
      .orderBy(desc(trips.createdAt))
      .limit(limit);

    return conditions.length === 0 ? query : query.where(and(...conditions));
  });
}

export async function listPostgresTripDrafts(limit: number, actor: DatabaseActor): Promise<PostgresTripDraftDetail[]> {
  const rows = await selectPostgresTripRows(actor, undefined, undefined, limit);
  return rows.map(parseTripRow);
}

export async function listPostgresTripsForUser(userId: string, limit: number, actor: DatabaseActor): Promise<PostgresTripDraftDetail[]> {
  const rows = await selectPostgresTripRows(actor, userId, undefined, limit);
  return rows.map(parseTripRow);
}

export async function getPostgresTripDraftById(tripId: string, actor: DatabaseActor): Promise<PostgresTripDraftDetail | null> {
  const rows = await selectPostgresTripRows(actor, undefined, tripId, 1);
  return rows[0] ? parseTripRow(rows[0]) : null;
}

export async function getPostgresTripDraftByIdForOwner(tripId: string, ownerUserId: string, actor: DatabaseActor): Promise<PostgresTripDraftDetail | null> {
  const rows = await selectPostgresTripRows(actor, ownerUserId, tripId, 1);
  return rows[0] ? parseTripRow(rows[0]) : null;
}

export async function updatePostgresTripTransportMode(
  tripId: string,
  transportMode: "no-car" | "rental-car" | "train-and-transfers",
  ownerUserId: string,
  actor: DatabaseActor
): Promise<boolean> {
  const trip = await getPostgresTripDraftByIdForOwner(tripId, ownerUserId, actor);
  if (!trip) return false;
  return withActor(actor, async ({ db }) => {
    const [updated] = await db
      .update(tripBriefs)
      .set({ transportMode, normalizedJson: { ...trip.brief, transportMode } })
      .where(and(eq(tripBriefs.id, trip.tripBriefId), eq(tripBriefs.ownerUserId, ownerUserId)))
      .returning({ id: tripBriefs.id });
    return Boolean(updated);
  });
}

export async function updatePostgresTripStatus(
  tripId: string,
  status: "draft" | "in_review" | "active",
  actor: DatabaseActor
): Promise<boolean> {
  if (!isUuid(tripId)) return false;
  return withActor(actor, async ({ db }) => {
    const [updated] = await db
      .update(trips)
      .set({ status })
      .where(eq(trips.id, tripId))
      .returning({ id: trips.id });
    return Boolean(updated);
  });
}

export async function markPostgresTripAsPaid(tripId: string, actor: DatabaseActor): Promise<PostgresTripDraftDetail | null> {
  if (!isUuid(tripId)) return null;
  const trip = await getPostgresTripDraftById(tripId, actor);
  if (!trip) return null;
  return withActor(actor, async ({ db }) => {
    const [updated] = await db
      .update(trips)
      .set({ isPaid: true, status: "paid" })
      .where(eq(trips.id, tripId))
      .returning({ id: trips.id });
    if (!updated) return null;
    const next = await selectPostgresTripRows(actor, undefined, tripId, 1);
    return next[0] ? parseTripRow(next[0]) : null;
  });
}

export async function requestPostgresTripHumanReview(tripId: string, actor: DatabaseActor): Promise<PostgresTripDraftDetail | null> {
  const trip = await getPostgresTripDraftById(tripId, actor);
  if (!trip || !trip.isPaid || trip.hasHumanReview || trip.status === "in_review") return trip;
  return withActor(actor, async ({ db }) => {
    const [updated] = await db.update(trips).set({ status: "in_review" }).where(eq(trips.id, tripId)).returning({ id: trips.id });
    if (!updated) return null;
    const next = await selectPostgresTripRows(actor, undefined, tripId, 1);
    return next[0] ? parseTripRow(next[0]) : null;
  });
}

export async function markPostgresTripAsHumanReviewed(tripId: string, actor: DatabaseActor): Promise<PostgresTripDraftDetail | null> {
  const trip = await getPostgresTripDraftById(tripId, actor);
  if (!trip || !trip.isPaid || trip.hasHumanReview) return trip;
  return withActor(actor, async ({ db }) => {
    const [updated] = await db
      .update(trips)
      .set({ hasHumanReview: true, status: "reviewed" })
      .where(eq(trips.id, tripId))
      .returning({ id: trips.id });
    if (!updated) return null;
    const next = await selectPostgresTripRows(actor, undefined, tripId, 1);
    return next[0] ? parseTripRow(next[0]) : null;
  });
}
