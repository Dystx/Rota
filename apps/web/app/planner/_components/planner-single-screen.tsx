"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { TransportChoice } from "./transport-step";
import type { Vibe } from "./vibe-step";

/**
 * PlannerSingleScreen — replaces the 5-step sequential wizard
 * with one screen of inline-editable fields.
 *
 * Layout (top to bottom):
 *
 *   "We are crafting a journey to [Portugal] for [7] days in [May]."
 *     — three inline-editable fields, ochre dashed underline.
 *
 *   "Mobility" — two compact pill buttons (Car / Transit).
 *
 *   "Energy"   — three compact pill buttons (Calm / Balanced / Full).
 *
 *   [ Synthesize Itinerary → ]
 *
 * All questions are visible at once — the user types, clicks
 * chips, and synthesizes without navigating between screens.
 * URL state is preserved (destination + days on entry, all
 * fields on completion) so a refresh mid-flow resumes cleanly.
 *
 * This matches the reference's single-screen wizard pattern
 * ("We are crafting a journey to Portugal for 7 days in May.")
 * while keeping the current app's 4 question set (destination,
 * days, transport, vibe) so the AI synthesis prompt has the
 * same context.
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
    initialTransport ?? ""
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

  // Shared className for the inline editable sentence fields.
  // Transparent background, ochre dashed underline, ochre text —
  // they read as part of the sentence until you click them.
  const sentenceField =
    "bg-transparent border-0 border-b-2 border-dashed border-ochre-light/50 focus:border-ochre-light focus:outline-none text-ochre-light font-display-mobile md:font-display text-3xl md:text-5xl text-center min-w-0";

  return (
    <main
      id="main-content"
      className="relative min-h-screen bg-primary text-linen-dark flex flex-col"
      data-testid="planner-single-screen"
    >
      {/* Fixed top bar — Rumia wordmark + close (back to home).
          The reference places a close X in the top-right; we use
          the same pattern so the wizard feels like a modal layer
          over the app. */}
      <header className="fixed top-0 w-full z-50 px-container-padding-lg py-4 flex justify-between items-center">
        <span className="font-headline-sm text-headline-sm italic text-ochre-light">
          Rumia
        </span>
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
          {/* AI Intent Engine badge — mirrors the reference. */}
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

          {/* Sentence with inline editable fields. */}
          <h1 className="font-display-mobile md:font-display text-3xl md:text-5xl text-linen-dark leading-tight text-center">
            <label>
              We are crafting a journey to{" "}
              <input
                type="text"
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                aria-label="Destination"
                data-testid="planner-destination"
                className={`${sentenceField} w-40 md:w-56`}
              />
            </label>{" "}
            <label>
              for{" "}
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={60}
                value={days}
                onChange={(event) => setDays(event.target.value)}
                aria-label="Number of days"
                data-testid="planner-days"
                className={`${sentenceField} w-14 md:w-20`}
              />{" "}
              days in
            </label>{" "}
            <label>
              <input
                type="text"
                value={window}
                onChange={(event) => setWindow(event.target.value)}
                aria-label="Travel window"
                placeholder="May"
                data-testid="planner-window"
                className={`${sentenceField} w-32 md:w-40`}
              />
              .
            </label>
          </h1>

          {/* Compact pill selectors for transport + vibe. Kept on
              the same screen so the user can answer all questions
              in one pass without navigating. */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <fieldset className="flex flex-col gap-3">
              <legend className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-light mb-1">
                Mobility
              </legend>
              <div className="flex gap-2">
                <Pill
                  label="Car"
                  icon="car_rental"
                  active={transport === "car"}
                  onClick={() => setTransport("car")}
                />
                <Pill
                  label="Transit & walking"
                  icon="directions_transit"
                  active={transport === "transit"}
                  onClick={() => setTransport("transit")}
                />
              </div>
            </fieldset>

            <fieldset className="flex flex-col gap-3">
              <legend className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-light mb-1">
                Energy
              </legend>
              <div className="flex gap-2">
                <Pill
                  label="Calm"
                  active={vibe === "restorative"}
                  onClick={() => setVibe("restorative")}
                />
                <Pill
                  label="Balanced"
                  active={vibe === "balanced"}
                  onClick={() => setVibe("balanced")}
                />
                <Pill
                  label="Full"
                  active={vibe === "high_energy"}
                  onClick={() => setVibe("high_energy")}
                />
              </div>
            </fieldset>
          </div>

          {/* Synthesize CTA. */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!canSubmit}
              data-testid="planner-synthesize"
              className="bg-ochre-light text-primary font-label-ui text-label-ui px-8 py-4 rounded-lg shadow-sm hover:shadow-lg transition-all flex items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              <span>{pending ? "Synthesizing…" : "Synthesize Itinerary"}</span>
              <span
                aria-hidden
                className="material-symbols-outlined group-hover:translate-x-1 transition-transform"
              >
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}

function Pill({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-all font-label-ui text-label-ui ${
        active
          ? "border-ochre-light bg-ochre-light/15 text-ochre-light"
          : "border-white/20 bg-white/5 text-linen-dark/80 hover:border-white/40"
      }`}
    >
      {icon ? (
        <span aria-hidden className="material-symbols-outlined text-[18px]">
          {icon}
        </span>
      ) : null}
      {label}
    </button>
  );
}
