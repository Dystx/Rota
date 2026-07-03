"use server";

/**
 * Server action: triage an inbound chat message via the @repo/ai
 * classifier. Returns a `TriageResult` from either the LLM path
 * (USE_LLM=true + OPENAI_API_KEY) or the deterministic keyword
 * fallback. Never throws — always returns a result.
 *
 * Rate limit: a shared counter in the `triage_rate_limit` table
 * (see migration 202607032200_…) caps the LLM path at
 * MAX_PER_MINUTE calls per minute across the entire deployment.
 * The counter is consulted via the `consume_triage_token(30)`
 * SECURITY DEFINER RPC, which atomically increments the current
 * minute bucket and returns TRUE if a token was granted.
 *
 * When the bucket is exhausted, the action transparently falls
 * back to `keywordTriage` (which is essentially free) and stamps
 * `(LLM path rate-limited; keyword fallback in use)` on the
 * rationale so ops can see when the LLM path was bypassed.
 *
 * If the rate-limit store is unreachable (Supabase down, RPC
 * error), the action treats the call as unrate-limited rather
 * than failing the whole triage — the keyword result is still
 * returned, with a different rationale suffix so ops can spot
 * the degraded state in logs.
 */

import {
  triageWithFallback,
  keywordTriage,
  type TriageResult,
  TriageInputSchema
} from "@repo/ai";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";

const MAX_PER_MINUTE = 30;

async function consumeToken(): Promise<"granted" | "limited" | "unavailable"> {
  try {
    const supabase = getServiceRoleClient();
    const { data, error } = await supabase.rpc("consume_triage_token", {
      max_per_minute: MAX_PER_MINUTE
    });
    if (error) return "unavailable";
    // Distinguish "limited" (RPC returned `false`, bucket is full) from
    // "unavailable" (RPC returned null or an unexpected shape). The
    // rationale suffix differs between the two so ops can spot a
    // degraded state vs. a real rate-limit hit.
    if (data === true) return "granted";
    if (data === false) return "limited";
    return "unavailable";
  } catch {
    return "unavailable";
  }
}

// Module-level service-role client cache. Avoids a per-request
// `createClient()` round-trip and an extra `createServerConfig()` env
// read on every triage call. Tests should `vi.resetModules()` to
// discard the cached client.
let serviceRoleClient: ReturnType<typeof createServiceRoleSupabaseClient> | null = null;
function getServiceRoleClient() {
  if (!serviceRoleClient) {
    serviceRoleClient = createServiceRoleSupabaseClient();
  }
  return serviceRoleClient;
}

export async function triageInboundMessage(
  input: unknown
): Promise<TriageResult> {
  const parsed = TriageInputSchema.parse(input);

  // Always run the cheap keyword triage as a baseline so a rate-
  // limited caller still gets a useful result.
  const keywordResult = keywordTriage(parsed);

  const token = await consumeToken();
  if (token === "limited") {
    return {
      ...keywordResult,
      rationale: `${keywordResult.rationale} (LLM path rate-limited; keyword fallback in use)`
    };
  }
  if (token === "unavailable") {
    return {
      ...keywordResult,
      rationale: `${keywordResult.rationale} (rate-limit store unavailable; keyword fallback in use)`
    };
  }

  try {
    return await triageWithFallback(parsed);
  } catch (err) {
    // Triage is best-effort; never break the caller.
    // eslint-disable-next-line no-console
    console.warn("[@repo/ai] triage failed:", err instanceof Error ? err.message : err);
    return keywordResult;
  }
}
