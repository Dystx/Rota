import { describe, expect, it } from "vitest";

import {
  ACTIVITY_REGIONS,
  activityExplorerUrl,
  getReviewedActivityById,
  getReviewedActivities,
  parseSavedActivityIds,
  parseActivityIntent,
  type EditorialActivity
} from "./activities";
import { REVIEWED_ACTIVITY_SEED } from "./activities";

const reviewedPortoWalk: EditorialActivity = {
  id: "porto-riverside-walk",
  placeId: "porto-ribeira",
  region: "porto",
  title: "Riverside walk",
  verdict: "Worth choosing when you want Porto at walking pace.",
  bestFor: ["a walk"],
  durationMinutes: 90,
  bestTime: "Late afternoon",
  avoidWhen: null,
  bookingNeed: "none",
  pairWith: ["A quiet wine bar"],
  alternativeId: null,
  weatherFit: ["sun", "either"],
  editorialStatus: "reviewed",
  reviewedAt: "2026-07-10",
  evidenceUrl: "https://example.test/porto-ribeira"
};

describe("activity editorial adapter", () => {
  it("ships only source-attributable reviewed starter records", () => {
    expect(REVIEWED_ACTIVITY_SEED.length).toBeGreaterThanOrEqual(30);
    expect(
      REVIEWED_ACTIVITY_SEED.every(
        (activity) =>
          activity.editorialStatus === "reviewed" &&
          activity.verdict.length > 20 &&
          activity.evidenceUrl.startsWith("https://") &&
          activity.reviewedAt === "2026-07-10"
      )
    ).toBe(true);
  });

  it("keeps the Portugal-wide seed structurally publishable", () => {
    const ids = new Set(REVIEWED_ACTIVITY_SEED.map((activity) => activity.id));
    const regions = new Map<string, number>();

    for (const activity of REVIEWED_ACTIVITY_SEED) {
      regions.set(activity.region, (regions.get(activity.region) ?? 0) + 1);
      expect(activity.placeId.trim()).not.toBe("");
      expect(activity.title.trim().length).toBeGreaterThan(8);
      expect(activity.verdict.trim().length).toBeGreaterThan(20);
      expect(activity.bestFor.length).toBeGreaterThan(0);
      expect(activity.durationMinutes).toBeGreaterThan(0);
      expect(activity.bestTime.trim()).not.toBe("");
      expect(activity.pairWith.length).toBeGreaterThan(0);
      expect(activity.editorialStatus).toBe("reviewed");
      expect(activity.reviewedAt).toMatch(/^2026-07-10$/u);
      expect(activity.evidenceUrl).toMatch(/^https:\/\//u);
      if (activity.alternativeId) expect(ids.has(activity.alternativeId)).toBe(true);
    }

    expect(ids.size).toBe(REVIEWED_ACTIVITY_SEED.length);
    for (const region of ACTIVITY_REGIONS) {
      expect(regions.get(region), `missing seed coverage for ${region}`).toBeGreaterThanOrEqual(6);
    }
  });

  it("normalizes absent public intent to an editable Porto afternoon", () => {
    expect(parseActivityIntent({})).toEqual({
      region: "porto",
      timeWindow: "an afternoon",
      moods: ["good food"],
      group: "two adults",
      constraints: []
    });
  });

  it("excludes draft and verdict-less records from public results", () => {
    const results = getReviewedActivities(
      [
        reviewedPortoWalk,
        { ...reviewedPortoWalk, id: "draft", editorialStatus: "draft" },
        { ...reviewedPortoWalk, id: "no-verdict", verdict: "" }
      ],
      parseActivityIntent({ region: "porto", mood: "a walk" })
    );

    expect(results).toEqual([reviewedPortoWalk]);
  });

  it("serializes phrases into stable explorer query state", () => {
    expect(
      activityExplorerUrl({
        region: "porto",
        timeWindow: "three hours",
        moods: ["good food", "a walk"],
        group: "two adults",
        constraints: ["without a car"]
      })
    ).toBe(
      "/explore?region=porto&time=three+hours&mood=good+food&mood=a+walk&group=two+adults&constraint=without+a+car"
    );
  });

  it("keeps saved activity IDs in the public explorer state while dropping blanks", () => {
    expect(parseSavedActivityIds({ saved: ["porto-ribeira-slow-walk", "", "porto-ribeira-slow-walk"] })).toEqual([
      "porto-ribeira-slow-walk"
    ]);
  });

  it("only resolves reviewed activity detail records", () => {
    expect(getReviewedActivityById(REVIEWED_ACTIVITY_SEED, "porto-ribeira-slow-walk")?.title).toBe(
      "Ribeira and Miragaia at walking pace"
    );
    expect(getReviewedActivityById(REVIEWED_ACTIVITY_SEED, "not-a-reviewed-activity")).toBeUndefined();
  });
});
