"use client";

import { PlannerSingleScreen } from "./_components/planner-single-screen";
import type { TransportChoice } from "./_components/transport-step";
import type { Vibe } from "./_components/vibe-step";

export interface PlannerInitialState {
  /**
   * Destination slug from the URL, e.g. "portugal", "lisbon".
   * Pre-fills the destination input on the single screen.
   */
  initialDestination?: string;
  /** Days from the URL, e.g. 7. Pre-fills the days input. */
  initialDays?: number;
  /** Travel window from the URL, e.g. "May", "Sep". */
  initialWindow?: string;
  initialTransport?: TransportChoice | "";
  initialVibe?: Vibe;
}

/**
 * PlannerClient — single-screen wizard.
 *
 * Replaces the previous 5-step sequential wizard. All questions
 * (destination, days, window, transport, vibe) live on one
 * screen with choice cards, chips, and sheets.
 * One click on "Synthesize Itinerary" sends the user to
 * /trip/new with a prompt.
 */
export function PlannerClient({ initial }: { initial?: PlannerInitialState } = {}) {
  return (
    <PlannerSingleScreen
      initialDestination={initial?.initialDestination}
      initialDays={initial?.initialDays}
      initialWindow={initial?.initialWindow}
      initialTransport={initial?.initialTransport}
      initialVibe={initial?.initialVibe}
    />
  );
}
