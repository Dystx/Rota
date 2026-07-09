import { NextResponse } from "next/server";
import { isFeatureEnabled } from "@repo/config";
import { getOwnedTrip } from "@/app/lib/trip-access";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ tripId: string }> };

function errorResponse(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}

function unavailable() {
  return errorResponse(503, "MESSAGING_UNAVAILABLE", "Trip messaging is temporarily unavailable.");
}

async function authorize(tripId: string) {
  if (!isFeatureEnabled("tripMessaging")) return { response: unavailable() } as const;

  let access;
  try {
    access = await getOwnedTrip(tripId);
  } catch {
    return { response: unavailable() } as const;
  }

  if (access.kind === "anonymous") {
    return { response: errorResponse(401, "UNAUTHENTICATED", "Authentication required.") } as const;
  }
  if (access.kind === "forbidden") {
    return { response: errorResponse(403, "FORBIDDEN", "You do not have access to this trip.") } as const;
  }
  if (access.kind === "missing") {
    return { response: errorResponse(404, "NOT_FOUND", "Trip not found.") } as const;
  }

  const reviewed = access.trip.hasHumanReview || access.trip.status === "reviewed";
  if (!access.trip.isPaid || !reviewed) {
    return { response: errorResponse(403, "FORBIDDEN", "Messaging requires a paid, reviewed trip.") } as const;
  }
  return { access } as const;
}

function mapRow(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    authorRole: row.author_role === "traveler" ? "traveler" : "specialist",
    body: typeof row.body === "string" ? row.body : "",
    createdAt: typeof row.created_at === "string" ? row.created_at : null
  };
}

export async function GET(_request: Request, { params }: Params) {
  const { tripId } = await params;
  const auth = await authorize(tripId);
  if ("response" in auth) return auth.response;

  try {
    const client = await createServerSupabaseClient();
    const { data, error } = await client
      .from("trip_messages")
      .select("id, author_role, body, created_at")
      .eq("trip_id", tripId)
      .order("created_at", { ascending: true });
    if (error) return unavailable();
    return NextResponse.json({ messages: (data ?? []).map((row) => mapRow(row as Record<string, unknown>)) });
  } catch {
    return unavailable();
  }
}

export async function POST(request: Request, { params }: Params) {
  const { tripId } = await params;
  const auth = await authorize(tripId);
  if ("response" in auth) return auth.response;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return errorResponse(400, "VALIDATION_ERROR", "Message body is required.");
  }
  const body = (payload as { body?: unknown } | null)?.body;
  if (typeof body !== "string" || !body.trim() || body.length > 4000) {
    return errorResponse(400, "VALIDATION_ERROR", "Message body is required.");
  }

  try {
    const client = await createServerSupabaseClient();
    const { data, error } = await client
      .from("trip_messages")
      .insert({ trip_id: tripId, author_role: "traveler", author_user_id: auth.access.userId, body: body.trim() })
      .select("id, author_role, body, created_at")
      .single();
    if (error || !data) return unavailable();
    return NextResponse.json({ message: mapRow(data as Record<string, unknown>) }, { status: 201 });
  } catch {
    return unavailable();
  }
}
