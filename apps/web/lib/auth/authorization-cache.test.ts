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
      let initialized = false;
      let result: unknown;
      return ((...args: Parameters<T>) => {
        if (!initialized) {
          initialized = true;
          result = fn(...args);
        }
        return result;
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

import { loadCurrentAuthorizedActorOutcome } from "./authorization";

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

  test("shares one actor probe for the reviewer/admin shell and child context", async () => {
    const first = await loadCurrentAuthorizedActorOutcome();
    const second = await loadCurrentAuthorizedActorOutcome();

    expect(first).toEqual(second);
    expect(mocks.loadSessionOutcome).toHaveBeenCalledOnce();
    expect(mocks.loadPostgresAuthorizationContext).toHaveBeenCalledOnce();
  });
});
