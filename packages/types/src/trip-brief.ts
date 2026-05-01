import { z } from "zod";

export const destinationCountries = ["portugal"] as const;
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
    regions: z.array(z.enum(portugalRegions)).min(1, "Choose at least one Portugal region."),
    tripLengthDays: z.coerce
      .number({ invalid_type_error: "Trip length is required." })
      .int("Trip length must be a whole number.")
      .min(2, "Trip length should be at least 2 days.")
      .max(21, "Trip length should stay within 21 days for this MVP."),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
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
  });

export type TripBrief = z.infer<typeof TripBriefSchema>;
