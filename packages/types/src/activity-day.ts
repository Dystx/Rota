import { z } from "zod";

/**
 * Browser-safe chosen-activity input.
 *
 * This deliberately models the small, editable day a traveller has selected;
 * it is not an itinerary prompt and does not imply a persisted trip.
 */
export const ActivityDayTimeSchema = z.enum(["three-hours", "afternoon", "full-day"]);
export const ActivityDayTransportSchema = z.enum(["transit", "car"]);

export const ActivityDayDraftSchema = z.object({
  activityIds: z.array(z.string().min(1)).min(1),
  dayTime: ActivityDayTimeSchema,
  transport: ActivityDayTransportSchema
});

export type ActivityDayTime = z.infer<typeof ActivityDayTimeSchema>;
export type ActivityDayTransport = z.infer<typeof ActivityDayTransportSchema>;
export type ActivityDayDraft = z.infer<typeof ActivityDayDraftSchema>;
