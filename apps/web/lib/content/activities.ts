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
};

export const DEFAULT_ACTIVITY_INTENT: ActivityIntent = {
  region: "porto",
  timeWindow: "an afternoon",
  moods: ["good food"],
  group: "two adults",
  constraints: []
};

/**
 * This remains intentionally empty until the editorial desk supplies
 * attributable records. Public discovery must show an honest empty state,
 * rather than turn fixture recommendations into product curation.
 */
export const REVIEWED_ACTIVITY_SEED: readonly EditorialActivity[] = [];

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
