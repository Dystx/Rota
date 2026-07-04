import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getAdminPageAuthContext } from "@/lib/auth/admin";
import { insertChatMessage, listChatMessages } from "./store";

const BodySchema = z.object({
  conversationId: z.string().min(1).max(64),
  body: z.string().min(1).max(4000),
  sourceSnippetId: z.string().max(64).nullable().optional(),
  authorRole: z.enum(["operator", "traveler"]).optional(),
});

const QuerySchema = z.object({
  conversationId: z.string().min(1).max(64),
  limit: z
    .string()
    .optional()
    .transform((value) => (value ? Math.max(1, Math.min(200, parseInt(value, 10) || 50)) : 50))
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
    const row = await insertChatMessage({
      conversationId: parsed.data.conversationId,
      body: parsed.data.body,
      sourceSnippetId: parsed.data.sourceSnippetId ?? null,
      authorRole: parsed.data.authorRole ?? "operator",
    });
    return NextResponse.json({ ok: true, id: row.id, createdAt: row.createdAt });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to send chat message",
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
    const rows = await listChatMessages({
      conversationId: parsed.data.conversationId,
      limit: parsed.data.limit,
      client: admin.client
    });
    return NextResponse.json({ ok: true, messages: rows });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to list chat messages"
      },
      { status: 500 }
    );
  }
}
