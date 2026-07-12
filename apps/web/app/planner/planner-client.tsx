"use client";

import { PlannerSingleScreen } from "./_components/planner-single-screen";
import type { EditorialActivity } from "@/lib/content/activities";
import type { TransportChoice } from "./_components/transport-step";
import type { Vibe } from "./_components/vibe-step";
import type { ActivityDayTime, ActivityDayTransport } from "./_components/activity-day-planner";

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
  initialEdit?: "destination" | "travelWindow" | "days" | "transport" | "vibe";
  initialActivityIds?: readonly string[];
  initialActivities?: readonly EditorialActivity[];
  /** Browser-only preferences for a selected activity day. */
  initialDayTime?: ActivityDayTime;
  initialActivityTransport?: ActivityDayTransport;
}

/**
 * PlannerClient — routes selected activities into a day-scale check.
 *
 * Direct visits retain advanced multi-day choices. A known reviewed activity
 * selection never gets converted into a generic itinerary request.
 */
export function PlannerClient({ initial }: { initial?: PlannerInitialState } = {}) {
  return (
    <PlannerSingleScreen
      initialDestination={initial?.initialDestination}
      initialDays={initial?.initialDays}
      initialWindow={initial?.initialWindow}
      initialTransport={initial?.initialTransport}
      initialVibe={initial?.initialVibe}
      initialEdit={initial?.initialEdit}
      initialActivityIds={initial?.initialActivityIds}
      initialActivities={initial?.initialActivities}
      initialDayTime={initial?.initialDayTime}
      initialActivityTransport={initial?.initialActivityTransport}
    />
  );
}
