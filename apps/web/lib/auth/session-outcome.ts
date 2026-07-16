import "server-only";

import { cache } from "react";
import { getCurrentSession } from "./session";

type CurrentSession = Awaited<ReturnType<typeof getCurrentSession>>;

/**
 * The only session state that route entry points are allowed to branch on.
 * A provider/configuration failure is deliberately not represented as an
 * anonymous session: anonymous and unavailable have different next actions.
 */
export type SessionOutcome =
  | { kind: "ready"; session: NonNullable<CurrentSession> }
  | { kind: "anonymous" }
  | { kind: "unavailable" };

export type SessionEnvironment = Readonly<Record<string, string | undefined>>;

export type SessionOutcomeLoaderDependencies = {
  getSession: () => Promise<CurrentSession>;
  environment: SessionEnvironment;
  timeoutMs: number;
  cooldownMs: number;
  now?: () => number;
};

const knownProviderCodes = new Set([
  "ECONNREFUSED",
  "ECONNRESET",
  "ETIMEDOUT",
  "ENOTFOUND",
  "EAI_AGAIN",
  "ENETUNREACH",
  "EHOSTUNREACH",
  "EPIPE",
  "ERR_INVALID_URL",
  "57P01",
  "57P02",
  "57P03"
]);

function hasSessionConfiguration(environment: SessionEnvironment): boolean {
  return Boolean(environment.DATABASE_URL?.trim()) && (environment.BETTER_AUTH_SECRET?.length ?? 0) >= 32;
}

function isForcedPersistenceFailure(environment: SessionEnvironment): boolean {
  // The unavailable Playwright gate can exercise both failure modes without
  // touching a real provider. This is inert unless the explicitly test-only
  // environment switch is present and never reaches the rendered UI.
  return environment.PERSISTENCE_FAILURE_MODE === "missing-config" || environment.PERSISTENCE_FAILURE_MODE === "unreachable";
}

function providerCode(error: unknown, depth = 0): string | undefined {
  if (!error || typeof error !== "object" || depth > 4) return undefined;
  const ownCode = "code" in error && typeof error.code === "string" ? error.code : undefined;
  if (ownCode && knownProviderCodes.has(ownCode)) return ownCode;
  if ("cause" in error) return providerCode(error.cause, depth + 1) ?? ownCode;
  return ownCode;
}

/** Provider failures are safe to classify; arbitrary programming errors still reach the normal boundary. */
export function isSessionProviderFailure(error: unknown): boolean {
  const code = providerCode(error);
  return code ? knownProviderCodes.has(code) : false;
}

/**
 * Creates a bounded, single-flight web/auth probe.
 *
 * There is one underlying provider call and one deadline for all concurrent
 * callers. A timed-out provider remains in flight, so callers during the
 * cooldown cannot start another query or timer chain. The rejected provider
 * promise is always observed to avoid an unhandled rejection after a timeout.
 */
export function createSessionOutcomeLoader(dependencies: SessionOutcomeLoaderDependencies) {
  let probe: Promise<SessionOutcome> | null = null;
  let underlyingPending = false;
  let unavailableUntil = 0;
  const now = dependencies.now ?? Date.now;

  return async function loadSessionOutcome(): Promise<SessionOutcome> {
    if (isForcedPersistenceFailure(dependencies.environment) || !hasSessionConfiguration(dependencies.environment)) {
      return { kind: "unavailable" };
    }

    if (probe) return probe;
    if (underlyingPending || now() < unavailableUntil) {
      return { kind: "unavailable" };
    }

    underlyingPending = true;

    // Promise.resolve().then also converts a synchronous provider throw into
    // the same observed rejection path as an async provider failure.
    const underlying = Promise.resolve().then(() => dependencies.getSession());
    void underlying.finally(() => {
      underlyingPending = false;
    }).catch(() => undefined);

    let deadlineTimer: ReturnType<typeof setTimeout> | undefined;
    const deadline = new Promise<SessionOutcome>((resolve) => {
      deadlineTimer = setTimeout(() => {
        unavailableUntil = now() + dependencies.cooldownMs;
        resolve({ kind: "unavailable" });
      }, dependencies.timeoutMs);
    });

    probe = Promise.race([
      underlying.then((session) =>
        session ? ({ kind: "ready", session } as const) : ({ kind: "anonymous" } as const)
      ),
      deadline
    ])
      .catch((error) => {
        if (isSessionProviderFailure(error)) {
          unavailableUntil = now() + dependencies.cooldownMs;
          return { kind: "unavailable" } as const;
        }
        throw error;
      })
      .finally(() => {
        if (deadlineTimer) clearTimeout(deadlineTimer);
        probe = null;
      });

    return probe;
  };
}

/**
 * Resolve the session outcome inside React's request cache. The cache itself
 * is request-scoped, so the actual promise/result (including an unavailable
 * result) is reused by sequential and concurrent callers in one request while
 * another request starts with its own provider probe and state.
 */
const loadRequestSessionOutcome = cache(() =>
  createSessionOutcomeLoader({
    getSession: getCurrentSession,
    environment: process.env,
    timeoutMs: 4_000,
    cooldownMs: 30_000
  })()
);

export async function loadSessionOutcome(): Promise<SessionOutcome> {
  return loadRequestSessionOutcome();
}
