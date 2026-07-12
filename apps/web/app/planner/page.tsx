import * as React from "react";
import { Metadata } from "next";
import { ActivityDayTimeSchema, ActivityDayTransportSchema } from "@repo/types";
import { REVIEWED_ACTIVITY_SEED } from "@/lib/content/activities";
import { PlannerClient, type PlannerInitialState } from "./planner-client";

export const metadata: Metadata = {
  title: "Shape a Portugal day",
  description:
    "Test selected Portugal activities against the time you have before turning them into a saved day.",
  alternates: {
    canonical: "/planner"
  }
};

/**
 * The planner page accepts optional query params from upstream
 * flows (the home intent card, the bento, etc.):
 *
 *   ?destination=<slug>   — pre-fills the destination input.
 *   ?days=<integer>        — pre-fills advanced multi-day planning.
 *   ?window=<string>       — pre-fills the travel window.
 *
 * A reviewed activity selection enters the day-scale feasibility path.
 * Direct visits retain the advanced multi-day planner as a secondary route.
 *
 * The page deliberately does NOT render TopNav: the wizard is a
 * full-screen cinematic experience with its own brand mark in
 * the top-left.
 */
export default async function PlannerPage({
  searchParams
}: {
  searchParams: Promise<{ destination?: string; days?: string; window?: string; transport?: string; vibe?: string; edit?: string; dayTime?: string; activity?: string | readonly string[] }>;
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
  const parsedDayTime = ActivityDayTimeSchema.safeParse(params.dayTime);
  const parsedTransport = ActivityDayTransportSchema.safeParse(params.transport);
  const initialDayTime = parsedDayTime.success ? parsedDayTime.data : "afternoon";
  const initialTransport = parsedTransport.success ? parsedTransport.data : "transit";
  const initial: PlannerInitialState = {
    initialDays: days,
    initialDestination: destination,
    initialWindow: params.window,
    initialTransport,
    initialVibe: params.vibe === "restorative" || params.vibe === "balanced" || params.vibe === "high_energy" ? params.vibe : "balanced",
    initialEdit: params.edit === "destination" || params.edit === "travelWindow" || params.edit === "days" || params.edit === "transport" || params.edit === "vibe" ? params.edit : undefined,
    initialActivityIds: initialActivities.map((activity) => activity.id),
    initialActivities,
    initialDayTime,
    initialActivityTransport: initialTransport
  };

  return <PlannerClient initial={initial} />;
}
