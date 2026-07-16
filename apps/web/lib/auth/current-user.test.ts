import { describe, expect, it, vi } from "vitest";

const { loadSessionOutcome } = vi.hoisted(() => ({
  loadSessionOutcome: vi.fn()
}));

vi.mock("./session-outcome", () => ({ loadSessionOutcome }));

import { getCurrentUser } from "./current-user";

describe("getCurrentUser", () => {
  it("preserves a ready session outcome for page consumers", async () => {
    const sessionOutcome = {
      kind: "ready",
      session: {
        user: { id: "traveler-1", email: "traveler@example.test" },
        session: { id: "session-1" }
      }
    } as const;
    loadSessionOutcome.mockResolvedValue(sessionOutcome);

    await expect(getCurrentUser()).resolves.toEqual({
      outcome: "ready",
      sessionOutcome,
      user: { id: "traveler-1", email: "traveler@example.test" },
      session: { id: "session-1" }
    });
  });

  it("does not turn an unavailable probe into anonymous user data", async () => {
    loadSessionOutcome.mockResolvedValue({ kind: "unavailable" });

    await expect(getCurrentUser()).resolves.toEqual({
      outcome: "unavailable",
      sessionOutcome: { kind: "unavailable" },
      user: null,
      session: null
    });
  });
});

describe("getCurrentUserId", () => {
  it("preserves an unavailable session outcome", async () => {
    loadSessionOutcome.mockResolvedValue({ kind: "unavailable" });

    const { getCurrentUserId } = await import("./current-user");
    await expect(getCurrentUserId()).resolves.toEqual({ kind: "unavailable" });
  });

  it("distinguishes anonymous and ready user ids", async () => {
    const { getCurrentUserId } = await import("./current-user");
    loadSessionOutcome.mockResolvedValue({ kind: "anonymous" });
    await expect(getCurrentUserId()).resolves.toEqual({ kind: "anonymous" });

    loadSessionOutcome.mockResolvedValue({
      kind: "ready",
      session: { user: { id: "traveler-1" }, session: { id: "session-1" } }
    });
    await expect(getCurrentUserId()).resolves.toEqual({ kind: "ready", userId: "traveler-1" });
  });
});
