import { NextResponse, type NextRequest } from "next/server";
import { resolveRoleCompatibleNext } from "@/lib/auth/role-compatible-next";
import { loadCurrentAuthorizedActor } from "@/lib/auth/authorization";
import { safeNext } from "../safe-next";

/**
 * /auth/callback — compatibility return URL for links issued before the
 * Better Auth migration. Better Auth now completes credentials in its own
 * route and sets the session cookie there; this endpoint only preserves the
 * safe redirect contract.
 *
 * Legacy `code` values are ignored. No callback route accepts an arbitrary
 * actor or role; the current Better Auth session remains the source of truth.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = safeNext(searchParams.get("next"));
  const actorOutcome = await loadCurrentAuthorizedActor();
  if (actorOutcome.kind === "unavailable") {
    return NextResponse.json(
      { code: "unavailable", message: "This service is temporarily unavailable." },
      { status: 503 }
    );
  }
  const destination = actorOutcome.kind === "ready"
    ? resolveRoleCompatibleNext(next, actorOutcome.actor)
    : `/sign-in?next=${encodeURIComponent(next)}`;
  return NextResponse.redirect(new URL(destination, origin));
}
