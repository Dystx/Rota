import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { REVIEWED_ACTIVITY_SEED } from "@/lib/content/activities";

import { ActivityDayTray } from "./activity-day-tray";

describe("ActivityDayTray", () => {
  it("uses a compact sticky mobile tray while retaining the full desktop day list", () => {
    render(
      <ActivityDayTray
        activities={[REVIEWED_ACTIVITY_SEED[0]!]}
        onRemove={vi.fn()}
        onContinue={vi.fn()}
      />
    );

    const tray = screen.getByRole("region", { name: /Your day/i });
    expect(tray.className).toContain("fixed");
    expect(tray.className).toContain("md:static");
    expect(screen.getByRole("button", { name: /See this day/i })).toBeTruthy();
  });
});
