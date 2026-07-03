import {
  ItinerarySchema,
  type Itinerary,
  type TripBrief,
  type TripQuestion
} from "@repo/types";
import { enrichItineraryWithCoords } from "./enrich";
import {
  intentToTripBrief,
  parseTripBriefIntent,
  type TripBriefIntent
} from "./llm-generator";
import { retrieveDestinations } from "./retrieval";

export * from "./prompt-normalization";
export * from "./llm-generator";
export * from "./triage";
export * from "./retrieval";

/**
 * Feature flag: when `USE_LLM=true` AND `OPENAI_API_KEY` is set,
 * the LLM parses the raw brief into a structured intent before
 * the deterministic itinerary assembly runs. When either is
 * missing, the deterministic stub runs unchanged.
 *
 * This keeps the LLM as an *additive* swap — no behaviour change
 * for existing tests, CI, or local dev without an API key.
 */
function shouldUseLLM(): boolean {
  return (
    process.env.USE_LLM === "true" && Boolean(process.env.OPENAI_API_KEY)
  );
}

export interface ItineraryGenerator {
  generate(tripBrief: TripBrief): Promise<Itinerary>;
}

function startHour(dayIndex: number, stopIndex: number) {
  return String(9 + stopIndex * 3 + (dayIndex === 1 ? 0 : 1)).padStart(2, "0");
}

function buildMissingInfo(brief: TripBrief): TripQuestion[] {
  const questions: TripQuestion[] = [];

  if (!brief.startDate || !brief.endDate) {
    questions.push({
      title: "Trip timing detail",
      question: "Do you already know the exact start and end dates for this route?",
      options: ["Yes, exact dates", "Not yet, keep it flexible", "Only arrival date known"],
      allowsFreeAnswer: true
    });
  }

  if (brief.transportMode === "train-and-transfers" && brief.regions.includes("douro-valley")) {
    questions.push({
      title: "Douro transport check",
      question: "Should Rota keep the Douro day car-free, or can we assume a private transfer?",
      options: ["Keep it car-free", "Private transfer is fine", "Still deciding"],
      allowsFreeAnswer: false
    });
  }

  if (!brief.foodPreferences.length) {
    questions.push({
      title: "Meal style",
      question: "Should the route prioritize one special meal or mostly relaxed local spots?",
      options: ["One special meal", "Mostly casual local spots", "A balanced mix"],
      allowsFreeAnswer: false
    });
  }

  return questions;
}

function buildDayTheme(region: string, index: number) {
  const themes = [
    "Arrival and local grounding",
    "Historic streets and viewpoint rhythm",
    "Slow food and river pacing",
    "Coastal reset and open-air stops",
    "Design details and unhurried final day"
  ];

  return `${themes[(index - 1) % themes.length]} in ${region.replace(/-/g, " ")}`;
}

class DeterministicItineraryGenerator implements ItineraryGenerator {
  async generate(tripBrief: TripBrief): Promise<Itinerary> {
    const days = Array.from({ length: tripBrief.tripLengthDays }, (_, index) => {
      const region = tripBrief.regions[index % tripBrief.regions.length] ?? tripBrief.regions[0] ?? "portugal";
      const dayIndex = index + 1;

      return {
        dayIndex,
        summary:
          dayIndex === 1
            ? "Ease into the route with generous buffers, one strong meal, and time to orient to the neighborhood."
            : "Keep the pacing calm with two anchor stops, a long meal window, and room for weather or energy-based adjustments.",
        theme: buildDayTheme(region, dayIndex),
        transportAssumption:
          tripBrief.transportMode === "no-car"
            ? "Walking and short local transfers only."
            : tripBrief.transportMode === "rental-car"
              ? "Rental car available for flexible movement between stops."
              : "Train connections and pre-planned transfers between anchor stops.",
        warnings:
          dayIndex === 1
            ? ["Keep arrival fatigue in mind before adding a late-night activity."]
            : dayIndex === tripBrief.tripLengthDays
              ? ["Leave a packing and departure buffer before the final transfer."]
              : [],
        stops: [
          {
            endTime: `${startHour(dayIndex, 0)}:45`,
            localTip: "Go early if you want the calmest light and the fewest tour groups.",
            placeName: `${region.replace(/-/g, " ")} neighborhood walk`,
            reason: `Anchors the day around ${tripBrief.interests[0]?.replace(/-/g, " ") ?? "local character"} without rushing the first hours.`,
            region: region.replace(/-/g, " "),
            startTime: `${startHour(dayIndex, 0)}:00`,
            warning: dayIndex === 2 ? "Shift later if weather is rough in the morning." : undefined
          },
          {
            endTime: `${startHour(dayIndex, 1)}:30`,
            localTip: "Reserve the meal window or key tasting in advance once dates are fixed.",
            placeName: `${region.replace(/-/g, " ")} lunch and local stop`,
            reason: `Balances ${tripBrief.pace} pacing with a stronger food moment and time to linger.`,
            region: region.replace(/-/g, " "),
            startTime: `${startHour(dayIndex, 1)}:00`,
            warning: tripBrief.avoidances.includes("late-nights") ? "Keep dinner early if evenings should stay light." : undefined
          },
          {
            endTime: `${startHour(dayIndex, 2)}:15`,
            localTip: "Use this slot as the first weather-flex or energy-flex adjustment if the day slips.",
            placeName: `${region.replace(/-/g, " ")} scenic reset`,
            reason: "Adds breathing room and keeps the route from feeling like a checklist.",
            region: region.replace(/-/g, " "),
            startTime: `${startHour(dayIndex, 2)}:00`
          }
        ]
      };
    });

    const itinerary = {
      confidenceScore: 0.76,
      days,
      localNotes: [
        "This preview prefers fewer anchors per day so the route feels curated rather than packed.",
        "Food and viewpoint choices should tighten once exact dates and transport certainty are known."
      ],
      missingInfo: buildMissingInfo(tripBrief),
      routeOverview: `A ${tripBrief.tripLengthDays}-day Portugal-first route through ${tripBrief.regions
        .map((region) => region.replace(/-/g, " "))
        .join(", ")} built around ${tripBrief.interests.map((interest) => interest.replace(/-/g, " ")).join(", ")} with a ${tripBrief.pace} rhythm.`,
      warnings: [
        "This is still a deterministic route preview and does not yet validate opening hours or route matrix constraints.",
        tripBrief.transportMode === "train-and-transfers"
          ? "Transfer-heavy days should be rechecked once exact travel dates are known."
          : "Exact timing validation still needs the routing layer."
      ],
      whyThisFitsYou: [
        `The route keeps a ${tripBrief.pace} pace and avoids ${tripBrief.avoidances.length ? tripBrief.avoidances.map((item) => item.replace(/-/g, " ")).join(", ") : "forced tradeoffs you did not ask for"}.`,
        `It emphasizes ${tripBrief.interests.map((interest) => interest.replace(/-/g, " ")).join(", ")} instead of a generic city checklist.`
      ]
    };

    return ItinerarySchema.parse(itinerary);
  }
}

const generator = new DeterministicItineraryGenerator();

export async function generateItineraryFromBrief(tripBrief: TripBrief): Promise<Itinerary> {
  let resolvedBrief = tripBrief;
  let lastIntent: TripBriefIntent | null = null;

  // LLM path: re-parse the raw brief through the model so preferences
  // ("foodie couple, 5 days, hate tourist buses") land as structured
  // regions/interests/avoidances instead of whatever the form defaults
  // produced. The deterministic assembly then runs on the LLM-merged brief.
  if (shouldUseLLM()) {
    try {
      const intent = await parseTripBriefIntent(tripBrief.rawBrief);
      resolvedBrief = intentToTripBrief(intent);
      lastIntent = intent;
    } catch (err) {
      // If the LLM fails (rate limit, validation, network), fall through
      // to the deterministic generator rather than failing the whole
      // request. Log so ops can see the degradation.
      // eslint-disable-next-line no-console
      console.warn(
        "[@repo/ai] LLM intent parse failed, falling back to deterministic:",
        err instanceof Error ? err.message : err
      );
    }
  }

  // Retrieval (Phase 3 step 2): rank candidate destinations against
  // the intent. When the LLM path produced an intent, retrieval
  // runs against that; otherwise it runs against the raw tripBrief
  // shaped as a minimal intent. The deterministic generator
  // continues to own itinerary assembly — retrieval only informs
  // future stages (the route layer can prefer higher-ranked stops
  // when sequencing days).
  const retrievalIntent: TripBriefIntent =
    lastIntent ?? {
      destinationCountry: tripBrief.destinationCountry,
      regions: tripBrief.regions,
      interests: tripBrief.interests,
      pace: tripBrief.pace,
      transportMode: tripBrief.transportMode,
      tripLengthDays: tripBrief.tripLengthDays,
      avoidances: tripBrief.avoidances,
      foodPreferences: tripBrief.foodPreferences,
      travelerType: tripBrief.travelerType,
      budgetLevel: tripBrief.budgetLevel,
      rawBrief: tripBrief.rawBrief,
      parseConfidence: 0.5
    };
  const retrieval = retrieveDestinations(retrievalIntent);
  // The retrieval result is not yet threaded into the generator
  // (that's Phase 3 step 3 — the routing layer). For now we expose
  // it as a console hint so the next phase has a single seam.
  if (retrieval.candidates.length === 0) {
    // eslint-disable-next-line no-console
    console.warn(
      "[@repo/ai] Retrieval returned no candidates for intent:",
      retrievalIntent.regions
    );
  }

  const itinerary = await generator.generate(resolvedBrief);
  return enrichItineraryWithCoords(itinerary, resolvedBrief);
}
