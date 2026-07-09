import { Metadata } from "next";
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
  searchParams: Promise<{ destination?: string; days?: string; window?: string }>;
}) {
  const params = await searchParams;
  const days = Math.max(1, Math.min(60, parseInt(params.days ?? "7", 10) || 7));
  const destination = (params.destination ?? "portugal").toLowerCase();
  const initial: PlannerInitialState = {
    initialDays: days,
    initialDestination: destination,
    initialWindow: params.window
  };

  return <PlannerClient initial={initial} />;
}
