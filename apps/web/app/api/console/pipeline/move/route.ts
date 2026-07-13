import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getAdminPageAuthContext, isAdminPageAuthContext } from "@/lib/auth/admin";
import { moveTripStage } from "./store";

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
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to move trip",
      },
      { status: 500 }
    );
  }
}
