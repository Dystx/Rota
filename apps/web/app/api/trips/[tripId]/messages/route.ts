import { NextResponse } from "next/server";
import { isFeatureEnabled } from "@repo/config";
import { getOwnedTrip } from "@/app/lib/trip-access";

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

export async function GET(_request: Request, { params }: Params) {
  const { tripId } = await params;
  const auth = await authorize(tripId);
  if ("response" in auth) return auth.response;

  return unavailable();
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

  return unavailable();
}
