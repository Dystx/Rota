import * as React from "react";
import { Metadata } from "next";
import { REVIEWED_ACTIVITY_SEED } from "@/lib/content/activities";
import { PlannerClient, type PlannerInitialState } from "./planner-client";

export const metadata: Metadata = {
  title: "Plan a Portugal trip | AI Intent Engine",
  description:
    "One sentence, one click. We craft your day-by-day itinerary and open the trip workspace.",
  alternates: {
    canonical: "/planner"
  }
};

/**
 * The planner page accepts optional query params from upstream
 * flows (the home intent card, the bento, etc.):
 *
 *   ?destination=<slug>   — pre-fills the destination input.
 *   ?days=<integer>        — pre-fills the days input.
 *   ?window=<string>       — pre-fills the travel window.
 *
 * All questions live on a SINGLE screen (the reference pattern:
 * "We are crafting a journey to Portugal for 7 days in May.")
 * — no 5-step sequential wizard. The user types their trip
 * summary, picks mobility + energy chips, and hits
 * Synthesize Itinerary.
 *
 * The page deliberately does NOT render TopNav: the wizard is a
 * full-screen cinematic experience with its own brand mark in
 * the top-left.
 */
export default async function PlannerPage({
  searchParams
}: {
  searchParams: Promise<{ destination?: string; days?: string; window?: string; transport?: string; vibe?: string; edit?: string; activity?: string | readonly string[] }>;
}) {
  const params = await searchParams;
  const requestedActivityIds = typeof params.activity === "string" ? [params.activity] : params.activity ?? [];
  const activitiesById = new Map(REVIEWED_ACTIVITY_SEED.map((activity) => [activity.id, activity]));
  const initialActivities = [...new Set(requestedActivityIds.map((id) => id.trim()).filter(Boolean))]
    .flatMap((id) => {
      const activity = activitiesById.get(id);
      return activity ? [activity] : [];
    });
  const days = Math.max(1, Math.min(60, parseInt(params.days ?? "7", 10) || 7));
  const destination = (params.destination ?? initialActivities[0]?.region ?? "portugal").toLowerCase();
  const initial: PlannerInitialState = {
    initialDays: days,
    initialDestination: destination,
    initialWindow: params.window
    ,initialTransport: params.transport === "car" || params.transport === "transit" ? params.transport : "transit"
    ,initialVibe: params.vibe === "restorative" || params.vibe === "balanced" || params.vibe === "high_energy" ? params.vibe : "balanced"
    ,initialEdit: params.edit === "destination" || params.edit === "travelWindow" || params.edit === "days" || params.edit === "transport" || params.edit === "vibe" ? params.edit : undefined
    ,initialActivityIds: initialActivities.map((activity) => activity.id)
    ,initialActivities
  };

  return <PlannerClient initial={initial} />;
}
