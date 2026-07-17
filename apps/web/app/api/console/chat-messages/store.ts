import "server-only";

import { z } from "zod";
import { getAdminPageAuthContext, isAdminPageAuthContext, type AdminPageAuthContext } from "@/lib/auth/admin";
import { insertPostgresChatMessage, listPostgresChatMessages } from "@repo/db";

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
  rawInput: InsertChatMessageInput,
  authorizedAdmin?: AdminPageAuthContext
): Promise<InsertChatMessageResult> {
  const input = InsertPayloadSchema.parse(rawInput);
  const admin = authorizedAdmin ?? await getAdminPageAuthContext({ allCapabilities: ["operations:manage"] });
  if (!isAdminPageAuthContext(admin)) {
    throw new Error(
      `insertChatMessage requires an admin actor (got: ${admin.reason})`
    );
  }

  const row = await insertPostgresChatMessage(
    {
      conversationId: input.conversationId,
      authorRole: input.authorRole,
      body: input.body,
      sourceSnippetId: input.sourceSnippetId ?? null
    },
    admin.actor
  );
  return { id: row.id, createdAt: row.createdAt };
}

/**
 * Lists chat messages for a conversation, oldest first. The RLS
 * policy on chat_messages allows any authenticated user to read
 * all messages, so this works for both operator and traveler
 * callers.
 */
export async function listChatMessages(
  rawInput: ListChatMessagesInput,
  authorizedAdmin?: AdminPageAuthContext
): Promise<ChatMessageRow[]> {
  const input = ListPayloadSchema.parse(rawInput);
  const admin = authorizedAdmin ?? await getAdminPageAuthContext({ allCapabilities: ["operations:manage"] });
  if (!isAdminPageAuthContext(admin)) throw new Error(`listChatMessages requires an admin actor (got: ${admin.reason})`);
  const rows = await listPostgresChatMessages({ conversationId: input.conversationId, limit: input.limit }, admin.actor);
  return rows.map((row) => ({
    id: row.id,
    conversationId: row.conversationId,
    authorRole: row.authorRole,
    body: row.body,
    sourceSnippetId: row.sourceSnippetId,
    createdAt: row.createdAt
  }));
}
