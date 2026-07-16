import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isPersistenceConfigError, isSchemaDriftError } from "@repo/db";
import { getAdminPageAuthContext, isAdminPageAuthContext } from "@/lib/auth/admin";
import { isSessionProviderFailure } from "@/lib/auth/session-outcome";
import { moveTripStage } from "./store";

const unavailableMessage = "This service is temporarily unavailable. Please try again shortly.";

function failureResponse(error: unknown) {
  const unavailable = isPersistenceConfigError(error) || isSchemaDriftError(error) || isSessionProviderFailure(error);
  return NextResponse.json(
    { ok: false, error: unavailable ? unavailableMessage : "Could not move trip." },
    { status: unavailable ? 503 : 500 }
  );
}

const BodySchema = z.object({
  tripId: z.string().min(1).max(64),
  toStatus: z.enum(["draft", "in_revision", "active_chat"]),
});

export async function POST(request: NextRequest) {
  const admin = await getAdminPageAuthContext();
  if (!isAdminPageAuthContext(admin)) {
    return NextResponse.json(
      { ok: false, error: `Forbidden: ${admin.reason}` },
      { status: admin.status }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = BodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid payload",
        details: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }

  try {
    const result = await moveTripStage({
      tripId: parsed.data.tripId,
      toStatus: parsed.data.toStatus,
    }, admin);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return failureResponse(error);
  }
}
