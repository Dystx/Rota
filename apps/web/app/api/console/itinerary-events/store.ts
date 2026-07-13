import "server-only";

import { z } from "zod";
import { getAdminPageAuthContext, isAdminPageAuthContext } from "@/lib/auth/admin";
import { insertPostgresItineraryEvent, listPostgresItineraryEvents } from "@repo/db";

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

const ListPayloadSchema = z.object({
  conversationId: z.string().min(1).max(64),
  limit: z.number().int().min(1).max(100).default(20),
});

export type ListItineraryEventsInput = z.infer<typeof ListPayloadSchema>;

export type ItineraryEventRow = {
  id: string;
  conversationId: string;
  eventType: "activity" | "accommodation" | "transfer" | "dining";
  title: string;
  eventDate: string;
  eventTime: string;
  internalNotes: string | null;
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
  if (!isAdminPageAuthContext(admin)) {
    throw new Error(
      `insertItineraryEvent requires an admin actor (got: ${admin.reason})`
    );
  }

  const row = await insertPostgresItineraryEvent(input, admin.actor);
  return { id: row.id, createdAt: row.createdAt };
}

/**
 * Lists itinerary events for a conversation, newest first.
 * Used by the operator's "Recent pushes" panel on the
 * console/messages page so the operator can see what they
 * (or another operator) just pushed onto the timeline.
 */
export async function listItineraryEvents(
  rawInput: ListItineraryEventsInput
): Promise<ItineraryEventRow[]> {
  const input = ListPayloadSchema.parse(rawInput);
  const admin = await getAdminPageAuthContext();
  if (!isAdminPageAuthContext(admin)) throw new Error(`listItineraryEvents requires an admin actor (got: ${admin.reason})`);
  const rows = await listPostgresItineraryEvents({ conversationId: input.conversationId, limit: input.limit }, admin.actor);
  return rows.map((row) => ({
    id: row.id,
    conversationId: row.conversationId,
    eventType: row.eventType,
    title: row.title,
    eventDate: row.eventDate,
    eventTime: row.eventTime,
    internalNotes: row.internalNotes,
    createdAt: row.createdAt
  }));
}
