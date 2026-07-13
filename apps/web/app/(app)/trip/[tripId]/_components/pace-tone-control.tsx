"use client";

/**
 * PaceToneControl — Stitch 1.4 segmented control for the trip workspace.
 *
 * Two rows of pill-style buttons:
 *   - Pace:   Relaxed | Active
 *   - Tone:   Hidden Gems | Classics
 *
 * The state lives in `useMapStore.paceTone` so the workspace canvas
 * can react (zoom level, marker emphasis) without prop-drilling.
 * The store is the existing single source of truth — this component
 * is just a thin UI shell over it.
 *
 * Accessibility:
 *   - `role="radiogroup"` + `aria-label` for screen readers
 *   - `aria-pressed` on each option (per WAI-ARIA toggle pattern;
 *     these behave like a two-option switch)
 *   - `aria-live="polite"` region below the control so the
 *     change is announced without stealing focus
 */

import * as React from "react";
import { Icon } from "@repo/ui";
import { useMapStore } from "@/store/useMapStore";

const PACE_OPTIONS = [
  { value: "Relaxed", icon: "self_improvement" },
  { value: "Active", icon: "directions_run" },
] as const;

const TONE_OPTIONS = [
  { value: "Hidden Gems", icon: "diamond" },
  { value: "Classics", icon: "museum" },
] as const;

export function PaceToneControl() {
  const paceTone = useMapStore((s) => s.paceTone);
  const setPaceTone = useMapStore((s) => s.setPaceTone);

  const [announcement, setAnnouncement] = React.useState("");
  const prevPace = React.useRef(paceTone.pace);
  const prevTone = React.useRef(paceTone.tone);

  // Announce pace/tone changes for screen readers and keep
  // the canvas informed of intent without forcing a remount.
  React.useEffect(() => {
    if (paceTone.pace !== prevPace.current) {
      setAnnouncement(`Pace set to ${paceTone.pace}.`);
      prevPace.current = paceTone.pace;
    } else if (paceTone.tone !== prevTone.current) {
      setAnnouncement(`Tone set to ${paceTone.tone}.`);
      prevTone.current = paceTone.tone;
    }
  }, [paceTone]);

  return (
    <div
      data-testid="pace-tone-control"
      className="grid gap-3"
    >
      <p className="font-mono-micro text-mono-micro uppercase tracking-widest text-olive-dark">
        Pace &amp; Tone
      </p>

      <div role="radiogroup" aria-label="Pace" className="flex gap-2">
        {PACE_OPTIONS.map((opt) => {
          const selected = paceTone.pace === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              data-testid={`pace-option-${opt.value.toLowerCase().replace(" ", "-")}`}
              onClick={() => setPaceTone({ ...paceTone, pace: opt.value })}
              className={
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label-ui text-label-ui transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 " +
                (selected
                  ? "bg-ochre-light/90 text-olive-dark border border-ochre-dark"
                  : "bg-white/70 text-primary border border-olive-light/40 hover:bg-olive-light/15")
              }
            >
              <Icon name={opt.icon} className="text-[16px]" />
              {opt.value}
            </button>
          );
        })}
      </div>

      <div role="radiogroup" aria-label="Tone" className="flex gap-2">
        {TONE_OPTIONS.map((opt) => {
          const selected = paceTone.tone === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              data-testid={`tone-option-${opt.value.toLowerCase().replace(" ", "-")}`}
              onClick={() => setPaceTone({ ...paceTone, tone: opt.value })}
              className={
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label-ui text-label-ui transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 " +
                (selected
                  ? "bg-ochre-light/90 text-olive-dark border border-ochre-dark"
                  : "bg-white/70 text-primary border border-olive-light/40 hover:bg-olive-light/15")
              }
            >
              <Icon name={opt.icon} className="text-[16px]" />
              {opt.value}
            </button>
          );
        })}
      </div>

      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </div>
  );
}
