import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isPersistenceConfigError, isSchemaDriftError } from "@repo/db";
import { getAdminPageAuthContext, isAdminPageAuthContext } from "@/lib/auth/admin";
import { isSessionProviderFailure } from "@/lib/auth/session-outcome";
import { authFailureError, internalError, unavailableError, validationError } from "@/lib/auth/api";
import { moveTripStage } from "./store";

const unavailableMessage = "This service is temporarily unavailable. Please try again shortly.";

function failureResponse(error: unknown) {
  const unavailable = isPersistenceConfigError(error) || isSchemaDriftError(error) || isSessionProviderFailure(error);
  return unavailable ? unavailableError(unavailableMessage) : internalError("Could not move trip.");
}

const BodySchema = z.object({
  tripId: z.string().min(1).max(64),
  toStatus: z.enum(["draft", "in_revision", "active_chat"]),
});

export async function POST(request: NextRequest) {
  let admin: Awaited<ReturnType<typeof getAdminPageAuthContext>>;
  try {
    admin = await getAdminPageAuthContext({ allCapabilities: ["operations:manage"] });
  } catch (error) {
    return failureResponse(error);
  }
  if (!isAdminPageAuthContext(admin)) return authFailureError(admin);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return validationError("Invalid JSON body.");
  }

  const parsed = BodySchema.safeParse(payload);
  if (!parsed.success) {
    return validationError("Invalid payload.", parsed.error.flatten().fieldErrors);
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
