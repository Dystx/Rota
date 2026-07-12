import { render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { RouteStoryControls } from "./route-story-controls";

const presets = [
  {
    id: "camera-ribeira-1",
    stopId: "ribeira",
    dayPart: "morning" as const,
    label: "Ribeira",
    center: [-8.61, 41.14] as [number, number],
    zoom: 12,
    pitch: 0,
    bearing: 0,
    durationMs: 900
  }
];

describe("RouteStoryControls", () => {
  it("requires explicit start and exposes an exit action after starting", () => {
    const onStart = vi.fn();
    const onStop = vi.fn();
    const { rerender } = render(
      <RouteStoryControls presets={presets} activeIndex={-1} started={false} onStart={onStart} onPrevious={vi.fn()} onNext={vi.fn()} onStop={onStop} />
    );

    expect(screen.getByRole("button", { name: "Start exploring" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Stop exploring" })).toBeNull();

    rerender(
      <RouteStoryControls presets={presets} activeIndex={0} started onStart={onStart} onPrevious={vi.fn()} onNext={vi.fn()} onStop={onStop} />
    );
    expect(screen.getByRole("button", { name: "Stop exploring" })).toBeTruthy();
  });
});
