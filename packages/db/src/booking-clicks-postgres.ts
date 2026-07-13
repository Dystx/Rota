import "server-only";

import { desc, eq, sql } from "drizzle-orm";

import { withActor, type DatabaseActor } from "./actor";
import { getDatabase } from "./connection";
import { bookingClicks, partners } from "./schema";
import type { BookingClick, CreateBookingClickInput } from "./booking-clicks";

function parseBookingClick(row: {
  id: number;
  partnerId: string;
  partnerName: string | null;
  tripId: string | null;
  source: string;
  target: string;
  referer: string | null;
  userAgent: string | null;
  createdAt: Date;
}): BookingClick {
  return {
    id: String(row.id),
    partnerId: row.partnerId,
    partnerName: row.partnerName,
    tripId: row.tripId,
    source: row.source,
    target: row.target,
    referer: row.referer,
    userAgent: row.userAgent,
    createdAt: row.createdAt.toISOString()
  };
}

async function selectClicks(db: ReturnType<typeof getDatabase> | Parameters<Parameters<ReturnType<typeof getDatabase>["transaction"]>[0]>[0], limit: number) {
  return db
    .select({
      id: bookingClicks.id,
      partnerId: bookingClicks.partnerId,
      partnerName: partners.name,
      tripId: bookingClicks.tripId,
      source: bookingClicks.source,
      target: bookingClicks.target,
      referer: bookingClicks.referer,
      userAgent: bookingClicks.userAgent,
      createdAt: bookingClicks.createdAt
    })
    .from(bookingClicks)
    .leftJoin(partners, eq(partners.id, bookingClicks.partnerId))
    .orderBy(desc(bookingClicks.createdAt))
    .limit(limit);
}

export async function createPostgresBookingClick(input: CreateBookingClickInput): Promise<BookingClick> {
  if (!input.partnerId.trim() || !input.source.trim() || !input.target.trim()) {
    throw new Error("Booking click fields are required.");
  }
  const db = getDatabase();
  const sequenceResult = await db.execute(sql`select nextval('app.booking_clicks_id_seq')::bigint as id`);
  const id = Number((sequenceResult as unknown as { rows: Array<{ id: string }> }).rows[0]?.id);
  if (!Number.isFinite(id)) throw new Error("Failed to create booking click.");
  await db.execute(sql`
    INSERT INTO app.booking_clicks (id, partner_id, trip_id, source, target, referer, user_agent)
    OVERRIDING SYSTEM VALUE
    VALUES (${id}, ${input.partnerId.trim()}, ${input.tripId?.trim() || null}, ${input.source.trim()}, ${input.target.trim()}, ${input.referer?.trim() || null}, ${input.userAgent?.trim() || null})
  `);
  const [partner] = await db.select({ name: partners.name }).from(partners).where(eq(partners.id, input.partnerId.trim())).limit(1);
  return {
    id: String(id),
    partnerId: input.partnerId.trim(),
    partnerName: partner?.name ?? null,
    tripId: input.tripId?.trim() || null,
    source: input.source.trim(),
    target: input.target.trim(),
    referer: input.referer?.trim() || null,
    userAgent: input.userAgent?.trim() || null,
    createdAt: new Date().toISOString()
  };
}

export async function listPostgresBookingClicks(limit = 200, actor: DatabaseActor): Promise<BookingClick[]> {
  const safeLimit = Math.max(1, Math.min(500, Math.trunc(limit)));
  if (!actor.roles.includes("admin") && !actor.capabilities.includes("analytics:read")) return [];
  return withActor(actor, async ({ db }) => {
    const rows = await selectClicks(db, safeLimit);
    return rows.map(parseBookingClick);
  });
}
