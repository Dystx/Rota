import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";
import { TripBriefSchema } from "@repo/types";
import {
  DeterministicPromptTripProvider,
  normalizeTripPrompt,
  type PromptTripNormalizationResult,
  type PromptTripProvider
} from "./prompt-normalization";

const sourcePath = join(dirname(fileURLToPath(import.meta.url)), "prompt-normalization.ts");

const richPrompts = [
  "Plan 5 romantic days in Porto and Douro with wine, slow mornings, no car, premium boutique hotels and local food.",
  "Build a 7 day family Portugal trip for Lisbon, Sintra and Cascais with seafood, beaches, a comfortable mid-range budget, balanced pace, and trains.",
  "Create 4 calm days in Alentejo for design, architecture, nature, hidden local food, premium stays, and rental car countryside drives."
] as const;

describe("normalizeTripPrompt", () => {
  it("produces schema-valid TripBrief candidates for rich prompts", async () => {
    for (const prompt of richPrompts) {
      const result = await normalizeTripPrompt(prompt);

      expect(result.kind).toBe("candidate");
      if (result.kind !== "candidate") throw new Error("Expected candidate result");
      expect(TripBriefSchema.safeParse(result.candidate).success).toBe(true);
      expect(result.candidate.rawBrief).toBe(prompt);
    }
  });

  it("normalizes Porto and Douro romantic no-car prompt conservatively", async () => {
    const result = await normalizeTripPrompt(richPrompts[0]);

    expect(result.kind).toBe("candidate");
    if (result.kind !== "candidate") throw new Error("Expected candidate result");
    expect(result.candidate.tripLengthDays).toBe(5);
    expect(result.candidate.regions).toEqual(["douro-valley", "porto"]);
    expect(result.candidate.travelerType).toBe("couple");
    expect(result.candidate.budgetLevel).toBe("premium");
    expect(result.candidate.pace).toBe("calm");
    expect(result.candidate.transportMode).toBe("no-car");
    expect(result.candidate.interests).toEqual(expect.arrayContaining(["wine", "local-food"]));
    expect(result.candidate.avoidances).toEqual(expect.arrayContaining(["rushed-schedules", "long-drives"]));
  });

  it("asks typed follow-up questions for ambiguous prompts instead of producing guesses", async () => {
    const result = await normalizeTripPrompt("Make me a cool Portugal trip");

    expect(result.kind).toBe("needs_follow_up");
    if (result.kind !== "needs_follow_up") throw new Error("Expected follow-up result");
    expect(result.questions.map((question) => question.id)).toEqual([
      "trip_prompt.duration",
      "trip_prompt.region",
      "trip_prompt.budget",
      "trip_prompt.pace"
    ]);
    expect(result.questions.map((question) => question.field)).toEqual(["duration", "region", "budget", "pace"]);
    expect("candidate" in result).toBe(false);
  });

  it("keeps normalization provider-only and never imports persistence helpers", async () => {
    const calls: string[] = [];
    const provider: PromptTripProvider = {
      id: "test-provider",
      normalizePrompt(prompt) {
        calls.push(prompt);
        return new DeterministicPromptTripProvider().normalizePrompt(prompt);
      }
    };

    const result = await normalizeTripPrompt(richPrompts[1], provider);

    expect(calls).toEqual([richPrompts[1]]);
    expect(result.kind).toBe("candidate");
    expect(result.provider).toBe("test-provider");
  });

  it("rejects invalid candidate output from custom providers", async () => {
    const invalidProviderCandidate: unknown = {
      kind: "candidate",
      provider: "unsafe-provider",
      candidate: {
        destinationCountry: "portugal",
        regions: [],
        tripLengthDays: 1,
        travelersCount: 0,
        travelerType: "couple",
        budgetLevel: "luxury",
        pace: "rushed",
        interests: [],
        foodPreferences: [],
        avoidances: [],
        transportMode: "private-jet",
        accommodationLocation: "",
        rawBrief: "too short"
      }
    };
    const provider: PromptTripProvider = {
      id: "unsafe-provider",
      normalizePrompt() {
        return invalidProviderCandidate as PromptTripNormalizationResult;
      }
    };

    const result = await normalizeTripPrompt(richPrompts[0], provider);

    expect(result.kind).toBe("needs_follow_up");
    if (result.kind !== "needs_follow_up") throw new Error("Expected invalid provider candidate to be rejected");
    expect(result.provider).toBe("unsafe-provider");
    expect(result.questions.map((question) => question.field)).toEqual(["duration", "region", "budget", "pace"]);
    expect("candidate" in result).toBe(false);
  });

  it("has no database, persistence, network, or live provider imports in the normalization module", async () => {
    const source = await readFile(sourcePath, "utf8");

    expect(source).not.toMatch(/@repo\/db|createTripDraft|fetch\(|openai|anthropic|@ai-sdk/);
  });

  it("does not persist or create a trip for invalid short prompt input", async () => {
    const result = await normalizeTripPrompt("Portugal?");

    expect(result.kind).toBe("needs_follow_up");
    if (result.kind !== "needs_follow_up") throw new Error("Expected follow-up result");
    expect(result.questions).toHaveLength(4);
    expect(result.questions.every((question) => question.id.startsWith("trip_prompt."))).toBe(true);
    expect("candidate" in result).toBe(false);
  });
});
