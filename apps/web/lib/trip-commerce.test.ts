import { describe, expect, test } from "vitest";
import { getTripCommerceState } from "./trip-commerce";

describe("getTripCommerceState", () => {
  test("returns free preview state when not paid and no review", () => {
    const state = getTripCommerceState({ isPaid: false, hasHumanReview: false });

    expect(state.accessLabel).toBe("Free preview only");
    expect(state.canExport).toBe(false);
    expect(state.canUnlock).toBe(true);
    expect(state.canRequestReview).toBe(false);
    expect(state.canCompleteReview).toBe(false);
    expect(state.exportLabel).toBe("PDF + calendar export locked");
    expect(state.reviewLabel).toBe("Human review available after unlock");
    expect(state.queueLabel).toBe("Waiting for unlock");
    expect(state.markers).toEqual([
      "Route preview stays visible before payment",
      "Export and offline handoff stay locked",
      "Human review becomes available after unlock"
    ]);
  });

  test("returns unlocked state when paid but no review", () => {
    const state = getTripCommerceState({ isPaid: true, hasHumanReview: false });

    expect(state.accessLabel).toBe("Unlocked paid trip");
    expect(state.canExport).toBe(true);
    expect(state.canUnlock).toBe(false);
    expect(state.canRequestReview).toBe(true);
    expect(state.canCompleteReview).toBe(false);
    expect(state.exportLabel).toBe("PDF + calendar export ready");
    expect(state.reviewLabel).toBe("Ready for human review");
    expect(state.queueLabel).toBe("Needs review");
    expect(state.markers).toEqual([
      "Full itinerary and route map are unlocked",
      "Export-ready trip pack can be generated",
      "This trip can now enter the human-review queue"
    ]);
  });

  test("returns in-review state when status is in_review", () => {
    const state = getTripCommerceState({ status: "in_review", isPaid: true, hasHumanReview: false });

    expect(state.accessLabel).toBe("Unlocked paid trip");
    expect(state.canExport).toBe(true);
    expect(state.canUnlock).toBe(false);
    expect(state.canRequestReview).toBe(false);
    expect(state.canCompleteReview).toBe(true);
    expect(state.exportLabel).toBe("PDF + calendar export ready");
    expect(state.reviewLabel).toBe("Human review in progress");
    expect(state.queueLabel).toBe("In review queue");
    expect(state.markers).toEqual([
      "A reviewer is actively polishing the route",
      "Route swaps and pacing edits are being prepared",
      "Client-facing trust markers will update after review completion"
    ]);
  });

  test("returns reviewed state when hasHumanReview is true", () => {
    const state = getTripCommerceState({ isPaid: true, hasHumanReview: true });

    expect(state.accessLabel).toBe("Unlocked paid trip");
    expect(state.canExport).toBe(true);
    expect(state.canUnlock).toBe(false);
    expect(state.canRequestReview).toBe(false);
    expect(state.canCompleteReview).toBe(false);
    expect(state.exportLabel).toBe("PDF + calendar export ready");
    expect(state.reviewLabel).toBe("Local expert reviewed");
    expect(state.queueLabel).toBe("Completed");
    expect(state.markers).toEqual([
      "Reviewed by a Portugal specialist",
      "Reviewer swaps and pacing notes are visible",
      "Rain-plan and local-food edits are now client-facing"
    ]);
  });

  test("returns reviewed state when status is reviewed", () => {
    const state = getTripCommerceState({ status: "reviewed", isPaid: true, hasHumanReview: false });

    expect(state.accessLabel).toBe("Unlocked paid trip");
    expect(state.canExport).toBe(true);
    expect(state.canUnlock).toBe(false);
    expect(state.canRequestReview).toBe(false);
    expect(state.canCompleteReview).toBe(false);
    expect(state.exportLabel).toBe("PDF + calendar export ready");
    expect(state.reviewLabel).toBe("Local expert reviewed");
    expect(state.queueLabel).toBe("Completed");
  });

  test("hasHumanReview takes precedence over in_review status", () => {
    const state = getTripCommerceState({ status: "in_review", hasHumanReview: true });

    expect(state.reviewLabel).toBe("Local expert reviewed");
    expect(state.canCompleteReview).toBe(false);
  });

  test("reviewed status takes precedence over isPaid false", () => {
    const state = getTripCommerceState({ status: "reviewed", isPaid: false });

    expect(state.accessLabel).toBe("Unlocked paid trip");
    expect(state.canExport).toBe(true);
  });

  test("defaults to free preview when called with no arguments", () => {
    const state = getTripCommerceState();

    expect(state.accessLabel).toBe("Free preview only");
    expect(state.canExport).toBe(false);
    expect(state.canUnlock).toBe(true);
  });
});
