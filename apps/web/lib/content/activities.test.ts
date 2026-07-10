import { describe, expect, it } from "vitest";

import {
  activityExplorerUrl,
  getReviewedActivities,
  parseActivityIntent,
  type EditorialActivity
} from "./activities";

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
  reviewedAt: "2026-07-10"
};

describe("activity editorial adapter", () => {
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
});
