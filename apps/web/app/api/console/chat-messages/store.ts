import "server-only";

import { z } from "zod";
import { getAdminPageAuthContext } from "@/lib/auth/admin";
import type { RotaDataClient } from "@repo/db";

const InsertPayloadSchema = z.object({
  conversationId: z.string().min(1).max(64),
  body: z.string().min(1).max(4000),
  sourceSnippetId: z.string().max(64).nullable().optional(),
  authorRole: z.enum(["operator", "traveler"]).default("operator"),
});

export type InsertChatMessageInput = z.input<typeof InsertPayloadSchema>;

export type InsertChatMessageResult = {
  id: string;
  createdAt: string;
};

const ListPayloadSchema = z.object({
  conversationId: z.string().min(1).max(64),
  limit: z.number().int().min(1).max(200).default(50),
  client: z.custom<RotaDataClient>().optional()
});

export type ListChatMessagesInput = z.infer<typeof ListPayloadSchema>;

export type ChatMessageRow = {
  id: string;
  conversationId: string;
  authorRole: "operator" | "traveler";
  body: string;
  sourceSnippetId: string | null;
  createdAt: string;
};

/**
 * Inserts a chat message from the console/messages composer. The
 * RLS policy on chat_messages allows any authenticated user to
 * insert; we still gate on the admin context so the API is only
 * callable from the console surface.
 */
export async function insertChatMessage(
  rawInput: InsertChatMessageInput
): Promise<InsertChatMessageResult> {
  const input = InsertPayloadSchema.parse(rawInput);
  const admin = await getAdminPageAuthContext();
  if (!("client" in admin)) {
    throw new Error(
      `insertChatMessage requires an admin actor (got: ${admin.reason})`
    );
  }

  const { data, error } = await admin.client
    .from("chat_messages")
    .insert({
      conversation_id: input.conversationId,
      author_role: input.authorRole,
      author_user_id: admin.userId,
      body: input.body,
      source_snippet_id: input.sourceSnippetId ?? null,
    })
    .select("id, created_at")
    .single();

  if (error) {
    throw new Error(`insertChatMessage failed: ${error.message}`);
  }

  return {
    id: (data as { id: string }).id,
    createdAt: (data as { created_at: string }).created_at,
  };
}

/**
 * Lists chat messages for a conversation, oldest first. The RLS
 * policy on chat_messages allows any authenticated user to read
 * all messages, so this works for both operator and traveler
 * callers.
 */
export async function listChatMessages(
  rawInput: ListChatMessagesInput
): Promise<ChatMessageRow[]> {
  const input = ListPayloadSchema.parse(rawInput);
  const client = input.client ?? (await resolveAdminClient());
  if (!client) {
    throw new Error("listChatMessages requires an admin actor or explicit client");
  }

  const { data, error } = await client
    .from("chat_messages")
    .select("id, conversation_id, author_role, body, source_snippet_id, created_at")
    .eq("conversation_id", input.conversationId)
    .order("created_at", { ascending: true })
    .limit(input.limit);

  if (error) {
    throw new Error(`listChatMessages failed: ${error.message}`);
  }

  return ((data ?? []) as Array<{
    id: string;
    conversation_id: string;
    author_role: "operator" | "traveler";
    body: string;
    source_snippet_id: string | null;
    created_at: string;
  }>).map((row) => ({
    id: row.id,
    conversationId: row.conversation_id,
    authorRole: row.author_role,
    body: row.body,
    sourceSnippetId: row.source_snippet_id,
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
