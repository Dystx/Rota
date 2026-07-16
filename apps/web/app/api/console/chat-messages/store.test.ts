import { beforeEach, describe, expect, test, vi } from "vitest";
import type { AdminPageAuthContext } from "@/lib/auth/admin";

const mocks = vi.hoisted(() => ({
  getAdminPageAuthContext: vi.fn(),
  insertPostgresChatMessage: vi.fn(),
  isAdminPageAuthContext: vi.fn(),
  listPostgresChatMessages: vi.fn()
}));

vi.mock("@/lib/auth/admin", () => ({
  getAdminPageAuthContext: mocks.getAdminPageAuthContext,
  isAdminPageAuthContext: mocks.isAdminPageAuthContext
}));
vi.mock("@repo/db", () => ({
  insertPostgresChatMessage: mocks.insertPostgresChatMessage,
  listPostgresChatMessages: mocks.listPostgresChatMessages
}));

import { insertChatMessage, listChatMessages } from "./store";

const actor = {
  capabilities: ["content:manage"],
  reviewerId: null,
  roles: ["admin"],
  userId: "admin-user-123"
} as const;
const admin = { actor, role: "admin", userId: actor.userId } satisfies AdminPageAuthContext;

describe("console chat message store", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.isAdminPageAuthContext.mockReturnValue(true);
  });

  test("does not reauthorize an API request that already has an admin context", async () => {
    mocks.insertPostgresChatMessage.mockResolvedValue({ id: "message-1", createdAt: "2026-07-16T00:00:00.000Z" });

    await expect(
      insertChatMessage(
        { conversationId: "conversation-1", body: "A local note", authorRole: "operator" },
        admin
      )
    ).resolves.toEqual({ id: "message-1", createdAt: "2026-07-16T00:00:00.000Z" });

    expect(mocks.getAdminPageAuthContext).not.toHaveBeenCalled();
    expect(mocks.insertPostgresChatMessage).toHaveBeenCalledWith(
      {
        conversationId: "conversation-1",
        authorRole: "operator",
        body: "A local note",
        sourceSnippetId: null
      },
      actor
    );
  });

  test("reuses the pre-authorized context for reads too", async () => {
    mocks.listPostgresChatMessages.mockResolvedValue([
      {
        id: "message-1",
        conversationId: "conversation-1",
        authorRole: "traveler",
        body: "A question",
        sourceSnippetId: null,
        createdAt: "2026-07-16T00:00:00.000Z"
      }
    ]);

    await expect(listChatMessages({ conversationId: "conversation-1", limit: 20 }, admin)).resolves.toEqual([
      {
        id: "message-1",
        conversationId: "conversation-1",
        authorRole: "traveler",
        body: "A question",
        sourceSnippetId: null,
        createdAt: "2026-07-16T00:00:00.000Z"
      }
    ]);
    expect(mocks.getAdminPageAuthContext).not.toHaveBeenCalled();
    expect(mocks.listPostgresChatMessages).toHaveBeenCalledWith({ conversationId: "conversation-1", limit: 20 }, actor);
  });
});
