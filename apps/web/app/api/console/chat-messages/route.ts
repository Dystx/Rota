import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getAdminPageAuthContext } from "@/lib/auth/admin";
import { insertChatMessage } from "./store";

const BodySchema = z.object({
  conversationId: z.string().min(1).max(64),
  body: z.string().min(1).max(4000),
  sourceSnippetId: z.string().max(64).nullable().optional(),
  authorRole: z.enum(["operator", "traveler"]).optional(),
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
