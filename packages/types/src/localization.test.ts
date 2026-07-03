import { describe, expect, it } from "vitest";
import {
  destinationCountries,
  portugalRegions,
  spainRegions,
  italyRegions,
  franceRegions,
  greeceRegions,
  regionsByCountry,
  TripBriefSchema
} from "./trip-brief";

describe("localization matrix (Phase 7)", () => {
  it("exports 5 destination countries", () => {
    expect(destinationCountries).toEqual([
      "portugal",
      "spain",
      "italy",
      "france",
      "greece"
    ]);
  });

  it("each country has at least 4 regions", () => {
    expect(portugalRegions.length).toBeGreaterThanOrEqual(4);
    expect(spainRegions.length).toBeGreaterThanOrEqual(4);
    expect(italyRegions.length).toBeGreaterThanOrEqual(4);
    expect(franceRegions.length).toBeGreaterThanOrEqual(4);
    expect(greeceRegions.length).toBeGreaterThanOrEqual(4);
  });

  it("regionsByCountry maps each country to its region tuple", () => {
    expect(regionsByCountry.portugal).toBe(portugalRegions);
    expect(regionsByCountry.spain).toBe(spainRegions);
    expect(regionsByCountry.italy).toBe(italyRegions);
    expect(regionsByCountry.france).toBe(franceRegions);
    expect(regionsByCountry.greece).toBe(greeceRegions);
  });

  it("TripBriefSchema accepts Spain regions under destinationCountry=spain", () => {
    const result = TripBriefSchema.safeParse({
      destinationCountry: "spain",
      regions: ["barcelona", "madrid"],
      tripLengthDays: 5,
      travelersCount: 2,
      travelerType: "couple",
      budgetLevel: "mid-range",
      pace: "balanced",
      interests: ["old-streets", "local-food"],
      transportMode: "train-and-transfers",
      rawBrief: "5 days in Spain: Barcelona for old streets, Madrid for food."
    });
    expect(result.success).toBe(true);
  });

  it("TripBriefSchema accepts Italy regions", () => {
    const result = TripBriefSchema.safeParse({
      destinationCountry: "italy",
      regions: ["rome", "florence", "tuscany"],
      tripLengthDays: 7,
      travelersCount: 4,
      travelerType: "family",
      budgetLevel: "premium",
      pace: "calm",
      interests: ["design-and-architecture"],
      transportMode: "rental-car",
      rawBrief: "7 days across Italy: Rome, Florence, Tuscany with the kids."
    });
    expect(result.success).toBe(true);
  });

  it("TripBriefSchema rejects Portugal region under destinationCountry=spain", () => {
    const result = TripBriefSchema.safeParse({
      destinationCountry: "spain",
      regions: ["lisbon"], // Portugal region submitted under Spain country
      tripLengthDays: 3,
      travelersCount: 2,
      travelerType: "couple",
      budgetLevel: "mid-range",
      pace: "balanced",
      interests: ["old-streets"],
      transportMode: "no-car",
      rawBrief: "3 days in Spain starting from Lisbon."
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const regionsError = result.error.issues.find(
        (issue) => issue.path[0] === "regions"
      );
      expect(regionsError?.message).toContain("not in spain");
    }
  });
});
