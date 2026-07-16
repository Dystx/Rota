import { beforeEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  loadPostgresAuthorizationContext: vi.fn(),
  loadSessionOutcome: vi.fn()
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    cache: <T extends (...args: any[]) => unknown>(fn: T) => {
      const results = new Map<string, unknown>();
      return ((...args: Parameters<T>) => {
        const key = JSON.stringify(args);
        if (!results.has(key)) {
          results.set(key, fn(...args));
        }
        return results.get(key);
      }) as T;
    }
  };
});

vi.mock("./session-outcome", async () => {
  const actual = await vi.importActual<typeof import("./session-outcome")>("./session-outcome");
  return { ...actual, loadSessionOutcome: mocks.loadSessionOutcome };
});
vi.mock("@repo/db", () => ({
  isPersistenceConfigError: vi.fn(() => false),
  loadPostgresAuthorizationContext: mocks.loadPostgresAuthorizationContext
}));

import { loadCurrentAuthorizedActor, loadCurrentAuthorizedActorOutcome } from "./authorization";

describe("request-scoped authorization outcome", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.loadSessionOutcome.mockResolvedValue({
      kind: "ready",
      session: { user: { id: "admin-user-123" }, session: { id: "session-1" } }
    });
    mocks.loadPostgresAuthorizationContext.mockResolvedValue({
      capabilities: ["content:manage"],
      reviewerId: null,
      roles: ["admin"],
      userId: "admin-user-123"
    });
  });

  test("shares one actor probe between the layout and child auth context", async () => {
    const first = await loadCurrentAuthorizedActorOutcome();
    const second = await loadCurrentAuthorizedActor();

    expect(first).toEqual(second);
    expect(mocks.loadSessionOutcome).toHaveBeenCalledOnce();
    expect(mocks.loadPostgresAuthorizationContext).toHaveBeenCalledOnce();
  });
});
