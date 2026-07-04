/**
 * Sentry server config. Loaded by `@sentry/nextjs` for
 * Node-runtime server actions and route handlers.
 *
 * DSN precedence: `SENTRY_DSN` (server-only secret) wins
 * over `NEXT_PUBLIC_SENTRY_DSN` so a Vercel server env
 * can use a more-permissioned project than the public
 * client DSN. If neither is set, the SDK is a no-op.
 */
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development"
  });
}
