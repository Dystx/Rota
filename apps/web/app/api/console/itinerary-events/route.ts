import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getAdminPageAuthContext } from "@/lib/auth/admin";
import { insertItineraryEvent, listItineraryEvents } from "./store";

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
  const admin = await getAdminPageAuthContext();
  if (!("client" in admin)) {
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
    const row = await insertItineraryEvent({
      conversationId: parsed.data.conversationId,
      eventType: parsed.data.eventType,
      title: parsed.data.title,
      eventDate: parsed.data.eventDate,
      eventTime: parsed.data.eventTime,
      internalNotes: parsed.data.internalNotes ?? null,
      createdBy: admin.userId,
    });
    return NextResponse.json({ ok: true, id: row.id, createdAt: row.createdAt });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to record timeline event",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const admin = await getAdminPageAuthContext();
  if (!("client" in admin)) {
    return NextResponse.json(
      { ok: false, error: `Forbidden: ${admin.reason}` },
      { status: admin.status }
    );
  }

  const url = new URL(request.url);
  const parsed = QuerySchema.safeParse({
    conversationId: url.searchParams.get("conversationId") ?? "",
    limit: url.searchParams.get("limit") ?? undefined
  });
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid query",
        details: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  try {
    const rows = await listItineraryEvents({
      conversationId: parsed.data.conversationId,
      limit: parsed.data.limit,
      client: admin.client
    });
    return NextResponse.json({ ok: true, events: rows });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to list timeline events"
      },
      { status: 500 }
    );
  }
}
