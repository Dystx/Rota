import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isPersistenceConfigError, isSchemaDriftError } from "@repo/db";
import { getAdminPageAuthContext, isAdminPageAuthContext } from "@/lib/auth/admin";
import { isSessionProviderFailure } from "@/lib/auth/session-outcome";
import { authFailureError, internalError, unavailableError, validationError } from "@/lib/auth/api";
import { insertItineraryEvent, listItineraryEvents } from "./store";

const unavailableMessage = "This service is temporarily unavailable. Please try again shortly.";

function failureResponse(error: unknown, fallbackMessage: string) {
  const unavailable = isPersistenceConfigError(error) || isSchemaDriftError(error) || isSessionProviderFailure(error);
  return unavailable ? unavailableError(unavailableMessage) : internalError(fallbackMessage);
}

const BodySchema = z.object({
  conversationId: z.string().min(1).max(64),
  eventType: z.enum(["activity", "accommodation", "transfer", "dining"]),
  title: z.string().min(1).max(200),
  eventDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "eventDate must be YYYY-MM-DD"),
  eventTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "eventTime must be HH:MM"),
  internalNotes: z.string().max(2000).optional(),
});

const QuerySchema = z.object({
  conversationId: z.string().min(1).max(64),
  limit: z
    .string()
    .optional()
    .transform((value) =>
      value ? Math.max(1, Math.min(100, parseInt(value, 10) || 20)) : 20
    )
});

export async function POST(request: NextRequest) {
  let admin: Awaited<ReturnType<typeof getAdminPageAuthContext>>;
  try {
    admin = await getAdminPageAuthContext({ allCapabilities: ["operations:manage"] });
  } catch (error) {
    return failureResponse(error, "Could not authenticate console request.");
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
    const row = await insertItineraryEvent({
      conversationId: parsed.data.conversationId,
      eventType: parsed.data.eventType,
      title: parsed.data.title,
      eventDate: parsed.data.eventDate,
      eventTime: parsed.data.eventTime,
      internalNotes: parsed.data.internalNotes ?? null,
      createdBy: admin.userId,
    }, admin);
    return NextResponse.json({ ok: true, id: row.id, createdAt: row.createdAt });
  } catch (error) {
    return failureResponse(error, "Could not record timeline event.");
  }
}

export async function GET(request: NextRequest) {
  let admin: Awaited<ReturnType<typeof getAdminPageAuthContext>>;
  try {
    admin = await getAdminPageAuthContext({ allCapabilities: ["operations:manage"] });
  } catch (error) {
    return failureResponse(error, "Could not authenticate console request.");
  }
  if (!isAdminPageAuthContext(admin)) return authFailureError(admin);

  const url = new URL(request.url);
  const parsed = QuerySchema.safeParse({
    conversationId: url.searchParams.get("conversationId") ?? "",
    limit: url.searchParams.get("limit") ?? undefined
  });
  if (!parsed.success) {
    return validationError("Invalid query.", parsed.error.flatten().fieldErrors);
  }

  try {
    const rows = await listItineraryEvents({
      conversationId: parsed.data.conversationId,
      limit: parsed.data.limit,
    }, admin);
    return NextResponse.json({ ok: true, events: rows });
  } catch (error) {
    return failureResponse(error, "Could not load timeline events.");
  }
}
