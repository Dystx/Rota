import { afterEach, describe, expect, it, vi } from "vitest";

import { createSessionOutcomeLoader } from "./session-outcome";

const validTestEnvironment = {
  DATABASE_URL: "postgresql://127.0.0.1:5432/rumia",
  BETTER_AUTH_SECRET: "test-secret-that-is-at-least-32-characters-long"
} as const;

describe("createSessionOutcomeLoader", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("distinguishes provider failure from an anonymous session", async () => {
    const outcome = createSessionOutcomeLoader({
      getSession: async () => {
        throw Object.assign(new Error("connection details should stay server-side"), { code: "ECONNREFUSED" });
      },
      environment: validTestEnvironment,
      timeoutMs: 4_000,
      cooldownMs: 30_000
    });

    await expect(outcome()).resolves.toEqual({ kind: "unavailable" });
  });

  it("keeps an empty session distinct from a provider outage", async () => {
    const getSession = vi.fn().mockResolvedValue(null);
    const outcome = createSessionOutcomeLoader({
      getSession,
      environment: validTestEnvironment,
      timeoutMs: 4_000,
      cooldownMs: 30_000
    });

    await expect(outcome()).resolves.toEqual({ kind: "anonymous" });
    expect(getSession).toHaveBeenCalledOnce();
  });

  it("shares one never-settling probe instead of accumulating queries", async () => {
    vi.useFakeTimers();
    const getSession = vi.fn(() => new Promise<never>(() => undefined));
    const load = createSessionOutcomeLoader({
      getSession,
      environment: validTestEnvironment,
      timeoutMs: 10,
      cooldownMs: 30_000
    });

    const pending = Promise.all(Array.from({ length: 20 }, () => load()));
    await vi.advanceTimersByTimeAsync(10);

    await expect(pending).resolves.toEqual(Array.from({ length: 20 }, () => ({ kind: "unavailable" })));
    expect(getSession).toHaveBeenCalledTimes(1);
  });

  it("does not start a second probe during the cooldown", async () => {
    vi.useFakeTimers();
    const getSession = vi.fn(() => new Promise<never>(() => undefined));
    const load = createSessionOutcomeLoader({
      getSession,
      environment: validTestEnvironment,
      timeoutMs: 10,
      cooldownMs: 30_000
    });

    const first = load();
    await vi.advanceTimersByTimeAsync(10);
    await expect(first).resolves.toEqual({ kind: "unavailable" });
    await expect(load()).resolves.toEqual({ kind: "unavailable" });
    expect(getSession).toHaveBeenCalledTimes(1);
  });

  it("fails closed when session configuration is absent without calling the provider", async () => {
    const getSession = vi.fn();
    const load = createSessionOutcomeLoader({
      getSession,
      environment: {},
      timeoutMs: 10,
      cooldownMs: 30_000
    });

    await expect(load()).resolves.toEqual({ kind: "unavailable" });
    expect(getSession).not.toHaveBeenCalled();
  });

  it("rethrows unknown programming failures for the normal segment boundary", async () => {
    const failure = new Error("unexpected programming failure");
    const load = createSessionOutcomeLoader({
      getSession: async () => {
        throw failure;
      },
      environment: validTestEnvironment,
      timeoutMs: 4_000,
      cooldownMs: 30_000
    });

    await expect(load()).rejects.toBe(failure);
  });
});
