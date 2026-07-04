import { Metadata } from "next";
import { TopNav } from "../_components/top-nav";
import { PlannerClient, type PlannerInitialState } from "./planner-client";

export const metadata: Metadata = {
  title: "Plan a Portugal trip | AI Intent Engine",
  description:
    "Tell us about your ideal Portugal trip in plain English. We extract dates, regions, pace, and budget before crafting your itinerary.",
  alternates: {
    canonical: "/planner"
  }
};

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

function destinationLabel(slug: string | undefined): string {
  if (!slug) return "Portugal";
  const key = slug.toLowerCase();
  return DESTINATION_LABELS[key] ?? slug.replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildPrefillPrompt(destination: string, days: number): string {
  const place = destinationLabel(destination);
  // Match the rough shape the user would have typed manually. The
  // Planner's normalizer will then extract the structured fields.
  return `A ${days}-day trip to ${place}, mid-range budget, balanced pace.`;
}

/**
 * The planner page accepts two optional query params from upstream
 * flows (the home hero's "Begin Journey" CTA, the bento cards, etc.):
 *
 *   ?destination=<slug>   — one of: portugal | lisbon | porto | douro |
 *                            sintra | cascais | coimbra | algarve | azores
 *   ?days=<integer>         — positive integer, 1..60
 *
 * Both are surfaced as the initial prompt text in the PromptComposer.
 * The user can edit before submitting — the prefill is a starting
 * point, not a hard lock.
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
    promptValue: buildPrefillPrompt(destination, days),
    initialDays: days,
    initialDestination: destination
  };

  return (
    <>
      <TopNav />
      <PlannerClient initial={initial} />
    </>
  );
}
