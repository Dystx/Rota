"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { TripBriefSchema, type TripBrief } from "@repo/types";
import { TripBriefReview } from "./trip-brief-review";

/**
 * The route intentionally has no native form controls. It is a review canvas
 * composed of buttons, chips, and focused option sheets; freeform context is
 * represented by finite, privacy-safe route-protection choices.
 */
const DEFAULT_BRIEF: TripBrief = {
  destinationCountry: "portugal",
  regions: ["porto", "douro-valley"],
  tripLengthDays: 5,
  startDate: undefined,
  endDate: undefined,
  travelersCount: 2,
  travelerType: "couple",
  budgetLevel: "mid-range",
  pace: "calm",
  interests: ["local-food", "old-streets", "sea-views"],
  foodPreferences: ["casual-local-meals"],
  avoidances: ["rushed-schedules"],
  transportMode: "train-and-transfers",
  accommodationLocation: "Porto historic center or riverside",
  rawBrief: "A considered Portugal route with local character, a comfortable pace, and room to wander."
};

function parseBriefFromQuery(raw: string | null): TripBrief | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as unknown;
    const result = TripBriefSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function TripBriefForm() {
  const searchParams = useSearchParams();
  const incomingBrief = parseBriefFromQuery(searchParams.get("brief"));
  return <TripBriefReview initialBrief={incomingBrief ?? DEFAULT_BRIEF} />;
}

export function TripBriefFormBoundary() {
  return (
    <Suspense fallback={<div role="status" aria-live="polite" className="min-h-48 rounded-2xl border border-olive-light/20 bg-white/40" />}>
      <TripBriefForm />
    </Suspense>
  );
}
