import "server-only";

import { z } from "zod";
import { getAdminPageAuthContext } from "@/lib/auth/admin";

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
