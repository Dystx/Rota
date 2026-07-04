/**
 * Sentry edge runtime config. Loaded by `@sentry/nextjs`
 * for edge middleware and edge route handlers (Next.js
 * 16 ships these in a separate runtime from the Node
 * server actions). Same DSN precedence as the server
 * config; same no-op fallback when the env is unset.
 */
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.05,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development"
  });
}
