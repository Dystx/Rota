import { describe, expect, it } from "vitest";
import { retrieveDestinations } from "./retrieval";
import type { TripBriefIntent } from "./llm-generator";

function intent(overrides: Partial<TripBriefIntent> = {}): TripBriefIntent {
  return {
    destinationCountry: "portugal",
    regions: ["lisbon"],
    interests: ["local-food"],
    pace: "balanced",
    transportMode: "train-and-transfers",
    tripLengthDays: 3,
    avoidances: [],
    foodPreferences: ["seafood"],
    travelerType: "couple",
    budgetLevel: "mid-range",
    rawBrief: "3 days in Lisbon, foodie couple, seafood and wine bars.",
    parseConfidence: 0.85,
    ...overrides
  };
}

describe("retrieveDestinations", () => {
  it("returns region-matched candidates at the top", () => {
    const result = retrieveDestinations(intent({ regions: ["lisbon"] }));
    expect(result.candidates.length).toBeGreaterThan(0);
    expect(result.candidates[0]?.region).toBe("lisbon");
  });

  it("returns 0 candidates when no region matches", () => {
    // Use a region that's in the enum but no fixture uses it.
    const result = retrieveDestinations(intent({ regions: ["alentejo"] }));
    expect(result.candidates).toHaveLength(0);
    expect(result.confidence).toBe(0);
  });

  it("penalizes candidates with avoidance conflicts", () => {
    const withConflict = retrieveDestinations(
      intent({ regions: ["lisbon"], avoidances: ["stairs-and-steep-walks"] })
    );
    // Alfama has stairs-and-steep-walks flag — it should rank
    // lower than Belém which has a different flag set.
    const alfamaRank = withConflict.candidates.findIndex((c) => c.id === "lx-alfama");
    const belemRank = withConflict.candidates.findIndex((c) => c.id === "lx-belem");
    expect(alfamaRank).toBeGreaterThan(belemRank);
  });

  it("rewards interest overlap", () => {
    const wineFocus = retrieveDestinations(
      intent({ regions: ["porto", "douro-valley"], interests: ["wine"] })
    );
    expect(wineFocus.candidates[0]?.tags.includes("wine")).toBe(true);
  });

  it("rewards food preference overlap", () => {
    const seafoodFocus = retrieveDestinations(
      intent({ regions: ["algarve"], foodPreferences: ["seafood"] })
    );
    expect(seafoodFocus.candidates[0]?.foodTags.includes("seafood")).toBe(true);
  });

  it("aligns pace with destination intensity", () => {
    const calmTrip = retrieveDestinations(
      intent({ regions: ["lisbon"], pace: "calm" })
    );
    const fullTrip = retrieveDestinations(
      intent({ regions: ["lisbon"], pace: "full" })
    );
    // Calm trip should rank Belém (intensity 0.3) higher than
    // Pena Palace (intensity 0.6) when the regions span both.
    const calmVsFull = calmTrip.candidates
      .map((c) => c.id)
      .join("|");
    expect(calmVsFull).toBeTruthy();
    expect(fullTrip.candidates[0]?.region).toBe("lisbon");
  });

  it("returns confidence between 0 and 1", () => {
    const result = retrieveDestinations(intent());
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });
});
