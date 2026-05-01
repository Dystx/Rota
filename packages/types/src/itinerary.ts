import { z } from "zod";

export const TripQuestionSchema = z.object({
  title: z.string(),
  question: z.string(),
  options: z.array(z.string()).min(2),
  allowsFreeAnswer: z.boolean().default(false)
});

export const TripStopSchema = z.object({
  placeName: z.string(),
  region: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  reason: z.string(),
  localTip: z.string(),
  warning: z.string().optional()
});

export const TripDaySchema = z.object({
  dayIndex: z.number().int().min(1),
  theme: z.string(),
  summary: z.string(),
  transportAssumption: z.string(),
  warnings: z.array(z.string()),
  stops: z.array(TripStopSchema).min(2)
});

export const ItinerarySchema = z.object({
  routeOverview: z.string(),
  whyThisFitsYou: z.array(z.string()).min(2),
  localNotes: z.array(z.string()).min(2),
  warnings: z.array(z.string()),
  confidenceScore: z.number().min(0).max(1),
  missingInfo: z.array(TripQuestionSchema),
  days: z.array(TripDaySchema).min(2)
});

export type TripQuestion = z.infer<typeof TripQuestionSchema>;
export type TripStop = z.infer<typeof TripStopSchema>;
export type TripDay = z.infer<typeof TripDaySchema>;
export type Itinerary = z.infer<typeof ItinerarySchema>;
