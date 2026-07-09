import Link from "next/link";
import { BrandMark } from "@repo/ui";
import { SiteFooter } from "./_components/site-footer";

/**
 * not-found.tsx — global 404 page.
 *
 * Triggered when `notFound()` is called from a server component or
 * when the user navigates to a route that doesn't exist. Replaces
 * the default Next.js 404 with a Rumia-branded page that:
 *
 *   1. Carries the brand mark above the headline (PR-A4: every
 *      empty surface wears the azulejo).
 *   2. Reads the "lost traveller" framing — "off the map" /
 *      "we haven't charted this route yet" — from the design-pass
 *      warm-voice decision.
 *   3. Offers the two most likely next actions: back to home,
 *      or start a new trip.
 *
 * Auth-gated routes (/admin, /reviewer) redirect to /sign-in from
 * their layouts, so this page only handles genuinely-missing routes.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <main
        id="main-content"
        className="flex-1 flex items-center justify-center px-6 py-16"
      >
        <div className="max-w-xl text-center flex flex-col items-center gap-6">
          <BrandMark size="md" tone="light" />

          <p className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-dark">
            404 — off the map
          </p>
          <h1 className="font-display-mobile text-4xl md:font-display md:text-5xl text-ink">
            We haven&apos;t charted this <em className="text-ochre-dark not-italic">route</em> yet.
          </h1>
          <p className="text-ink-soft text-lg max-w-md">
            The page you&apos;re looking for either moved, expired, or
            was never part of this itinerary. Let&apos;s get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-ink text-cream font-medium hover:bg-ink-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 transition-colors"
            >
              Back to home
              <span aria-hidden className="ph ph-arrow-right text-[1.1em]" />
            </Link>
            <Link
              href="/plan"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-olive-light/40 text-olive-dark hover:bg-olive-light/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
            >
              Plan a trip
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
