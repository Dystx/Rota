import { resolveDataClient, resolvePrivilegedServerDataClient, type DataClientOptions } from "./clients";

type RawBookingClickRow = {
  id: number;
  partner_id: string;
  trip_id: number | null;
  source: string;
  target: string;
  referer: string | null;
  user_agent: string | null;
  created_at: string;
  partners?:
    | {
        name: string;
      }
    | Array<{
        name: string;
      }>
    | null;
};

export type CreateBookingClickInput = {
  partnerId: string;
  tripId: string;
  source: string;
  target: string;
  referer?: string | null;
  userAgent?: string | null;
};

export type BookingClick = {
  id: string;
  partnerId: string;
  partnerName: string | null;
  tripId: string | null;
  source: string;
  target: string;
  referer: string | null;
  userAgent: string | null;
  createdAt: string;
};

function parseTripId(tripId: string) {
  const numericTripId = Number(tripId);

  return Number.isInteger(numericTripId) ? numericTripId : null;
}

function parseBookingClick(row: RawBookingClickRow): BookingClick {
  const partnerName = Array.isArray(row.partners) ? row.partners[0]?.name ?? null : row.partners?.name ?? null;

  return {
    createdAt: row.created_at,
    id: String(row.id),
    partnerId: row.partner_id,
    partnerName,
    referer: row.referer,
    source: row.source,
    target: row.target,
    tripId: row.trip_id === null ? null : String(row.trip_id),
    userAgent: row.user_agent
  };
}

export async function createBookingClick(input: CreateBookingClickInput, options?: DataClientOptions): Promise<BookingClick> {
  const { data, error } = await resolvePrivilegedServerDataClient(options)
    .from("booking_clicks")
    .insert({
      partner_id: input.partnerId,
      referer: input.referer ?? null,
      source: input.source,
      target: input.target,
      trip_id: parseTripId(input.tripId),
      user_agent: input.userAgent ?? null
    })
    .select("id,partner_id,trip_id,source,target,referer,user_agent,created_at,partners(name)")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create booking click.");
  }

  return parseBookingClick(data as RawBookingClickRow);
}

export async function listBookingClicks(limit = 200, options?: DataClientOptions): Promise<BookingClick[]> {
  const { data, error } = await resolveDataClient(options)
    .from("booking_clicks")
    .select("id,partner_id,trip_id,source,target,referer,user_agent,created_at,partners(name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return ((data as RawBookingClickRow[] | null) ?? []).map((row) => parseBookingClick(row));
}
