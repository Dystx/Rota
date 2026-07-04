/**
 * Sentry init for the workers runtime.
 *
 * The workers entry (`src/index.ts`) imports this module
 * once at process boot; the SDK is a no-op when
 * `SENTRY_DSN` is unset, so local dev and CI without
 * secrets still pass. `withSentry` wraps a job in a
 * span so per-job traces land with the right name in
 * Sentry's performance view.
 *
 * The web app never imports this file: it imports
 * `buildWorkerPlan` from `@repo/workers/plan` (a
 * separate subpath that does not evaluate this barrel),
 * so the Sentry SDK never initializes in a Next.js
 * process.
 */

import * as Sentry from "@sentry/node";

const dsn = process.env.SENTRY_DSN;

let initialized = false;

export function initSentry(): void {
  if (!dsn || initialized) return;
  initialized = true;
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    environment:
      process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
    serverName: "rota-workers"
  });
}

export function withSentry<T>(label: string, fn: () => Promise<T>): Promise<T> {
  if (!dsn) return fn();
  return Sentry.startSpan({ name: label }, () => fn());
}

/** Wrap a synchronous try/catch boundary so an
 *  unexpected throw sends a Sentry event AND re-raises.
 *  Mirrors the shape of `tryCapture` in @repo/monitoring
 *  so a worker handler can swap one for the other. */
export function captureException(err: unknown): void {
  if (!dsn) return;
  Sentry.captureException(err);
}
