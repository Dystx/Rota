"use server";

/**
 * Server action: triage an inbound chat message via the @repo/ai
 * classifier. Returns a `TriageResult` from either the LLM path
 * (USE_LLM=true + OPENAI_API_KEY) or the deterministic keyword
 * fallback. Never throws — always returns a result.
 *
 * Rate limit: the previous version had no cap, so a burst of
 * inbound messages would trigger an LLM call per message and
 * bill the org's OpenAI budget. A simple in-memory token-bucket
 * limits each instance to MAX_PER_MINUTE calls per rolling
 * 60s window. When exhausted, the action transparently falls
 * back to `keywordTriage` (which is essentially free) and
 * stamps `__rateLimited: true` on the rationale so ops can
 * see when the LLM path was bypassed.
 *
 * Production deployment should replace this with a shared
 * store (Supabase + Edge Function cron, Redis, etc.) so the
 * limit is global across server instances.
 */

import { triageWithFallback, type TriageResult, TriageInputSchema } from "@repo/ai";

const MAX_PER_MINUTE = 30;
const WINDOW_MS = 60_000;

const callTimestamps: number[] = [];

function takeToken(now: number): boolean {
  // Drop entries outside the rolling window.
  while (callTimestamps.length > 0 && callTimestamps[0]! < now - WINDOW_MS) {
    callTimestamps.shift();
  }
  if (callTimestamps.length >= MAX_PER_MINUTE) {
    return false;
  }
  callTimestamps.push(now);
  return true;
}

export async function triageInboundMessage(
  input: unknown
): Promise<TriageResult> {
  const parsed = TriageInputSchema.parse(input);

  // Always run the cheap keyword triage as a baseline so a rate-
  // limited caller still gets a useful result.
  const keywordResult = (await import("@repo/ai")).keywordTriage(parsed);

  if (!takeToken(Date.now())) {
    return {
      ...keywordResult,
      rationale: `${keywordResult.rationale} (LLM path rate-limited; keyword fallback in use)`
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
