import "server-only";

import { z } from "zod";
import { getAdminPageAuthContext } from "@/lib/auth/admin";
import type { RotaDataClient } from "@repo/db";

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
  client: z.custom<RotaDataClient>().optional()
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
  const client = input.client ?? (await resolveAdminClient());
  if (!client) {
    throw new Error(
      "listItineraryEvents requires an admin actor or explicit client"
    );
  }

  const { data, error } = await client
    .from("itinerary_events")
    .select(
      "id, conversation_id, event_type, title, event_date, event_time, internal_notes, created_at"
    )
    .eq("conversation_id", input.conversationId)
    .order("event_date", { ascending: false })
    .order("event_time", { ascending: false })
    .limit(input.limit);

  if (error) {
    throw new Error(`listItineraryEvents failed: ${error.message}`);
  }

  return ((data ?? []) as Array<{
    id: string;
    conversation_id: string;
    event_type: "activity" | "accommodation" | "transfer" | "dining";
    title: string;
    event_date: string;
    event_time: string;
    internal_notes: string | null;
    created_at: string;
  }>).map((row) => ({
    id: row.id,
    conversationId: row.conversation_id,
    eventType: row.event_type,
    title: row.title,
    eventDate: row.event_date,
    eventTime: row.event_time,
    internalNotes: row.internal_notes,
    createdAt: row.created_at
  }));
}

async function resolveAdminClient(): Promise<RotaDataClient | null> {
  const admin = await getAdminPageAuthContext();
  if (!("client" in admin)) {
    return null;
  }
  return admin.client;
}
