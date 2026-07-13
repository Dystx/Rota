import * as React from "react";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { REVIEWED_ACTIVITY_SEED } from "@/lib/content/activities";

import { ActivityDayTray } from "./activity-day-tray";

describe("ActivityDayTray", () => {
  afterEach(() => cleanup());

  it("keeps the empty desktop rail useful without creating a mobile obstruction", () => {
    render(
      <ActivityDayTray
        activities={[]}
        onRemove={vi.fn()}
        onContinue={vi.fn()}
      />
    );

    const tray = screen.getByTestId("activity-day-empty");
    expect(tray.getAttribute("data-empty")).toBe("true");
    expect(tray.className).toContain("hidden");
    expect(tray.className).toContain("md:block");
    expect(screen.getByText("Your day is open.")).toBeDefined();
    expect(screen.getByText(/Save an activity/)).toBeDefined();
  });

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
    expect(tray.className).toContain("safe-area-inset-bottom");
    expect(tray.className).toContain("md:static");
    expect(tray.className).toContain("rumia-save-transition");
    expect(tray.getAttribute("data-motion-key")).toBe("porto-ribeira-slow-walk");
    expect(screen.getByRole("button", { name: /See this day/i }).className).toContain("min-h-11");
  });
});
