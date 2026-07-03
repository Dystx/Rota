/**
 * B2B API gateway: v1 destinations endpoint.
 *
 * The PR-15 cut of the developer portal. A B2B partner
 * with a valid `rumia_live_…` API key calls:
 *
 *   GET /api/v1/destinations?region=lisbon&limit=20
 *   Authorization: Bearer rumia_live_<hex>
 *
 * Returns a JSON list of destinations scoped to the
 * partner's `org_id`. For now the destination table
 * is global (`public.places`); org-scoping (where
 * partners can only see their own curated subset) is
 * a follow-up once the destinations table gains an
 * `org_id` column. The gateway contract is the same
 * either way — same shape, same auth, same rate
 * limit.
 *
 * Status codes:
 *   200 — ok, returns `{ destinations: Place[] }`
 *   400 — invalid query params (region missing, limit out of range)
 *   401 — missing or invalid API key
 *   500 — unexpected server error
 *
 * Auth:
 *   1. Read `Authorization: Bearer <raw key>`.
 *   2. `isValidApiKeyShape` to short-circuit bad input.
 *   3. SHA-256 hash the key.
 *   4. Look up the hash in `public.api_keys` via the
 *      service-role client; filter on `revoked_at IS NULL`.
 *   5. Stamp `last_used_at` on success.
 *
 * Rate limiting is intentionally not implemented in
 * this PR — the tier-1 launch uses Supabase's row-level
 * concurrency as a soft cap. A follow-up adds an
 * Upstash Redis token bucket per `api_keys.id`.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import {
  hashApiKey,
  isValidApiKeyShape
} from "@repo/auth";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";

const QuerySchema = z.object({
  region: z.string().min(1).max(255).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).max(10_000).default(0)
});

interface PlaceRow {
  id: string;
  name: string;
  region: string;
  category: string;
  quality: number | null;
  source_confidence: number | null;
}

const SELECT_COLUMNS =
  "id,name,region,category,quality,source_confidence";

export async function GET(request: Request) {
  // 1. Auth
  const auth = request.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return jsonError(401, "missing Authorization: Bearer header");
  }
  const rawKey = auth.slice("Bearer ".length).trim();
  if (!isValidApiKeyShape(rawKey)) {
    return jsonError(401, "invalid API key");
  }
  const keyHash = hashApiKey(rawKey);

  // 2. Resolve query
  const url = new URL(request.url);
  const parsed = QuerySchema.safeParse({
    region: url.searchParams.get("region") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
    offset: url.searchParams.get("offset") ?? undefined
  });
  if (!parsed.success) {
    return jsonError(400, parsed.error.issues[0]?.message ?? "invalid query");
  }

  // 3. Look up the key
  let orgId: string | null = null;
  let apiKeyId: string | null = null;
  try {
    const supabase = createServiceRoleSupabaseClient();
    const { data, error } = await supabase
      .from("api_keys")
      .select("id,org_id,revoked_at")
      .eq("key_hash", keyHash)
      .is("revoked_at", null)
      .maybeSingle();

    if (error) {
      return jsonError(500, error.message);
    }
    if (!data) {
      return jsonError(401, "API key not found or revoked");
    }
    orgId = (data as { org_id: string }).org_id;
    apiKeyId = (data as { id: string }).id;

    // Best-effort stamp `last_used_at`. We don't block
    // the response on this.
    void supabase
      .from("api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", apiKeyId)
      .then(() => undefined);
  } catch (err) {
    return jsonError(500, err instanceof Error ? err.message : "auth lookup failed");
  }

  // 4. Query destinations. Org-scoping is a follow-up;
  // the result set is the global `places` table.
  try {
    const supabase = createServiceRoleSupabaseClient();
    let query = supabase
      .from("places")
      .select(SELECT_COLUMNS)
      .order("name")
      .range(parsed.data.offset, parsed.data.offset + parsed.data.limit - 1);

    if (parsed.data.region) {
      query = query.eq("region", parsed.data.region);
    }

    const { data, error } = await query;
    if (error) {
      return jsonError(500, error.message);
    }

    return NextResponse.json(
      {
        destinations: (data ?? []) as PlaceRow[],
        page: {
          limit: parsed.data.limit,
          offset: parsed.data.offset
        },
        org_id: orgId
      },
      { status: 200 }
    );
  } catch (err) {
    return jsonError(500, err instanceof Error ? err.message : "query failed");
  }
}

function jsonError(status: number, message: string): NextResponse {
  return NextResponse.json({ error: message }, { status });
}
