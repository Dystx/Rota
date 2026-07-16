import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";

const testEnvironment = vi.hoisted(() => {
  const previous = {
    databaseUrl: process.env.DATABASE_URL,
    authSecret: process.env.BETTER_AUTH_SECRET
  };
  process.env.DATABASE_URL = "postgresql://127.0.0.1:5432/rumia";
  process.env.BETTER_AUTH_SECRET = "request-cache-test-secret-that-is-at-least-32-characters";
  return previous;
});

const requestContext = vi.hoisted(() => ({ current: "request-a" }));
const mocks = vi.hoisted(() => ({
  getSession: vi.fn()
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    cache: <T extends (...args: any[]) => unknown>(fn: T) => {
      const resultsByRequest = new Map<string, Map<string, unknown>>();
      return ((...args: Parameters<T>) => {
        const key = JSON.stringify(args);
        let results = resultsByRequest.get(requestContext.current);
        if (!results) {
          results = new Map<string, unknown>();
          resultsByRequest.set(requestContext.current, results);
        }
        if (!results.has(key)) results.set(key, fn(...args));
        return results.get(key);
      }) as T;
    }
  };
});
vi.mock("./session", () => ({ getCurrentSession: mocks.getSession }));

import { loadSessionOutcome } from "./session-outcome";

afterAll(() => {
  if (testEnvironment.databaseUrl === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = testEnvironment.databaseUrl;
  if (testEnvironment.authSecret === undefined) delete process.env.BETTER_AUTH_SECRET;
  else process.env.BETTER_AUTH_SECRET = testEnvironment.authSecret;
});

describe("loadSessionOutcome request isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requestContext.current = "request-a";
  });

  test("does not share a pending ready probe across request cache contexts", async () => {
    let resolveRequestA!: (session: unknown) => void;
    mocks.getSession
      .mockImplementationOnce(() => new Promise((resolve) => { resolveRequestA = resolve; }))
      .mockResolvedValueOnce({ user: { id: "user-b" }, session: { id: "session-b" } });

    const requestA = loadSessionOutcome();
    requestContext.current = "request-b";
    const requestB = loadSessionOutcome();

    await Promise.resolve();
    expect(mocks.getSession).toHaveBeenCalledTimes(2);
    resolveRequestA({ user: { id: "user-a" }, session: { id: "session-a" } });

    await expect(requestA).resolves.toMatchObject({ kind: "ready", session: { user: { id: "user-a" } } });
    await expect(requestB).resolves.toMatchObject({ kind: "ready", session: { user: { id: "user-b" } } });
  });

  test("keeps repeated calls single-flight inside one request context", async () => {
    mocks.getSession.mockResolvedValue({ user: { id: "user-a" }, session: { id: "session-a" } });

    const first = loadSessionOutcome();
    const second = loadSessionOutcome();

    await expect(Promise.all([first, second])).resolves.toEqual([
      { kind: "ready", session: { user: { id: "user-a" }, session: { id: "session-a" } } },
      { kind: "ready", session: { user: { id: "user-a" }, session: { id: "session-a" } } }
    ]);
    expect(mocks.getSession).toHaveBeenCalledOnce();
  });
});
