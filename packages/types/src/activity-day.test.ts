import { describe, expect, it } from "vitest";

import { ActivityDayDraftSchema } from "./activity-day";

describe("ActivityDayDraftSchema", () => {
  it("models a selected activity day without turning it into an itinerary prompt", () => {
    expect(ActivityDayDraftSchema.parse({
      activityIds: ["porto-ribeira-slow-walk"],
      dayTime: "afternoon",
      transport: "transit"
    })).toEqual({
      activityIds: ["porto-ribeira-slow-walk"],
      dayTime: "afternoon",
      transport: "transit"
    });
  });

  it("rejects an unsupported day-time value", () => {
    expect(ActivityDayDraftSchema.safeParse({
      activityIds: ["porto-ribeira-slow-walk"],
      dayTime: "all-day",
      transport: "transit"
    }).success).toBe(false);
  });

  it("rejects an unsupported transport value", () => {
    expect(ActivityDayDraftSchema.safeParse({
      activityIds: ["porto-ribeira-slow-walk"],
      dayTime: "afternoon",
      transport: "teleport"
    }).success).toBe(false);
  });
});
