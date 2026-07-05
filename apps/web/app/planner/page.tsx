import { Metadata } from "next";
import { PlannerClient, type PlannerInitialState } from "./planner-client";

export const metadata: Metadata = {
  title: "Plan a Portugal trip | AI Intent Engine",
  description:
    "Five quick questions. We craft your day-by-day itinerary and open the trip workspace.",
  alternates: {
    canonical: "/planner"
  }
};

/**
 * The planner page accepts two optional query params from upstream
 * flows (the home bento, the hero's quick-start, etc.):
 *
 *   ?destination=<slug>   — one of: portugal | lisbon | porto | douro |
 *                            sintra | cascais | coimbra | algarve | azores
 *   ?days=<integer>        — positive integer, 1..60
 *
 * Both pre-fill Step 1 (Where) and Step 2 (When) of the sequential
 * wizard. A user can change either during the wizard — the URL is
 * the source of truth only on entry.
 *
 * The page deliberately does NOT render TopNav: the sequential-step
 * overlay is a full-screen cinematic experience with its own
 * brand mark in the top-left. Showing the global nav on top of
 * it created a double-branded look with the wordmark visible
 * twice at the top of the viewport.
 */
export default async function PlannerPage({
  searchParams
}: {
  searchParams: Promise<{ destination?: string; days?: string }>;
}) {
  const params = await searchParams;
  const days = Math.max(1, Math.min(60, parseInt(params.days ?? "7", 10) || 7));
  const destination = (params.destination ?? "portugal").toLowerCase();
  const initial: PlannerInitialState = {
    initialDays: days,
    initialDestination: destination
  };

  return <PlannerClient initial={initial} />;
}

