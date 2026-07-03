"use server";

/**
 * Server action: triage an inbound chat message via the @repo/ai
 * classifier. Returns a `TriageResult` from either the LLM path
 * (USE_LLM=true + OPENAI_API_KEY) or the deterministic keyword
 * fallback. Never throws — always returns a result.
 */

import { triageWithFallback, type TriageResult, TriageInputSchema } from "@repo/ai";

export async function triageInboundMessage(
  input: unknown
): Promise<TriageResult> {
  const parsed = TriageInputSchema.parse(input);
  return triageWithFallback(parsed);
}
