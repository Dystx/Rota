import "server-only";

import { z } from "zod";
import { getAdminPageAuthContext } from "@/lib/auth/admin";

const InsertPayloadSchema = z.object({
  conversationId: z.string().min(1).max(64),
  eventType: z.enum(["activity", "accommodation", "transfer", "dining"]),
  title: z.string().min(1).max(200),
  eventDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "eventDate must be YYYY-MM-DD"),
  eventTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "eventTime must be HH:MM"),
  internalNotes: z.string().max(2000).nullable(),
  createdBy: z.string().uuid(),
});

export type InsertItineraryEventInput = z.infer<typeof InsertPayloadSchema>;

export type InsertItineraryEventResult = {
  id: string;
  createdAt: string;
};

/**
 * Inserts a Push-to-Timeline event using the operator's admin
 * client. The RLS policy on the table allows admin role
 * members to insert, so we don't need the service-role client.
 */
export async function insertItineraryEvent(
  rawInput: InsertItineraryEventInput
): Promise<InsertItineraryEventResult> {
  const input = InsertPayloadSchema.parse(rawInput);
  const admin = await getAdminPageAuthContext();
  if (!("client" in admin)) {
    throw new Error(
      `insertItineraryEvent requires an admin actor (got: ${admin.reason})`
    );
  }

  const { data, error } = await admin.client
    .from("itinerary_events")
    .insert({
      conversation_id: input.conversationId,
      event_type: input.eventType,
      title: input.title,
      event_date: input.eventDate,
      event_time: input.eventTime,
      internal_notes: input.internalNotes,
      created_by: input.createdBy,
    })
    .select("id, created_at")
    .single();

  if (error) {
    throw new Error(`insertItineraryEvent failed: ${error.message}`);
  }

  return {
    id: (data as { id: string }).id,
    createdAt: (data as { created_at: string }).created_at,
  };
}
