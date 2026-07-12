import { describe, expect, it } from "vitest";

import type { EditorialActivity } from "@/lib/content/activities";

import {
  buildActivityMapModel,
  createActivityMapViewState,
  type ActivityMapPoint
} from "./activity-map-model";

const reviewedPoint: ActivityMapPoint = {
  activityId: "porto-ribeira-slow-walk",
  title: "Ribeira and Miragaia at walking pace",
  region: "porto",
  coordinates: { lng: -8.611, lat: 41.14 },
  locality: "Porto",
  geometryPrecision: "approximate",
  locationPrivacy: "coarse",
  editorialStatus: "reviewed",
  reviewedAt: "2026-07-10",
  verdict: "A slow first read of Porto.",
  bestFor: ["a walk"],
  durationMinutes: 120,
  bestTime: "Late afternoon",
  avoidWhen: null,
  bookingNeed: "none",
  pairWith: ["A simple dinner"],
  alternativeId: null,
  weatherFit: ["sun", "either"],
  effortLevel: "moderate",
  costBand: "free",
  mobilityNotes: "Hills and cobbles are part of the experience.",
  evidenceUrl: "https://example.test/ribeira",
  evidenceAttribution: "Visit Portugal; Rumia editorial review"
};

describe("buildActivityMapModel", () => {
  it("keeps reviewed points stable and labels coarse geometry in the feature", () => {
    const model = buildActivityMapModel([reviewedPoint]);

    expect(model.points).toHaveLength(1);
    expect(model.points[0]?.activityId).toBe(reviewedPoint.activityId);
    expect(model.features.features[0]?.id).toBe(reviewedPoint.activityId);
    expect(model.features.features[0]?.properties).toMatchObject({
      activityId: reviewedPoint.activityId,
      geometryPrecision: "approximate",
      locationPrivacy: "coarse",
      markerLabel: "1"
    });
    expect(model.byActivityId.get(reviewedPoint.activityId)).toEqual(reviewedPoint);
  });

  it("rejects drafts, invalid coordinates, and missing required evidence", () => {
    const draft = { ...reviewedPoint, activityId: "draft", editorialStatus: "draft" as const };
    const invalidCoordinate = { ...reviewedPoint, activityId: "bad-coordinate", coordinates: { lng: 181, lat: 41 } };
    const missingEvidence = { ...reviewedPoint, activityId: "missing-evidence", evidenceAttribution: "" };

    const model = buildActivityMapModel([draft, invalidCoordinate, missingEvidence]);

    expect(model.points).toEqual([]);
    expect(model.fallback.required).toBe(true);
    expect(model.invalidActivityIds).toEqual(["draft", "bad-coordinate", "missing-evidence"]);
    expect(model.fallback.items.map((item) => item.activityId)).toEqual([
      "draft",
      "bad-coordinate",
      "missing-evidence"
    ]);
  });

  it("returns the complete list when an editorial activity has no map geometry", () => {
    const activity: EditorialActivity = {
      id: "unmapped-reviewed-activity",
      placeId: "unmapped-place",
      region: "porto",
      title: "A reviewed activity without a public point",
      verdict: "Keep this in the list until location evidence is ready.",
      bestFor: ["a walk"],
      durationMinutes: 60,
      bestTime: "Morning",
      avoidWhen: null,
      bookingNeed: "none",
      pairWith: [],
      alternativeId: null,
      weatherFit: ["either"],
      editorialStatus: "reviewed",
      reviewedAt: "2026-07-10",
      evidenceUrl: "https://example.test/unmapped"
    };

    const model = buildActivityMapModel([activity]);

    expect(model.points).toEqual([]);
    expect(model.features.features).toEqual([]);
    expect(model.fallback.items).toHaveLength(1);
    expect(model.fallback.items[0]?.title).toBe(activity.title);
  });

  it("caps map features at five while retaining every selected item in the fallback list", () => {
    const points = Array.from({ length: 6 }, (_, index) => ({
      ...reviewedPoint,
      activityId: `activity-${index}`,
      title: `Activity ${index}`,
      coordinates: { lng: -8.61 - index / 100, lat: 41.14 + index / 100 }
    }));

    const model = buildActivityMapModel(points);

    expect(model.points).toHaveLength(5);
    expect(model.features.features).toHaveLength(5);
    expect(model.fallback.items).toHaveLength(6);
    expect(model.truncated).toBe(true);
  });
});

describe("createActivityMapViewState", () => {
  it("starts list-first with a top-down mercator camera", () => {
    const state = createActivityMapViewState([reviewedPoint], true);

    expect(state).toMatchObject({
      mode: "list",
      selectedActivityId: reviewedPoint.activityId,
      center: [reviewedPoint.coordinates.lng, reviewedPoint.coordinates.lat],
      pitch: 0,
      bearing: 0,
      reducedMotion: true
    });
    expect(state.zoom).toBeGreaterThan(0);
  });
});
