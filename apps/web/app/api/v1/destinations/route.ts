import { NextResponse } from "next/server";

/**
 * The B2B destination gateway is intentionally closed during the PostgreSQL
 * cutover. The old implementation depended on a hosted service role and
 * could not be safely left active while the API-key ledger is being ported.
 * Re-enable it only after the owner-scoped API-key schema and rate-limit
 * policies are migrated and covered by the database policy suite.
 */
export async function GET() {
  return NextResponse.json(
    {
      error: "The Rumia B2B destinations API is temporarily unavailable during the database migration."
    },
    { status: 503 }
  );
}
