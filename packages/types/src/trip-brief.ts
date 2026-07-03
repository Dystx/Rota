import { z } from "zod";

/**
 * Phase 7 of the roadmap: the countries the platform supports
 * for trip planning. The roadmap targets Spain, Italy, France,
 * and Greece as the next expansion markets after Portugal.
 * Each country has its own region enum below; the TripBrief
 * schema branches on destinationCountry to pick the right
 * region set at validation time.
 */
export const destinationCountries = [
  "portugal",
  "spain",
  "italy",
  "france",
  "greece"
] as const;

export const portugalRegions = [
  "porto",
  "douro-valley",
  "lisbon",
  "sintra",
  "cascais",
  "alentejo",
  "algarve",
  "coimbra",
  "aveiro"
] as const;

export const spainRegions = [
  "barcelona",
  "madrid",
  "sevilla",
  "granada",
  "basque-country",
  "galicia",
  "ibiza",
  "mallorca",
  "tenerife"
] as const;

export const italyRegions = [
  "rome",
  "florence",
  "venice",
  "milan",
  "tuscany",
  "amalfi-coast",
  "sicily",
  "sardinia",
  "cinque-terre"
] as const;

export const franceRegions = [
  "paris",
  "provence",
  "french-riviera",
  "normandy",
  "loire-valley",
  "bordeaux",
  "chamonix",
  "alsace"
] as const;

export const greeceRegions = [
  "athens",
  "santorini",
  "mykonos",
  "crete",
  "rhodes",
  "corfu",
  "thessaloniki",
  "meteora"
] as const;

/**
 * Map a country to its supported region enum. Callers use this
 * to validate the regions[] field of a TripBrief against the
 * country at type-check time (via a discriminated union) and at
 * runtime (via a switch in the validator).
 */
export const regionsByCountry = {
  portugal: portugalRegions,
  spain: spainRegions,
  italy: italyRegions,
  france: franceRegions,
  greece: greeceRegions
} as const;

export type CountryRegions<C extends (typeof destinationCountries)[number]> =
  (typeof regionsByCountry)[C][number];
export const travelerTypes = ["solo", "couple", "family", "friends"] as const;
export const budgetLevels = ["budget", "mid-range", "premium"] as const;
export const paceOptions = ["calm", "balanced", "full"] as const;
export const interestOptions = [
  "local-food",
  "old-streets",
  "sea-views",
  "wine",
  "design-and-architecture",
  "nature",
  "family-friendly",
  "hidden-gems"
] as const;
export const foodPreferenceOptions = [
  "seafood",
  "wine-bars",
  "special-dinner",
  "casual-local-meals",
  "vegetarian-friendly"
] as const;
export const avoidanceOptions = [
  "tourist-heavy-stops",
  "rushed-schedules",
  "long-drives",
  "stairs-and-steep-walks",
  "late-nights"
] as const;
export const transportModes = ["no-car", "rental-car", "train-and-transfers"] as const;

export const TripBriefSchema = z
  .object({
    destinationCountry: z.enum(destinationCountries),
    // Phase 7: regions is now a union of every country's region
    // enum. The superRefine below enforces that the regions[]
    // values actually belong to the destinationCountry chosen,
    // so a Spain region can't be submitted under destinationCountry=portugal.
    regions: z
      .array(
        z.enum([
          ...portugalRegions,
          ...spainRegions,
          ...italyRegions,
          ...franceRegions,
          ...greeceRegions
        ])
      )
      .min(1, "Choose at least one region."),
    tripLengthDays: z.coerce
      .number({ invalid_type_error: "Trip length is required." })
      .int("Trip length must be a whole number.")
      .min(2, "Trip length should be at least 2 days.")
      .max(21, "Trip length should stay within 21 days for this MVP."),
    // ISO date format enforced so the `startDate < endDate`
    // comparison below compares apples to apples. A value like
    // "10/14/2024" would otherwise lex-compare against "2024-10-14"
    // and pass when it shouldn't.
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Use ISO date format YYYY-MM-DD.")
      .optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Use ISO date format YYYY-MM-DD.")
      .optional(),
    travelersCount: z.coerce
      .number({ invalid_type_error: "Number of travelers is required." })
      .int("Travelers must be a whole number.")
      .min(1, "At least one traveler is required.")
      .max(12, "For now, limit the brief to 12 travelers."),
    travelerType: z.enum(travelerTypes),
    budgetLevel: z.enum(budgetLevels),
    pace: z.enum(paceOptions),
    interests: z.array(z.enum(interestOptions)).min(1, "Pick at least one travel interest."),
    foodPreferences: z.array(z.enum(foodPreferenceOptions)).default([]),
    avoidances: z.array(z.enum(avoidanceOptions)).default([]),
    transportMode: z.enum(transportModes),
    accommodationLocation: z.string().max(120, "Keep the accommodation note under 120 characters.").default(""),
    rawBrief: z
      .string()
      .min(30, "Add a fuller brief so the route engine has enough context.")
      .max(1200, "Keep the free-text brief under 1200 characters.")
  })
  .superRefine((value, context) => {
    const hasStart = Boolean(value.startDate);
    const hasEnd = Boolean(value.endDate);

    if (hasStart !== hasEnd) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: [hasStart ? "endDate" : "startDate"],
        message: "Provide both dates or leave both blank and use trip length only."
      });
    }

    if (hasStart && hasEnd && value.endDate! < value.startDate!) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "End date must be the same as or later than start date."
      });
    }

    // Phase 7: every region in regions[] must belong to the
    // destinationCountry's region enum. A Spain region submitted
    // under destinationCountry=portugal would silently pass the
    // wider enum above; this superRefine catches the mismatch.
    const allowedRegions = new Set<string>(
      (regionsByCountry[value.destinationCountry] as readonly string[]) ?? []
    );
    value.regions.forEach((region, index) => {
      if (!allowedRegions.has(region)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["regions", index],
          message: `Region "${region}" is not in ${value.destinationCountry}'s supported region set.`
        });
      }
    });
  });

export type TripBrief = z.infer<typeof TripBriefSchema>;

export type TripBriefValidationErrors = z.inferFlattenedErrors<typeof TripBriefSchema>["fieldErrors"];
