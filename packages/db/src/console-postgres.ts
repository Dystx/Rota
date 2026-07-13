import "server-only";

import { and, asc, desc, eq } from "drizzle-orm";

import { withActor, type DatabaseActor } from "./actor";
import { getDatabase } from "./connection";
import { chatMessages, itineraryEvents, organizations } from "./schema";

export type OrgBranding = { logoUrl?: string; primaryColor?: string; secondaryColor?: string };
export type PublicOrg = { id: string; name: string; slug: string; branding: OrgBranding };

function parseBranding(raw: unknown): OrgBranding {
  if (!raw || typeof raw !== "object") return {};
  const record = raw as Record<string, unknown>;
  return {
    ...(typeof record.logo_url === "string" ? { logoUrl: record.logo_url } : {}),
    ...(typeof record.primary_color === "string" ? { primaryColor: record.primary_color } : {}),
    ...(typeof record.secondary_color === "string" ? { secondaryColor: record.secondary_color } : {})
  };
}

export async function getPostgresOrgBySlug(slug: string): Promise<PublicOrg | null> {
  const [row] = await getDatabase().select().from(organizations).where(eq(organizations.slug, slug)).limit(1);
  if (!row?.slug) return null;
  return { id: row.id, name: row.name, slug: row.slug, branding: parseBranding(row.branding) };
}

export async function getPostgresOrgBranding(orgId: string): Promise<OrgBranding> {
  const [row] = await getDatabase().select({ branding: organizations.branding }).from(organizations).where(eq(organizations.id, orgId)).limit(1);
  return parseBranding(row?.branding);
}

export type PostgresItineraryEventInput = {
  conversationId: string;
  eventType: "activity" | "accommodation" | "transfer" | "dining";
  title: string;
  eventDate: string;
  eventTime: string;
  internalNotes: string | null;
  createdBy: string;
};

export type PostgresItineraryEvent = PostgresItineraryEventInput & { id: string; createdAt: string };

function parseEvent(row: typeof itineraryEvents.$inferSelect): PostgresItineraryEvent {
  return {
    id: row.id,
    conversationId: row.conversationId,
    eventType: row.eventType as PostgresItineraryEvent["eventType"],
    title: row.title,
    eventDate: row.eventDate,
    eventTime: row.eventTime,
    internalNotes: row.internalNotes,
    createdBy: row.createdBy,
    createdAt: row.createdAt.toISOString()
  };
}

export async function insertPostgresItineraryEvent(input: PostgresItineraryEventInput, actor: DatabaseActor): Promise<PostgresItineraryEvent> {
  return withActor(actor, async ({ db }) => {
    const [row] = await db
      .insert(itineraryEvents)
      .values({
        conversationId: input.conversationId,
        eventType: input.eventType,
        title: input.title,
        eventDate: input.eventDate,
        eventTime: input.eventTime,
        internalNotes: input.internalNotes,
        createdBy: actor.userId
      })
      .returning();
    if (!row) throw new Error("Failed to create itinerary event.");
    return parseEvent(row);
  });
}

export async function listPostgresItineraryEvents(input: { conversationId: string; limit: number }, actor: DatabaseActor): Promise<PostgresItineraryEvent[]> {
  const safeLimit = Math.max(1, Math.min(100, Math.trunc(input.limit)));
  return withActor(actor, async ({ db }) => {
    const rows = await db
      .select()
      .from(itineraryEvents)
      .where(eq(itineraryEvents.conversationId, input.conversationId))
      .orderBy(desc(itineraryEvents.eventDate), desc(itineraryEvents.eventTime))
      .limit(safeLimit);
    return rows.map(parseEvent);
  });
}

export type PostgresChatMessageInput = {
  conversationId: string;
  authorRole: "operator" | "traveler";
  body: string;
  sourceSnippetId: string | null;
};

export type PostgresChatMessage = PostgresChatMessageInput & { id: string; authorUserId: string | null; createdAt: string };

function parseMessage(row: typeof chatMessages.$inferSelect): PostgresChatMessage {
  return {
    id: row.id,
    conversationId: row.conversationId,
    authorRole: row.authorRole as PostgresChatMessage["authorRole"],
    authorUserId: row.authorUserId,
    body: row.body,
    sourceSnippetId: row.sourceSnippetId,
    createdAt: row.createdAt.toISOString()
  };
}

export async function insertPostgresChatMessage(input: PostgresChatMessageInput, actor: DatabaseActor): Promise<PostgresChatMessage> {
  return withActor(actor, async ({ db }) => {
    const [row] = await db
      .insert(chatMessages)
      .values({
        conversationId: input.conversationId,
        authorRole: input.authorRole,
        authorUserId: actor.userId,
        body: input.body,
        sourceSnippetId: input.sourceSnippetId
      })
      .returning();
    if (!row) throw new Error("Failed to create chat message.");
    return parseMessage(row);
  });
}

export async function listPostgresChatMessages(input: { conversationId: string; limit: number }, actor: DatabaseActor): Promise<PostgresChatMessage[]> {
  const safeLimit = Math.max(1, Math.min(200, Math.trunc(input.limit)));
  return withActor(actor, async ({ db }) => {
    const rows = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, input.conversationId))
      .orderBy(asc(chatMessages.createdAt))
      .limit(safeLimit);
    return rows.map(parseMessage);
  });
}
