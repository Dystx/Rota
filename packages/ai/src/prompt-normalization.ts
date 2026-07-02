import {
  TripBriefSchema,
  type TripBrief,
  budgetLevels,
  foodPreferenceOptions,
  interestOptions,
  paceOptions,
  portugalRegions,
  transportModes,
  travelerTypes
} from "@repo/types";

export type PromptFollowUpField = "duration" | "region" | "budget" | "pace";

export type PromptFollowUpQuestion = {
  id: `trip_prompt.${PromptFollowUpField}`;
  field: PromptFollowUpField;
  label: string;
  question: string;
  options: readonly string[];
  allowsFreeAnswer: boolean;
};

export type PromptTripCandidateResult = {
  kind: "candidate";
  candidate: TripBrief;
  provider: string;
};

export type PromptTripFollowUpResult = {
  kind: "needs_follow_up";
  questions: PromptFollowUpQuestion[];
  provider: string;
};

export type PromptTripNormalizationResult = PromptTripCandidateResult | PromptTripFollowUpResult;

export interface PromptTripProvider {
  readonly id: string;
  normalizePrompt(prompt: string): Promise<PromptTripNormalizationResult> | PromptTripNormalizationResult;
}

type CandidateDraft = {
  destinationCountry: "portugal";
  regions: string[];
  tripLengthDays?: number;
  travelersCount: number;
  travelerType: string;
  budgetLevel?: string;
  pace?: string;
  interests: string[];
  foodPreferences: string[];
  avoidances: string[];
  transportMode: string;
  accommodationLocation: string;
  rawBrief: string;
};

const followUpQuestions = {
  duration: {
    id: "trip_prompt.duration",
    field: "duration",
    label: "Trip length",
    question: "How many days should we design for this Portugal route?",
    options: ["3 days", "5 days", "7 days", "10 days"],
    allowsFreeAnswer: true
  },
  region: {
    id: "trip_prompt.region",
    field: "region",
    label: "Regions",
    question: "Which Portugal regions should anchor the trip?",
    options: ["Porto + Douro Valley", "Lisbon + Sintra", "Alentejo", "Algarve"],
    allowsFreeAnswer: true
  },
  budget: {
    id: "trip_prompt.budget",
    field: "budget",
    label: "Budget",
    question: "What budget level should the route assume?",
    options: [...budgetLevels],
    allowsFreeAnswer: false
  },
  pace: {
    id: "trip_prompt.pace",
    field: "pace",
    label: "Pace",
    question: "How full should each day feel?",
    options: [...paceOptions],
    allowsFreeAnswer: false
  }
} satisfies Record<PromptFollowUpField, PromptFollowUpQuestion>;

const regionPatterns = [
  { region: "douro-valley", patterns: [/\bdouro\b/, /douro valley/] },
  { region: "porto", patterns: [/\bporto\b/] },
  { region: "lisbon", patterns: [/\blisbon\b/, /\blisboa\b/] },
  { region: "sintra", patterns: [/\bsintra\b/] },
  { region: "cascais", patterns: [/\bcascais\b/] },
  { region: "alentejo", patterns: [/\balentejo\b/, /\bevora\b/, /\bévora\b/] },
  { region: "algarve", patterns: [/\balgarve\b/, /\blagos\b/, /\bfaro\b/] },
  { region: "coimbra", patterns: [/\bcoimbra\b/] },
  { region: "aveiro", patterns: [/\baveiro\b/] }
] satisfies { region: (typeof portugalRegions)[number]; patterns: RegExp[] }[];

const numberWords = new Map([
  ["two", 2],
  ["three", 3],
  ["four", 4],
  ["five", 5],
  ["six", 6],
  ["seven", 7],
  ["eight", 8],
  ["nine", 9],
  ["ten", 10],
  ["eleven", 11],
  ["twelve", 12]
]);

function normalizeText(prompt: string): string {
  return prompt.toLocaleLowerCase("en-US").replace(/[–—]/g, "-").trim();
}

function uniqueValues<Value extends string>(values: Value[]): Value[] {
  return [...new Set(values)];
}

function includesAny(text: string, patterns: readonly RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

function extractTripLengthDays(text: string): number | undefined {
  const numericMatch = /\b(\d{1,2})\b(?:\s+\w+){0,3}\s+(?:day|days|nights)\b/.exec(text);
  if (numericMatch?.[1]) {
    return Number(numericMatch[1]);
  }

  for (const [word, value] of numberWords) {
    if (new RegExp(`\\b${word}\\b(?:\\s+\\w+){0,3}\\s+(?:day|days|nights)\\b`).test(text)) {
      return value;
    }
  }

  return undefined;
}

function extractRegions(text: string): CandidateDraft["regions"] {
  return uniqueValues(
    regionPatterns.flatMap(({ region, patterns }) => (includesAny(text, patterns) ? [region] : []))
  );
}

function extractTravelerType(text: string): (typeof travelerTypes)[number] {
  if (/\bfamily\b|\bkids?\b|\bchildren\b/.test(text)) return "family";
  if (/\bfriends\b|\bgroup\b/.test(text)) return "friends";
  if (/\bsolo\b|\balone\b/.test(text)) return "solo";
  return "couple";
}

function extractTravelersCount(text: string, travelerType: (typeof travelerTypes)[number]): number {
  const explicitTravelers = /\b(\d{1,2})\s*(?:travelers|travellers|people|adults|guests)\b/.exec(text);
  if (explicitTravelers?.[1]) return Number(explicitTravelers[1]);
  if (travelerType === "solo") return 1;
  if (travelerType === "family") return 4;
  if (travelerType === "friends") return 4;
  return 2;
}

function extractBudgetLevel(text: string): CandidateDraft["budgetLevel"] {
  if (/\bbudget\b|\bcheap\b|\baffordable\b/.test(text)) return "budget";
  if (/\bpremium\b|\bluxury\b|\bboutique\b|\bhigh[- ]end\b/.test(text)) return "premium";
  if (/\bmid[- ]range\b|\bmoderate\b|\bcomfortable\b/.test(text)) return "mid-range";
  return undefined;
}

function extractPace(text: string): CandidateDraft["pace"] {
  if (/\bslow\b|\bcalm\b|\bquiet\b|\brelaxed\b|\bunhurried\b/.test(text)) return "calm";
  if (/\bfull\b|\bpacked\b|\bactive\b|\bambitious\b/.test(text)) return "full";
  if (/\bbalanced\b|\bmix\b/.test(text)) return "balanced";
  return undefined;
}

function extractInterests(text: string): CandidateDraft["interests"] {
  const interests: (typeof interestOptions)[number][] = [];
  if (/\bfood\b|\bmarkets?\b|\brestaurants?\b|\blunch\b|\bdinner\b/.test(text)) interests.push("local-food");
  if (/\bold streets?\b|\bhistoric\b|\bhistory\b|\bneighbou?rhoods?\b/.test(text)) interests.push("old-streets");
  if (/\bsea\b|\bcoast\b|\bbeach\b|\bocean\b|\bviews?\b/.test(text)) interests.push("sea-views");
  if (/\bwine\b|\bvineyards?\b|\btasting\b/.test(text)) interests.push("wine");
  if (/\bdesign\b|\barchitecture\b|\bmuseum\b|\bart\b/.test(text)) interests.push("design-and-architecture");
  if (/\bnature\b|\bhikes?\b|\bparks?\b|\bcountryside\b/.test(text)) interests.push("nature");
  if (/\bfamily\b|\bkids?\b|\bchildren\b/.test(text)) interests.push("family-friendly");
  if (/\bhidden\b|\blocal\b|\boff[- ]beat\b|\bnon[- ]touristy\b/.test(text)) interests.push("hidden-gems");
  return uniqueValues(interests);
}

function extractFoodPreferences(text: string): CandidateDraft["foodPreferences"] {
  const preferences: (typeof foodPreferenceOptions)[number][] = [];
  if (/\bseafood\b|\bfish\b/.test(text)) preferences.push("seafood");
  if (/\bwine bars?\b|\bwine\b/.test(text)) preferences.push("wine-bars");
  if (/\bspecial dinner\b|\bfine dining\b|\bcelebration\b/.test(text)) preferences.push("special-dinner");
  if (/\bcasual\b|\blocal meals?\b|\btascas?\b|\bmarkets?\b/.test(text)) preferences.push("casual-local-meals");
  if (/\bvegetarian\b|\bvegan\b/.test(text)) preferences.push("vegetarian-friendly");
  return uniqueValues(preferences);
}

function extractAvoidances(text: string): CandidateDraft["avoidances"] {
  const avoidances: CandidateDraft["avoidances"] = [];
  if (/\bno tourist\b|\bavoid tourist\b|\btourist-heavy\b|\bnon[- ]touristy\b/.test(text)) avoidances.push("tourist-heavy-stops");
  if (/\bno rush\b|\bavoid rush\b|\brushed\b|\bslow mornings?\b/.test(text)) avoidances.push("rushed-schedules");
  if (/\bno car\b|\bcar-free\b|\bno long drives?\b|\blong drives?\b/.test(text)) avoidances.push("long-drives");
  if (/\bstairs\b|\bsteep\b/.test(text)) avoidances.push("stairs-and-steep-walks");
  if (/\bno late nights?\b|\bearly nights?\b/.test(text)) avoidances.push("late-nights");
  return uniqueValues(avoidances);
}

function extractTransportMode(text: string): (typeof transportModes)[number] {
  if (/\bno car\b|\bcar-free\b|\bwithout a car\b/.test(text)) return "no-car";
  if (/\brental car\b|\bhire a car\b|\bdrive\b/.test(text)) return "rental-car";
  return "train-and-transfers";
}

function buildCandidateDraft(prompt: string): CandidateDraft {
  const text = normalizeText(prompt);
  const travelerType = extractTravelerType(text);

  return {
    destinationCountry: "portugal",
    regions: extractRegions(text),
    tripLengthDays: extractTripLengthDays(text),
    travelersCount: extractTravelersCount(text, travelerType),
    travelerType,
    budgetLevel: extractBudgetLevel(text),
    pace: extractPace(text),
    interests: extractInterests(text),
    foodPreferences: extractFoodPreferences(text),
    avoidances: extractAvoidances(text),
    transportMode: extractTransportMode(text),
    accommodationLocation: "",
    rawBrief: prompt.trim()
  };
}

function missingFields(draft: CandidateDraft): PromptFollowUpField[] {
  const fields: PromptFollowUpField[] = [];
  if (draft.tripLengthDays === undefined) fields.push("duration");
  if (!draft.regions.length) fields.push("region");
  if (draft.budgetLevel === undefined) fields.push("budget");
  if (draft.pace === undefined) fields.push("pace");
  return fields;
}

function buildFollowUpResult(fields: PromptFollowUpField[], provider: string): PromptTripFollowUpResult {
  return {
    kind: "needs_follow_up",
    questions: fields.map((field) => followUpQuestions[field]),
    provider
  };
}

function buildCandidateResult(draft: CandidateDraft, provider: string): PromptTripNormalizationResult {
  const parsed = TripBriefSchema.safeParse({
    ...draft,
    tripLengthDays: draft.tripLengthDays,
    budgetLevel: draft.budgetLevel,
    pace: draft.pace,
    interests: draft.interests.length ? draft.interests : ["hidden-gems"]
  });

  if (!parsed.success) {
    return buildFollowUpResult(missingFields(draft), provider);
  }

  return {
    kind: "candidate",
    candidate: parsed.data,
    provider
  };
}

function validateProviderResult(
  result: PromptTripNormalizationResult,
  provider: string
): PromptTripNormalizationResult {
  if (result.kind === "needs_follow_up") {
    return { ...result, provider };
  }

  const parsed = TripBriefSchema.safeParse(result.candidate);

  if (!parsed.success) {
    return buildFollowUpResult(["duration", "region", "budget", "pace"], provider);
  }

  return {
    kind: "candidate",
    candidate: parsed.data,
    provider
  };
}

export class DeterministicPromptTripProvider implements PromptTripProvider {
  readonly id = "deterministic-fallback";

  normalizePrompt(prompt: string): PromptTripNormalizationResult {
    const draft = buildCandidateDraft(prompt);
    const missing = missingFields(draft);

    if (missing.length > 0) {
      return buildFollowUpResult(missing, this.id);
    }

    return buildCandidateResult(draft, this.id);
  }
}

const deterministicProvider = new DeterministicPromptTripProvider();

export async function normalizeTripPrompt(
  prompt: string,
  provider: PromptTripProvider = deterministicProvider
): Promise<PromptTripNormalizationResult> {
  const sanitizedPrompt = prompt.trim().slice(0, 1200);

  if (sanitizedPrompt.length < 30) {
    return buildFollowUpResult(["duration", "region", "budget", "pace"], provider.id);
  }

  const result = await provider.normalizePrompt(sanitizedPrompt);
  return validateProviderResult(result, provider.id);
}
