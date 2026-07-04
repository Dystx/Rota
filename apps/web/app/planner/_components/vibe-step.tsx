"use client";

import * as React from "react";
function cn(...values: Array<string | false | null | undefined>): string { return values.filter(Boolean).join(" "); }

/**
 * VibeStep — Stitch 1.2 vibe question.
 *
 * "Primary vibe" slider: Restorative → High Energy. 1 click to
 * pick a position. Optional "Accommodation tone" slider:
 * Accessible → Ultra-Luxury.
 *
 * The slider is a 3-stop segmented control: each stop is a
 * button (1 click). This matches the Stitch 1.2 reference
 * where the slider has explicit endpoint labels.
 */
export type Vibe = "restorative" | "balanced" | "high_energy";
export type Tone = "accessible" | "boutique" | "ultra_luxury";

const VIBE_STOPS: Array<{ value: Vibe; label: string }> = [
  { value: "restorative", label: "Restorative" },
  { value: "balanced", label: "Balanced" },
  { value: "high_energy", label: "High Energy" }
];

const TONE_STOPS: Array<{ value: Tone; label: string }> = [
  { value: "accessible", label: "Accessible" },
  { value: "boutique", label: "Boutique" },
  { value: "ultra_luxury", label: "Ultra-Luxury" }
];

export function VibeStep({
  vibe,
  tone,
  onChangeVibe,
  onChangeTone
}: {
  vibe: Vibe;
  tone: Tone;
  onChangeVibe: (next: Vibe) => void;
  onChangeTone: (next: Tone) => void;
}) {
  return (
    <div data-testid="vibe-step" className="flex flex-col gap-5">
      <SegmentedControl
        label="Primary vibe"
        stops={VIBE_STOPS}
        value={vibe}
        onChange={onChangeVibe}
        testId="vibe-step-vibe"
      />
      <SegmentedControl
        label="Accommodation tone"
        stops={TONE_STOPS}
        value={tone}
        onChange={onChangeTone}
        testId="vibe-step-tone"
      />
    </div>
  );
}

function SegmentedControl<T extends string>({
  label,
  stops,
  value,
  onChange,
  testId
}: {
  label: string;
  stops: Array<{ value: T; label: string }>;
  value: T;
  onChange: (next: T) => void;
  testId: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="font-mono-micro text-mono-micro uppercase tracking-widest text-on-surface-variant">
        {label}
      </span>
      <div
        role="radiogroup"
        aria-label={label}
        data-testid={testId}
        className="w-full max-w-md flex items-stretch gap-1 p-1 rounded-full bg-white border border-outline-variant/30"
      >
        {stops.map((stop, index) => {
          const isSelected = stop.value === value;
          return (
            <button
              key={stop.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(stop.value)}
              data-testid={`${testId}-${stop.value}`}
              className={cn(
                "flex-1 px-2 py-1.5 rounded-full font-mono-technical text-mono-technical uppercase tracking-widest transition-colors text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-1",
                isSelected
                  ? "bg-ochre-light text-ochre-dark shadow-sm"
                  : "bg-transparent text-on-surface-variant hover:bg-ochre-light/10",
                index > 0 && !isSelected ? "border-l border-olive-light/10" : ""
              )}
            >
              {stop.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
