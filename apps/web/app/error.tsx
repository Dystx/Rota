"use client";

import { useEffect } from "react";
import Link from "next/link";
import { SiteFooter } from "./_components/site-footer";

/**
 * Root error boundary — catches unhandled errors in any route
 * group that doesn't define its own `error.tsx`. Replaces the
 * default Next.js error page with a Rumia-branded recovery surface
 * that explains what happened and offers the most likely next
 * actions (go home, retry, or plan a new trip).
 *
 * The `digest` property is Next.js's stable error id — surface
 * it in the UI so support can correlate a user report with a
 * server-side log entry.
 */
export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Hook left intentionally minimal — the actual error is already
    // logged by Next.js. Wiring a real telemetry sink (Sentry,
    // PostHog, etc.) would go here.
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("[Rumia error boundary]", error);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col rumia-surface rumia-surface-linen" data-surface="linen" data-surface-texture="editorial">
      <main id="main-content" className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-xl text-center">
          <p className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-dark mb-4">
            Something broke
          </p>
          <h1 className="font-display text-5xl md:text-6xl text-ink mb-6">
            We hit a <em className="text-ochre-dark not-italic">detour</em>.
          </h1>
          <p className="text-ink-soft text-lg mb-10 max-w-md mx-auto">
            The page didn&apos;t load as expected. Try again, or return to the activity guide and choose a different starting point.
          </p>

          {error.digest ? (
            <p className="font-mono text-xs text-ink-soft/60 mb-8">
              Reference: <code className="bg-white/60 px-1.5 py-0.5 rounded">{error.digest}</code>
            </p>
          ) : null}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-ink text-cream font-medium hover:bg-ink-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 transition-colors"
            >
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-olive-light/30 text-ink font-medium hover:bg-olive-light/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 transition-colors"
            >
              Back to home
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
