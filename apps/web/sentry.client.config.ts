/**
 * Sentry client config. Loaded automatically by
 * `@sentry/nextjs` when the browser boots. If no
 * `NEXT_PUBLIC_SENTRY_DSN` is set the SDK is a no-op,
 * so local dev / preview / Vercel preview environments
 * without secrets still ship a clean console.
 *
 * `tracesSampleRate: 0.1` keeps the bulk of traffic off
 * the Sentry ingest at the cost of a spikier signal.
 * Adjust once you have real volumes.
 */
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? "development"
  });
}
