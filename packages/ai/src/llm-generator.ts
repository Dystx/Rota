/**
 * Vercel AI SDK — intent parser for the trip brief.
 *
 * Phase 3 step 1 of the roadmap. The LLM does NOT assemble the full
 * itinerary — that's still the deterministic generator's job (and
 * later the retrieval + routing pipeline). The LLM's only
 * responsibility here is **intent parsing**: turning free-text or
 * partial structured input into a normalized `TripBriefIntent` that
 * can be fed into the existing pipeline.
 *
 * Why this split:
 *  - Intent parsing is the highest-leverage LLM use (handles
 *    "I'm a foodie couple, 5 days, hate tourist buses" → structured
 *    interests + pace + avoidances).
 *  - Itinerary assembly needs to be deterministic + testable
 *    (the deterministic stub stays as the local-dev / CI fallback
 *    when OPENAI_API_KEY is not set).
 *  - The same parsed intent will later feed Phase 3 step 2
 *    (retrieval via pgvector) without changing this file.
 *
 * Feature flag: gated by `process.env.USE_LLM === "true"` AND
 * `process.env.OPENAI_API_KEY` being set. When either is missing,
 * callers should fall back to the deterministic generator. The
 * `generateItineraryFromBrief` export in `./index.ts` handles the
 * fallback — this file only runs when both gates are open.
 */

import { z } from "zod";
import {
  destinationCountries,
  portugalRegions,
  spainRegions,
  italyRegions,
  franceRegions,
  greeceRegions,
  travelerTypes,
  budgetLevels,
  paceOptions,
  interestOptions,
  foodPreferenceOptions,
  avoidanceOptions,
  type TripBrief
} from "@repo/types";

/**
 * Structured intent the LLM produces from a free-text brief.
 *
 * This is a strict subset of `TripBrief` (no dates, no party size,
 * no accommodation notes) — the LLM is asked only to extract
 * *preferences*, not to schedule. Dates/party size come from
 * the form or default to "flexible" downstream.
 */
export const TripBriefIntentSchema = z.object({
  destinationCountry: z.enum(destinationCountries),
  // Phase 7: regions is a union of every country's region enum.
  // The cross-field validation (region must belong to country)
  // runs downstream in the TripBriefSchema's superRefine — here
  // we just accept the wider union so the LLM can output any
  // valid region.
  regions: z
    .array(
      z.enum([
        ...portugalRegions,
        ...spainRegions,
        ...italyRegions,
        ...franceRegions,
        ...greeceRegions
      ])
    )
    .min(1)
    .max(5),
  interests: z.array(z.enum(interestOptions)).min(1).max(6),
  pace: z.enum(paceOptions),
  transportMode: z.enum(["no-car", "rental-car", "train-and-transfers"] as const),
  tripLengthDays: z.number().int().min(2).max(21),
  avoidances: z.array(z.enum(avoidanceOptions)).default([]),
  foodPreferences: z.array(z.enum(foodPreferenceOptions)).default([]),
  travelerType: z.enum(travelerTypes),
  budgetLevel: z.enum(budgetLevels),
  /** The original free-text brief, echoed back for traceability. */
  rawBrief: z.string().min(30).max(1200),
  /**
   * LLM self-reported confidence in the parse. 0–1. Low values
   * (<0.6) should trigger a clarification question downstream
   * (handled by `buildMissingInfo` in the deterministic layer).
   */
  parseConfidence: z.number().min(0).max(1)
});

export type TripBriefIntent = z.infer<typeof TripBriefIntentSchema>;

/**
 * Convert the LLM-parsed intent into a full `TripBrief` that the
 * existing itinerary pipeline accepts. Fills in date / travelers
 * defaults (flexible dates, 2 travelers) since the LLM is not
 * asked to schedule.
 */
export function intentToTripBrief(intent: TripBriefIntent): TripBrief {
  return {
    destinationCountry: intent.destinationCountry,
    regions: intent.regions,
    startDate: "",
    endDate: "",
    travelersCount: 2,
    travelerType: intent.travelerType,
    tripLengthDays: intent.tripLengthDays,
    budgetLevel: intent.budgetLevel,
    pace: intent.pace,
    interests: intent.interests,
    avoidances: intent.avoidances,
    foodPreferences: intent.foodPreferences,
    transportMode: intent.transportMode,
    accommodationLocation: "",
    rawBrief: intent.rawBrief
  };
}

const SYSTEM_PROMPT = `You are the intent parser for Rumia, a premium travel concierge for Portugal-first trips.

Given a free-text trip brief, extract a structured TripBriefIntent.

Rules:
- destinationCountry is one of: "portugal" (default), "spain", "italy", "france", "greece". Infer from the brief; default to "portugal" if ambiguous.
- regions must be 1-5 from the official region set for the chosen country. Map synonyms: "wine country" → "douro-valley" (PT) / "bordeaux" (FR) / "tuscany" (IT); "the coast" → "algarve" (PT) / "amalfi-coast" (IT) / "french-riviera" (FR); "Greek islands" → "santorini" / "mykonos" (GR).
- interests must be 1-6 of: local-food, old-streets, sea-views, wine, design-and-architecture, nature, family-friendly, hidden-gems.
- pace: "calm" (2-3 stops/day, generous buffers), "balanced" (3-4 stops), or "full" (4-5 stops, tighter timing).
- transportMode: "no-car" (walking/transit only), "rental-car" (driving), or "train-and-transfers" (trains + private transfers).
- avoidances: include any constraints the user mentions (no tourist buses → "tourist-heavy-stops"; hates long drives → "long-drives"; etc.).
- foodPreferences: seafood, wine-bars, special-dinner, casual-local-meals, vegetarian-friendly — include what the user signals.
- travelerType: solo, couple, family, or friends.
- budgetLevel: budget, mid-range, or premium — infer from signals (luxury hotel / Michelin → premium; hostels / cheap eats → budget; default to mid-range).
- tripLengthDays: integer 2-21.
- rawBrief: echo the user's original text verbatim.
- parseConfidence: your honest self-assessment 0-1. Lower it if the brief is vague, contradictory, or missing key signals (transport, pace, interests). 0.6+ means you're confident.

Respond with the structured object only. No prose.`;

/**
 * Run the LLM intent parser. Returns the parsed `TripBriefIntent`
 * or throws on model / validation failure.
 *
 * Lazy-loads the OpenAI client so the module can be imported
 * without `OPENAI_API_KEY` being set (the env check happens here,
 * not at import time).
 */
export async function parseTripBriefIntent(
  rawBrief: string,
  options: { model?: string } = {}
): Promise<TripBriefIntent> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "parseTripBriefIntent() requires OPENAI_API_KEY. " +
        "Set it in .env.local, or use the deterministic fallback (USE_LLM=false)."
    );
  }

  // Dynamic imports: the Vercel AI SDK v5 has a massive type surface
  // that hangs `tsc` when statically imported. Loading both the
  // provider and generateObject lazily keeps the module import cost
  // near-zero for consumers that never call parseTripBriefIntent()
  // (i.e. the deterministic fallback path).
  const [{ generateObject }, { createOpenAI }] = await Promise.all([
    import("ai"),
    import("@ai-sdk/openai")
  ]);

  const openai = createOpenAI({ apiKey });
  const modelId = options.model ?? process.env.RUMIA_LLM_MODEL ?? "gpt-4o-mini";

  // Cast to `any` for the schema param: the Vercel AI SDK v5
  // FlexibleSchema<unknown> expects internal Zod v4 type fields
  // (_type, _parse, etc.) that aren't present when the schema is
  // constructed from enum values re-exported by @repo/types (which
  // pins a different Zod minor). The runtime call is fine; the
  // mismatch is a TypeScript-only friction. A future cleanup is to
  // align all packages on the same Zod version.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { object } = await generateObject({
    model: openai(modelId),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    schema: TripBriefIntentSchema as any,
    system: SYSTEM_PROMPT,
    prompt: rawBrief,
    temperature: 0.2
  });

  return TripBriefIntentSchema.parse(object);
}
