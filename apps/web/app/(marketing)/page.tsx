import { Metadata } from "next";
import { TopNav } from "../_components/top-nav";
import { SiteFooter } from "../_components/site-footer";
import { DestinationBento } from "../_components/destination-bento";
import { HeroMap } from "./hero-map";
import { HeroQuickStart } from "./_components/hero-quick-start";

export const metadata: Metadata = {
  title: "Discover Intentionally. | Rumia",
  description:
    "Portugal-first AI travel planning with cinematic itineraries, structured routes, and human-curated quality.",
  alternates: { canonical: "/" },
};

/**
 * Rumia landing page — Stitch 1.1 composition, 3D map adaptation.
 *
 * Five sections:
 *  1. TopNav (fixed glass-morphism navigation)
 *  2. Hero (60vh mobile / 80vh desktop) — full-bleed 3D globe as
 *     the visual hero. The 3D map replaces the 2D photo from the
 *     Stitch 1.1 reference but keeps the same composition: large
 *     headline overlay + scrim + (no intent card — the bento IS
 *     the form per the user's "1 click to begin" rule).
 *  3. HeroQuickStart — a single inline search above the bento for
 *     the 1-2-words path (Stitch 1.1 "type a place" alternative).
 *  4. DestinationBento with dual CTAs (Plan this trip / View on map)
 *  5. SiteFooter
 *
 * The 3D map fills the entire hero viewport. The headline + the
 * inline search sit in a directional top-only scrim so the map
 * is fully visible in the lower portion.
 */
export default function HomePage() {
  return (
    <div className="min-h-screen pt-header-height flex flex-col">
      <TopNav />

      <main className="flex-1" id="main-content">
        {/* Hero Section — full-bleed 3D map as the visual hero. */}
        <section className="relative h-[60vh] min-h-[480px] md:h-[80vh] md:min-h-[640px] w-full flex flex-col justify-start items-center overflow-hidden bg-primary">
          <HeroMap initialProjection="globe" />

          {/* Top-only directional scrim: keeps the headline readable
              without darkening the lower portion of the map. The
              3D map is fully visible below the scrim. */}
          <div
            className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-primary/55 via-primary/20 to-transparent z-[1] pointer-events-none"
            aria-hidden="true"
          />

          {/* Hero Content — headline only, anchored in the upper
              third. No intent card (the user removed it; the
              bento is the primary CTA below). */}
          <div className="relative z-10 w-full max-w-3xl mx-auto px-container-padding-sm md:px-container-padding-lg pt-10 md:pt-16 flex flex-col items-center text-center">
            <h1
              data-testid="home-headline"
              className="font-display-mobile text-display-mobile md:font-display md:text-display text-linen-dark mb-3 md:mb-4 tracking-tight drop-shadow-2xl"
            >
              Discover <span className="italic text-ochre-light">Intentionally.</span>
            </h1>
          </div>
        </section>

        {/* Quick-start search — 1 field, Enter to begin. Sits
            between the hero and the bento so the map is fully
            visible above and the bento is the primary CTA below. */}
        <HeroQuickStart />

        {/* Discovery Bento Grid — dual CTAs (Stitch 1.1 + 1.3
            pattern: 1 click to plan, 1 click to explore). */}
        <DestinationBento mode="plan" />
      </main>

      <SiteFooter />
    </div>
  );
}
