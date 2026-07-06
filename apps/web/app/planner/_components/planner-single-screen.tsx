"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, ChipGroup, Field, Input } from "@repo/ui";
import type { TransportChoice } from "./transport-step";
import type { Vibe } from "./vibe-step";

/**
 * PlannerSingleScreen — replaces the 5-step sequential wizard
 * with one screen of inline-editable fields, using shared
 * `@repo/ui` primitives.
 *
 * Layout (top to bottom):
 *
 *   "We are crafting a journey to [Portugal] for [7] days in [May]."
 *     — three inline `Field` + `Input` fields, ochre underline.
 *
 *   "Mobility" — `ChipGroup` (Car / Transit).
 *
 *   "Energy"   — `ChipGroup` (Calm / Balanced / Full).
 *
 *   [ Synthesize Itinerary → ]
 *
 * All questions are visible at once — the user types, clicks
 * chips, and synthesizes without navigating between screens.
 * URL state is preserved (destination + days on entry, all
 * fields on completion) so a refresh mid-flow resumes cleanly.
 */
export interface PlannerSingleScreenProps {
  initialDestination?: string;
  initialDays?: number;
  initialWindow?: string;
  initialTransport?: TransportChoice | "";
  initialVibe?: Vibe;
}

const DESTINATION_LABELS: Record<string, string> = {
  portugal: "Portugal",
  lisbon: "Lisbon",
  porto: "Porto",
  douro: "the Douro Valley",
  sintra: "Sintra",
  cascais: "Cascais",
  coimbra: "Coimbra",
  algarve: "the Algarve",
  azores: "the Azores",
};

function prettyDestination(slug: string): string {
  const key = slug.trim().toLowerCase();
  return (
    DESTINATION_LABELS[key] ??
    key.replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

const MOBILITY_OPTIONS = [
  {
    value: "car",
    label: "Car",
    description: "Airport pickup",
  },
  {
    value: "transit",
    label: "Transit & walking",
    description: "No rental",
  },
] as const;

const ENERGY_OPTIONS = [
  { value: "restorative", label: "Calm" },
  { value: "balanced", label: "Balanced" },
  { value: "high_energy", label: "Full" },
] as const;

export function PlannerSingleScreen({
  initialDestination = "Portugal",
  initialDays = 7,
  initialWindow = "",
  initialTransport = "",
  initialVibe = "balanced",
}: PlannerSingleScreenProps) {
  const router = useRouter();

  const [destination, setDestination] = React.useState(initialDestination);
  const [days, setDays] = React.useState(String(initialDays));
  const [window, setWindow] = React.useState(initialWindow);
  const [transport, setTransport] = React.useState<TransportChoice | "">(
    initialTransport
  );
  const [vibe, setVibe] = React.useState<Vibe>(initialVibe);
  const [pending, setPending] = React.useState(false);

  const daysNum = Math.max(1, Math.min(60, parseInt(days, 10) || 1));
  const canSubmit =
    destination.trim().length > 0 && daysNum > 0 && !pending;

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    setPending(true);

    const place = prettyDestination(destination);
    const transportPhrase =
      transport === "car"
        ? "rental car"
        : transport === "transit"
          ? "public transit"
          : "mixed transit";
    const vibePhrase =
      vibe === "restorative"
        ? "calm, restorative"
        : vibe === "high_energy"
          ? "full, high-energy"
          : "balanced";
    const monthPhrase = window ? ` in ${window}` : "";
    const prompt = `A ${daysNum}-day trip to ${place}${monthPhrase}, ${vibePhrase} pace, ${transportPhrase}.`;
    router.push(`/trip/new?prompt=${encodeURIComponent(prompt)}&days=${daysNum}`);
  };

  return (
    <main
      id="main-content"
      className="on-dark relative min-h-screen bg-primary text-linen-dark flex flex-col"
      data-testid="planner-single-screen"
    >
      {/* Fixed top bar — Rumia wordmark (clickable → home) + close. */}
      <header className="fixed top-0 w-full z-50 px-container-padding-lg py-4 flex justify-between items-center">
        <Link
          href="/"
          aria-label="Back to home"
          className="font-headline-sm text-headline-sm italic text-ochre-light hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 rounded-sm"
        >
          Rumia
        </Link>
        <button
          type="button"
          onClick={() => router.push("/")}
          aria-label="Close planner"
          className="text-linen-dark opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 rounded-sm"
        >
          <span aria-hidden className="material-symbols-outlined text-2xl">
            close
          </span>
        </button>
      </header>

      <form
        onSubmit={onSubmit}
        className="flex-grow flex items-center justify-center px-container-padding-sm md:px-container-padding-lg py-24"
      >
        <div className="max-w-4xl w-full flex flex-col gap-12">
          {/* AI Intent Engine badge. */}
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 bg-glass-dark backdrop-blur-md border border-white/20 px-4 py-2 rounded-full">
              <span aria-hidden className="material-symbols-outlined text-[14px] text-ochre-light">
                auto_awesome
              </span>
              <span className="font-mono-micro text-mono-micro text-tertiary-fixed-dim uppercase tracking-wider">
                AI Intent Engine
              </span>
            </span>
          </div>

          {/* Sentence with inline editable fields. Each field is
              a raw <Input> (not wrapped in <Field>) so the label
              doesn't render above the input — the sentence
              itself is the visual label. `aria-label` gives
              screen readers the field name. */}
          <h1 className="font-display-mobile md:font-display text-2xl md:text-5xl text-linen-dark leading-snug text-center flex flex-wrap items-baseline justify-center gap-x-1 gap-y-2 md:gap-x-2 md:gap-y-3 text-balance">
            <span>We are crafting a journey to </span>
            <span className="sr-only">Destination</span>
            <Input
              type="text"
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              aria-label="Destination"
              data-testid="planner-destination"
              className="!w-32 md:!w-56 !inline-block !px-2 md:!px-3 !py-0.5 md:!py-1 !text-2xl md:!text-5xl !text-center !font-display-mobile md:!font-display !border-[var(--color-accent)] !bg-white/10 !text-ochre-light"
            />
            <span> for </span>
            <span className="sr-only">Number of days</span>
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              max={60}
              value={days}
              onChange={(event) => setDays(event.target.value)}
              aria-label="Number of days"
              data-testid="planner-days"
              className="!w-12 md:!w-20 !inline-block !px-2 md:!px-3 !py-0.5 md:!py-1 !text-2xl md:!text-5xl !text-center !font-display-mobile md:!font-display !border-[var(--color-accent)] !bg-white/10 !text-ochre-light"
            />
            <span> days in </span>
            <span className="sr-only">Travel window</span>
            <Input
              type="text"
              value={window}
              onChange={(event) => setWindow(event.target.value)}
              aria-label="Travel window"
              placeholder="May"
              data-testid="planner-window"
              className="!w-24 md:!w-40 !inline-block !px-2 md:!px-3 !py-0.5 md:!py-1 !text-2xl md:!text-5xl !text-center !font-display-mobile md:!font-display !border-[var(--color-accent)] !bg-white/10 !placeholder:text-ochre-light !text-ochre-light"
            />
            <span>.</span>
          </h1>

          {/* Compact pill selectors for transport + vibe using the
              shared `ChipGroup` primitive (WAI-ARIA radiogroup with
              arrow-key navigation built in). The two groups sit
              side-by-side, centered as a unit so the layout matches
              the centered H1 above. On mobile they stack. */}
          <div className="flex flex-col items-center gap-8 md:flex-row md:justify-center md:items-start md:gap-12">
            <div className="flex flex-col gap-3 items-center md:items-start">
              <label className="font-mono-technical text-mono-technical uppercase tracking-widest text-ochre-light text-sm">
                Mobility
              </label>
              <ChipGroup
                ariaLabel="Mobility"
                value={transport === "" ? null : transport}
                onChange={(next: "car" | "transit") => setTransport(next)}
                options={MOBILITY_OPTIONS.map((o) => ({
                  value: o.value,
                  label: o.label,
                  description: o.description,
                }))}
              />
            </div>

            <div className="flex flex-col gap-3 items-center md:items-start">
              <label className="font-mono-technical text-mono-technical uppercase tracking-widest text-ochre-light text-sm">
                Energy
              </label>
              <ChipGroup
                ariaLabel="Energy"
                value={vibe}
                onChange={(next: Vibe) => setVibe(next)}
                options={ENERGY_OPTIONS.map((o) => ({
                  value: o.value,
                  label: o.label,
                }))}
              />
            </div>
          </div>

          {/* Synthesize CTA. Centered to match the H1 + selector
              rhythm above. */}
          <div className="flex justify-center">
            <Button
              type="submit"
              disabled={!canSubmit}
              data-testid="planner-synthesize"
              className="!px-10 !py-5 !text-lg !bg-[var(--color-accent-dark)] !text-white focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              {pending ? "Synthesizing…" : "Synthesize Itinerary"}
              <span
                aria-hidden
                className="material-symbols-outlined !text-[20px] ml-1"
              >
                arrow_forward
              </span>
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
}
