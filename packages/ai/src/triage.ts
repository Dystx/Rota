/**
 * AI Triage for inbound chat messages (Phase 4 step 3).
 *
 * When a traveler sends a message in an active trip, the platform
 * needs to decide:
 *  1. Is this a simple informational question (auto-reply OK)?
 *  2. Is this a logistical failure that needs a specialist
 *     (parking, hours, transfer, payment)?
 *  3. Is this an emergency that needs immediate human escalation
 *     (medical, safety, lost documents)?
 *
 * The LLM classifies the message into one of three tiers and
 * returns a confidence score. Downstream code (the console
 * pipeline) uses the tier to route the message: auto-reply,
 * queue for specialist, or page the on-call rota.
 *
 * Feature flag: gated by `process.env.USE_LLM === "true"` AND
 * `process.env.OPENAI_API_KEY` being set (same gate as the
 * itinerary intent parser — both run on the same OpenAI client).
 * When the gate is closed, callers should fall back to a
 * deterministic keyword matcher (see `keywordTriage` below).
 */

import { z } from "zod";

export const TriageTier = z.enum([
  "informational", // auto-reply OK
  "logistical",    // needs a specialist within hours
  "emergency"      // page on-call immediately
]);
export type TriageTier = z.infer<typeof TriageTier>;

export const TriageResultSchema = z.object({
  tier: TriageTier,
  /** 0-1 self-reported confidence. Below 0.6 should escalate. */
  confidence: z.number().min(0).max(1),
  /**
   * One-sentence rationale the specialist sees in the console
   * ("lost passport at Lisbon airport", "asking about restaurant
   * hours", etc.). Always English, always <= 140 chars.
   */
  rationale: z.string().max(140),
  /** Optional suggested auto-reply when tier === "informational". */
  suggestedReply: z.string().max(280).optional()
});

export type TriageResult = z.infer<typeof TriageResultSchema>;

export const TriageInputSchema = z.object({
  message: z.string().min(1).max(2000),
  /** Context the LLM can use to bias the classification. */
  tripContext: z
    .object({
      destinationCountry: z.string().optional(),
      regions: z.array(z.string()).optional(),
      isOnTrip: z.boolean().optional(),
      currentLocalTime: z.string().optional()
    })
    .optional()
});
export type TriageInput = z.infer<typeof TriageInputSchema>;

const SYSTEM_PROMPT = `You are the AI triage layer for Rumia, a premium travel concierge.

Given an inbound chat message from a traveler, classify it into one of three tiers:

- "informational": a simple question about the itinerary, restaurants, opening hours, weather, packing. The auto-reply layer can answer these from the itinerary context.
- "logistical": something that needs a human specialist to resolve. Lost item, transfer delay, payment issue, reservation mix-up, medical appointment, pharmacy, late checkout. Response within hours, not minutes.
- "emergency": medical issue, safety concern, lost passport, theft, natural disaster, political event, anything where the traveler is in immediate distress. Page the on-call specialist immediately.

Rules:
- If the message contains words like "lost", "stolen", "hospital", "police", "accident", "flood", "fire", "earthquake" → almost always emergency.
- If the message contains "where", "what time", "how do I", "is there", "can you" without distress → almost always informational.
- When in doubt, prefer logistical over informational (a human can downgrade; an auto-reply can't escalate).
- Be honest about confidence. If the message is ambiguous, set confidence < 0.7 and tier = "logistical".

Respond with the structured object only. No prose.`;

/**
 * Run the AI triage classifier against an inbound message.
 * Returns the parsed `TriageResult` or throws on model / validation
 * failure. Callers should wrap in try/catch and fall back to
 * `keywordTriage()` on error.
 */
export async function triageMessage(input: TriageInput): Promise<TriageResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "triageMessage() requires OPENAI_API_KEY. " +
        "Set it in .env.local, or use the deterministic fallback (keywordTriage)."
    );
  }

  const [{ generateObject }, { createOpenAI }] = await Promise.all([
    import("ai"),
    import("@ai-sdk/openai")
  ]);

  const openai = createOpenAI({ apiKey });
  const modelId = process.env.RUMIA_TRIAGE_MODEL ?? "gpt-4o-mini";

  // Same type-cast workaround as the itinerary intent parser —
  // Vercel AI SDK v5 × Zod-version mismatch. Runtime is correct.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { object } = await generateObject({
    model: openai(modelId),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    schema: TriageResultSchema as any,
    system: SYSTEM_PROMPT,
    prompt: JSON.stringify(input),
    temperature: 0.1
  });

  return TriageResultSchema.parse(object);
}

/**
 * Deterministic fallback for environments without OPENAI_API_KEY
 * (CI, local dev, tests). Uses a conservative keyword matcher:
 *  - Emergency words anywhere in the message → emergency
 *  - Question marks / "where/what/when/how" without emergency words
 *    → informational
 *  - Everything else → logistical (safe default — human can
 *    downgrade; auto-reply can't escalate)
 */
export function keywordTriage(input: TriageInput): TriageResult {
  const text = input.message.toLowerCase();

  const emergencyWords = [
    "lost", "stolen", "hospital", "police", "accident",
    "flood", "fire", "earthquake", "theft", "robbed",
    "hurt", "injured", "sick", "emergency", "urgent",
    "help me", "can't find", "can't breathe", "chest pain"
  ];
  const informationalWords = [
    "what time", "where is", "where can", "how do",
    "is there", "are there", "do you", "can i", "can we",
    "opening hours", "weather", "temperature", "what's the"
  ];

  for (const word of emergencyWords) {
    if (text.includes(word)) {
      return {
        tier: "emergency",
        confidence: 0.85,
        rationale: `Message contains emergency keyword: "${word}"`
      };
    }
  }

  const hasQuestionMark = text.includes("?");
  const hasInformationalWord = informationalWords.some((w) => text.includes(w));
  if (hasQuestionMark && hasInformationalWord) {
    return {
      tier: "informational",
      confidence: 0.7,
      rationale: "Question about itinerary details; auto-reply can handle"
    };
  }
  if (hasQuestionMark) {
    return {
      tier: "informational",
      confidence: 0.55,
      rationale: "Question mark detected; treating as informational"
    };
  }

  return {
    tier: "logistical",
    confidence: 0.5,
    rationale: "No emergency or question signals; defaulting to specialist queue"
  };
}

/**
 * Convenience wrapper: run the LLM triage when available, fall
 * back to the keyword matcher on any failure. The fallback is
 * intentionally conservative (prefers logistical) so the system
 * never silently drops a message into the auto-reply bucket.
 */
export async function triageWithFallback(input: TriageInput): Promise<TriageResult> {
  if (process.env.USE_LLM !== "true" || !process.env.OPENAI_API_KEY) {
    return keywordTriage(input);
  }
  try {
    return await triageMessage(input);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(
      "[@repo/ai] LLM triage failed, falling back to keywordTriage:",
      err instanceof Error ? err.message : err
    );
    return keywordTriage(input);
  }
}
