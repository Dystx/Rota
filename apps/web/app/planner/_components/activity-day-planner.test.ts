import { describe, expect, it } from "vitest";

import { REVIEWED_ACTIVITY_SEED } from "@/lib/content/activities";

import { activityDayPlannerHref, activityDaySignInHref, assessActivityDay } from "./activity-day-planner";

describe("assessActivityDay", () => {
  it("identifies a selected day that exceeds its available time", () => {
    expect(assessActivityDay(REVIEWED_ACTIVITY_SEED.slice(0, 2), 180)).toEqual({
      kind: "overfull",
      selectedMinutes: 210,
      overByMinutes: 30
    });
  });

  it("keeps unallocated time visible when a same-region day has room", () => {
    expect(assessActivityDay([REVIEWED_ACTIVITY_SEED[0]!], 420)).toEqual({
      kind: "comfortable",
      selectedMinutes: 120,
      remainingMinutes: 300
    });
  });
});

describe("activityDayPlannerHref", () => {
  it("keeps a Portugal activity day as editable browser state", () => {
    expect(activityDayPlannerHref(REVIEWED_ACTIVITY_SEED.slice(0, 2), {
      dayTime: "full-day",
      transport: "car"
    })).toBe("/planner?activity=porto-ribeira-slow-walk&activity=porto-bombarda-art-walk&dayTime=full-day&transport=car");
  });

  it("returns through sign-in without dropping the anonymous day draft", () => {
    expect(activityDaySignInHref("/planner?activity=porto-ribeira-slow-walk&dayTime=afternoon&transport=transit"))
      .toBe("/sign-in?next=%2Fplanner%3Factivity%3Dporto-ribeira-slow-walk%26dayTime%3Dafternoon%26transport%3Dtransit");
  });
});
