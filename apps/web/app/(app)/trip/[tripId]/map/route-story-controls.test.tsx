import { cleanup, render, screen, within } from "@testing-library/react";
import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

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
  afterEach(() => cleanup());
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

  it("keeps previous and next navigation explicit and bounded", () => {
    const first = { ...presets[0]!, id: "first", stopId: "first", label: "First" };
    const second = { ...presets[0]!, id: "second", stopId: "second", label: "Second" };
    const onPrevious = vi.fn();
    const onNext = vi.fn();

    render(
      <RouteStoryControls
        presets={[first, second]}
        activeIndex={0}
        started
        onStart={vi.fn()}
        onPrevious={onPrevious}
        onNext={onNext}
        onStop={vi.fn()}
      />
    );

    const controls = within(screen.getByTestId("route-story-controls"));
    expect(controls.getByRole("button", { name: "Previous" }).hasAttribute("disabled")).toBe(true);
    expect(controls.getByRole("button", { name: "Next stop" }).hasAttribute("disabled")).toBe(false);
    controls.getByRole("button", { name: "Next stop" }).click();
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
