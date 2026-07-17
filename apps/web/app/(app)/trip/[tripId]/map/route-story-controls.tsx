"use client";

import * as React from "react";
import type { CameraPreset } from "@repo/spatial-engine";

export interface RouteStoryControlsProps {
  presets: readonly CameraPreset[];
  activeIndex: number;
  started: boolean;
  onStart: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onStop: () => void;
}

/** Explicit, non-autoplay controls for the Phase 2 saved-day story. */
export function RouteStoryControls({
  presets,
  activeIndex,
  started,
  onStart,
  onPrevious,
  onNext,
  onStop
}: RouteStoryControlsProps) {
  if (presets.length === 0) return null;
  const active = presets[activeIndex] ?? presets[0];

  return (
    <section
      aria-label="Explore your plan"
      data-testid="route-story-controls"
      className="rounded-2xl border border-[var(--color-border)] bg-white/90 p-4 shadow-sm backdrop-blur"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-atlantic)]">
            Explore your plan
          </p>
          <p className="mt-1 text-base leading-7 text-[var(--color-muted-foreground)]">
            {started ? `${active?.label ?? "Stop"} · ${active?.dayPart ?? "day"}` : "Move through the day when you choose."}
          </p>
        </div>
        <p className="text-xs text-[var(--color-muted-foreground)]" aria-live="polite">
          {started ? `${Math.max(activeIndex, 0) + 1} of ${presets.length}` : `${presets.length} stops`}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Plan exploration controls">
        {!started ? (
          <button type="button" onClick={onStart} className="min-h-11 rounded-full bg-[var(--color-foreground)] px-4 py-2 text-sm font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-atlantic)] focus-visible:ring-offset-2">
            Start exploring
          </button>
        ) : (
          <>
            <button type="button" onClick={onPrevious} disabled={activeIndex <= 0} className="min-h-11 rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-foreground)] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-atlantic)] focus-visible:ring-offset-2">
              Previous
            </button>
            <button type="button" onClick={onNext} disabled={activeIndex >= presets.length - 1} className="min-h-11 rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-foreground)] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-atlantic)] focus-visible:ring-offset-2">
              Next stop
            </button>
            <button type="button" onClick={onStop} className="min-h-11 rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-atlantic)] focus-visible:ring-offset-2">
              Stop exploring
            </button>
          </>
        )}
      </div>
      <p className="mt-3 text-base leading-7 text-[var(--color-muted-foreground)]">
        Camera movement is optional; the route list remains the source of truth.
      </p>
    </section>
  );
}
