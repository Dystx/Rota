"use client";

import * as React from "react";
function cn(...values: Array<string | false | null | undefined>): string { return values.filter(Boolean).join(" "); }
import type { Tone, Vibe } from "./vibe-step";

/**
 * SynthesizeStep — Stitch 1.2 final step.
 *
 * Summary of all the answers + the "Synthesize Itinerary →" CTA.
 * 1 click to generate. After clicking, the existing prompt-
 * generation flow runs and the user is redirected to the trip
 * page.
 */
export interface SynthesizeSummary {
  destination: string;
  days: number;
  month: string;
  transport: "car" | "transit" | null;
  vibe: Vibe;
  tone: Tone;
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
  azores: "the Azores"
};

const TRANSPORT_LABELS: Record<"car" | "transit", string> = {
  car: "Rental car",
  transit: "Public transit"
};

const VIBE_LABELS: Record<Vibe, string> = {
  restorative: "Restorative",
  balanced: "Balanced",
  high_energy: "High energy"
};

const TONE_LABELS: Record<Tone, string> = {
  accessible: "Accessible",
  boutique: "Boutique",
  ultra_luxury: "Ultra-luxury"
};

function prettyDestination(slug: string): string {
  const key = slug.toLowerCase();
  return DESTINATION_LABELS[key] ?? slug.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function SynthesizeSummaryView({ summary }: { summary: SynthesizeSummary }) {
  return (
    <div
      data-testid="synthesize-summary"
      className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left"
    >
      <SummaryRow label="Destination" value={prettyDestination(summary.destination)} />
      <SummaryRow
        label="Duration"
        value={`${summary.days} day${summary.days === 1 ? "" : "s"}${
          summary.month ? ` · ${summary.month}` : ""
        }`}
      />
      <SummaryRow
        label="Mobility"
        value={summary.transport ? TRANSPORT_LABELS[summary.transport] : "—"}
      />
      <SummaryRow label="Vibe" value={VIBE_LABELS[summary.vibe]} />
      <SummaryRow label="Tone" value={TONE_LABELS[summary.tone]} />
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      data-testid="synthesize-summary-row"
      className={cn(
        "flex items-baseline justify-between gap-2 rounded-lg bg-white/70 border border-olive-light/20 px-3 py-2"
      )}
    >
      <span className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-dark">
        {label}
      </span>
      <span className="font-body-md text-body-md text-primary text-right">
        {value}
      </span>
    </div>
  );
}
