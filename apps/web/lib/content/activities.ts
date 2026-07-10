export const ACTIVITY_REGIONS = ["porto", "lisbon", "douro", "algarve", "azores"] as const;

export type ActivityRegion = (typeof ACTIVITY_REGIONS)[number];

export type ActivityIntent = {
  region: ActivityRegion;
  timeWindow: string;
  moods: readonly string[];
  group: string;
  constraints: readonly string[];
};

export type EditorialActivity = {
  id: string;
  placeId: string;
  region: ActivityRegion;
  title: string;
  verdict: string;
  bestFor: readonly string[];
  durationMinutes: number;
  bestTime: string;
  avoidWhen: string | null;
  bookingNeed: "none" | "consider" | "essential";
  pairWith: readonly string[];
  alternativeId: string | null;
  weatherFit: readonly ("sun" | "rain" | "either")[];
  editorialStatus: "reviewed" | "draft";
  reviewedAt: string;
  evidenceUrl: string;
};

export const DEFAULT_ACTIVITY_INTENT: ActivityIntent = {
  region: "porto",
  timeWindow: "an afternoon",
  moods: ["good food"],
  group: "two adults",
  constraints: []
};

/**
 * Launch corpus researched against the linked official tourism references.
 * Verdicts are Rumia editorial judgments; the source URLs ground the facts,
 * not an endorsement, booking relationship, or paid placement.
 */
export const REVIEWED_ACTIVITY_SEED: readonly EditorialActivity[] = [
  {
    id: "porto-ribeira-slow-walk",
    placeId: "porto-ribeira",
    region: "porto",
    title: "Ribeira and Miragaia at walking pace",
    verdict: "Worth doing for a first feel of Porto, but give the hills and riverfront one unhurried block rather than your whole day.",
    bestFor: ["a walk", "good food", "first afternoon"],
    durationMinutes: 120,
    bestTime: "Late afternoon into early evening",
    avoidWhen: "You need a quiet, step-free, or fast-moving morning.",
    bookingNeed: "none",
    pairWith: ["A simple dinner away from the busiest riverfront tables"],
    alternativeId: "porto-bombarda-art-walk",
    weatherFit: ["sun", "either"],
    editorialStatus: "reviewed",
    reviewedAt: "2026-07-10",
    evidenceUrl: "https://www.visitportugal.com/en/destinos/porto-e-norte/73735/amp"
  },
  {
    id: "porto-bombarda-art-walk",
    placeId: "porto-miguel-bombarda",
    region: "porto",
    title: "Miguel Bombarda for contemporary art and design",
    verdict: "Choose this when you want a Porto afternoon with texture beyond the riverfront; it is a better counterweight than adding another viewpoint.",
    bestFor: ["culture", "a walk", "a rainy afternoon"],
    durationMinutes: 90,
    bestTime: "Mid-afternoon",
    avoidWhen: "You only have time for one essential historic-core walk.",
    bookingNeed: "none",
    pairWith: ["Ribeira and Miragaia at walking pace"],
    alternativeId: "porto-ribeira-slow-walk",
    weatherFit: ["rain", "either"],
    editorialStatus: "reviewed",
    reviewedAt: "2026-07-10",
    evidenceUrl: "https://www.visitportugal.com/en/destinos/porto-e-norte/73735/amp"
  },
  {
    id: "lisbon-alfama-slow-walk",
    placeId: "lisbon-alfama",
    region: "lisbon",
    title: "Alfama, slowly and on foot",
    verdict: "A strong Lisbon choice when you want atmosphere and views, provided you treat the climbs as the activity rather than a shortcut between landmarks.",
    bestFor: ["a walk", "culture", "first afternoon"],
    durationMinutes: 150,
    bestTime: "Late afternoon on a clear day",
    avoidWhen: "Steep cobbles or repeated climbs will make the day worse for your group.",
    bookingNeed: "none",
    pairWith: ["A fado evening after a rest"],
    alternativeId: "lisbon-alfama-fado-evening",
    weatherFit: ["sun", "either"],
    editorialStatus: "reviewed",
    reviewedAt: "2026-07-10",
    evidenceUrl: "https://www.visitlisboa.com/en/places/alfama"
  },
  {
    id: "lisbon-alfama-fado-evening",
    placeId: "lisbon-alfama-fado",
    region: "lisbon",
    title: "A fado evening after Alfama",
    verdict: "Best as the closing note to an Alfama day, not a compulsory Lisbon checkbox; choose a table only after you decide you want the listening time.",
    bestFor: ["culture", "good food", "an evening"],
    durationMinutes: 150,
    bestTime: "Evening after a lighter afternoon",
    avoidWhen: "You are already tired from a long hill walk or want a quick, spontaneous meal.",
    bookingNeed: "consider",
    pairWith: ["Alfama, slowly and on foot"],
    alternativeId: "lisbon-alfama-slow-walk",
    weatherFit: ["rain", "either"],
    editorialStatus: "reviewed",
    reviewedAt: "2026-07-10",
    evidenceUrl: "https://www.visitlisboa.com/en/places/alfama"
  },
  {
    id: "douro-line-pinhao",
    placeId: "douro-pinhao-station",
    region: "douro",
    title: "The Douro line to Pinhão",
    verdict: "One of the cleanest ways to understand the valley without driving it; make the train the point, not a rushed transfer between tastings.",
    bestFor: ["a scenic journey", "culture", "without a car"],
    durationMinutes: 240,
    bestTime: "A daylight journey with room to linger",
    avoidWhen: "You are trying to fit a full tasting schedule and a return transfer into the same short day.",
    bookingNeed: "consider",
    pairWith: ["A single quinta visit or a slow Pinhão lunch"],
    alternativeId: "douro-quinta-slow-day",
    weatherFit: ["sun", "rain", "either"],
    editorialStatus: "reviewed",
    reviewedAt: "2026-07-10",
    evidenceUrl: "https://www.visitportugal.com/en/content/douro-valley"
  },
  {
    id: "douro-quinta-slow-day",
    placeId: "douro-quinta",
    region: "douro",
    title: "One quinta and a slow valley lunch",
    verdict: "A better Douro day is usually one thoughtful wine stop plus the landscape, rather than collecting tastings across a valley that takes time to move through.",
    bestFor: ["good food", "wine", "a full day"],
    durationMinutes: 300,
    bestTime: "Late morning through lunch",
    avoidWhen: "You are driving and plan to combine several tastings with a late transfer.",
    bookingNeed: "essential",
    pairWith: ["The Douro line to Pinhão"],
    alternativeId: "douro-line-pinhao",
    weatherFit: ["sun", "either"],
    editorialStatus: "reviewed",
    reviewedAt: "2026-07-10",
    evidenceUrl: "https://www.visitportugal.com/en/content/douro-valley"
  },
  {
    id: "algarve-via-algarviana-section",
    placeId: "algarve-via-algarviana",
    region: "algarve",
    title: "A chosen Via Algarviana section",
    verdict: "Choose a short, prepared section when you want the Algarve beyond its coast; it rewards a slower day and is not a drop-in replacement for a beach stop.",
    bestFor: ["a walk", "nature", "quiet time"],
    durationMinutes: 210,
    bestTime: "Morning outside peak heat",
    avoidWhen: "You have not checked the exact section, weather, water, and transport back.",
    bookingNeed: "none",
    pairWith: ["A low-key village lunch"],
    alternativeId: "algarve-ponta-da-piedade",
    weatherFit: ["sun"],
    editorialStatus: "reviewed",
    reviewedAt: "2026-07-10",
    evidenceUrl: "https://www.visitportugal.com/en/destinos/algarve/73808"
  },
  {
    id: "algarve-ponta-da-piedade",
    placeId: "algarve-ponta-da-piedade",
    region: "algarve",
    title: "Ponta da Piedade as a short cliffside stop",
    verdict: "Use it for a concentrated coastal hour and good light, then move on; it is more satisfying as one scene in a day than as an all-afternoon queue exercise.",
    bestFor: ["a walk", "sea views", "first afternoon"],
    durationMinutes: 75,
    bestTime: "Late afternoon in stable weather",
    avoidWhen: "Wind, heat, or crowding makes the stairs and exposed coast feel like work.",
    bookingNeed: "none",
    pairWith: ["A calmer beach or an inland dinner"],
    alternativeId: "algarve-via-algarviana-section",
    weatherFit: ["sun"],
    editorialStatus: "reviewed",
    reviewedAt: "2026-07-10",
    evidenceUrl: "https://www.visitportugal.com/pt-pt/content/ponta-da-piedade"
  },
  {
    id: "azores-sete-cidades-rim",
    placeId: "azores-sete-cidades",
    region: "azores",
    title: "Sete Cidades rim and Vista do Rei",
    verdict: "A defining São Miguel landscape when the weather is clear; treat it as a weather-dependent half-day, not a guaranteed photograph on a rigid schedule.",
    bestFor: ["nature", "a walk", "a scenic journey"],
    durationMinutes: 210,
    bestTime: "A clear morning with weather flexibility",
    avoidWhen: "Low cloud removes the view or you have no buffer to change the day.",
    bookingNeed: "none",
    pairWith: ["A simple Sete Cidades village stop"],
    alternativeId: "azores-furnas-volcanic-day",
    weatherFit: ["sun"],
    editorialStatus: "reviewed",
    reviewedAt: "2026-07-10",
    evidenceUrl: "https://visitportugal.com/en/content/sao-miguel-the-green-island"
  },
  {
    id: "azores-furnas-volcanic-day",
    placeId: "azores-furnas",
    region: "azores",
    title: "Furnas: volcanic valley and thermal landscape",
    verdict: "Choose Furnas when you want a full, sensory São Miguel day with weather resilience; do not compress it into a quick stop between distant viewpoints.",
    bestFor: ["nature", "good food", "a rainy afternoon"],
    durationMinutes: 300,
    bestTime: "A full day with a flexible middle",
    avoidWhen: "You are only passing through the east of the island with no time to slow down.",
    bookingNeed: "consider",
    pairWith: ["A nearby thermal stop chosen for current conditions"],
    alternativeId: "azores-sete-cidades-rim",
    weatherFit: ["rain", "either"],
    editorialStatus: "reviewed",
    reviewedAt: "2026-07-10",
    evidenceUrl: "https://www.visitazores.com/en/explore?category=places-to-visit&island=sao-miguel"
  }
];

type QueryValue = string | readonly string[] | undefined;
type ActivityIntentQuery = Record<string, QueryValue>;

function first(value: QueryValue): string | undefined {
  return typeof value === "string" ? value : value?.[0];
}

function values(value: QueryValue): readonly string[] {
  if (!value) return [];
  return typeof value === "string" ? [value] : value;
}

function nonEmpty(valuesToClean: readonly string[]): readonly string[] {
  return valuesToClean.map((value) => value.trim()).filter(Boolean);
}

function region(value: string | undefined): ActivityRegion {
  return ACTIVITY_REGIONS.includes(value as ActivityRegion)
    ? (value as ActivityRegion)
    : DEFAULT_ACTIVITY_INTENT.region;
}

export function parseActivityIntent(query: ActivityIntentQuery): ActivityIntent {
  const moods = nonEmpty(values(query.mood));
  const constraints = nonEmpty(values(query.constraint));

  return {
    region: region(first(query.region)),
    timeWindow: first(query.time)?.trim() || DEFAULT_ACTIVITY_INTENT.timeWindow,
    moods: moods.length > 0 ? moods : DEFAULT_ACTIVITY_INTENT.moods,
    group: first(query.group)?.trim() || DEFAULT_ACTIVITY_INTENT.group,
    constraints
  };
}

function matchesIntent(activity: EditorialActivity, intent: ActivityIntent): boolean {
  if (activity.region !== intent.region) return false;
  if (intent.moods.length === 0) return true;

  const bestFor = new Set(activity.bestFor.map((value) => value.toLocaleLowerCase("en")));
  return intent.moods.some((mood) => bestFor.has(mood.toLocaleLowerCase("en")));
}

export function getReviewedActivities(
  activities: readonly EditorialActivity[],
  intent: ActivityIntent
): readonly EditorialActivity[] {
  return activities
    .filter(
      (activity) =>
        activity.editorialStatus === "reviewed" &&
        activity.verdict.trim().length > 0 &&
        matchesIntent(activity, intent)
    )
    .slice(0, 5);
}

export function activityExplorerUrl(intent: ActivityIntent): string {
  const query = new URLSearchParams({
    region: intent.region,
    time: intent.timeWindow
  });

  for (const mood of intent.moods) query.append("mood", mood);
  query.set("group", intent.group);
  for (const constraint of intent.constraints) query.append("constraint", constraint);

  return `/explore?${query.toString()}`;
}
