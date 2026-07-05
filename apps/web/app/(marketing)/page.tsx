import { Metadata } from "next";
import { TopNav } from "../_components/top-nav";
import { SiteFooter } from "../_components/site-footer";
import { DestinationBento } from "../_components/destination-bento";
import { HeroMap } from "./hero-map";
import { HeroIntentCard } from "./_components/hero-intent-card";

export const metadata: Metadata = {
  title: "Discover Intentionally. | Rumia",
  description:
    "Portugal-first AI travel planning with cinematic itineraries, structured routes, and human-curated quality.",
  alternates: { canonical: "/" },
};

/**
 * Rumia landing page — Stitch 1.1 composition, 3D map adaptation.
 *
 * Four sections:
 *  1. TopNav (fixed glass-morphism navigation)
 *  2. Hero (60vh mobile / 80vh desktop) — full-bleed 3D globe as
 *     the visual hero. The headline + an inline-editable intent
 *     card (destination / days / travel window) sit on a top
 *     scrim so the map is fully visible in the lower portion.
 *  3. DestinationBento with dual CTAs (Plan this trip / View on map)
 *  4. SiteFooter
 *
 * The 3D map fills the entire hero viewport. The headline +
 * intent card sit in a directional top-only scrim so the map
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

          {/* Decorative starfield + radial vignette behind the
              hero — a subtle layer that adds depth without
              competing with the map. The vignette draws the
              eye to the center where the headline + card live;
              the starfield gives the off-map area some texture
              so the hero doesn't read as a flat rectangle. */}
          <div
            aria-hidden
            className="absolute inset-0 z-[1] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 50% 0%, transparent 0%, rgba(12, 31, 22, 0.35) 65%, rgba(12, 31, 22, 0.7) 100%), radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.08) 0%, transparent 0.4%), radial-gradient(circle at 80% 60%, rgba(255, 255, 255, 0.06) 0%, transparent 0.4%)",
              backgroundSize: "auto, 800px 800px, 800px 800px",
            }}
          />

          {/* Stronger top scrim — the previous h-1/2 with 55%
              opacity was leaving the headline half-readable against
              the map. Now the full hero has a layered scrim: a
              solid top-third fade for headline readability and a
              gentler bottom-third for the map. */}
          <div
            className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-primary/70 via-primary/40 to-transparent z-[1] pointer-events-none"
            aria-hidden="true"
          />

          {/* Hero Content — headline + inline-editable intent card
              anchored in the upper third. The card replaces the
              old search bar so the user can type their trip
              without leaving the map. */}
          <div className="relative z-10 w-full max-w-3xl mx-auto px-container-padding-sm md:px-container-padding-lg pt-10 md:pt-16 flex flex-col items-center text-center gap-6">
            <h1
              data-testid="home-headline"
              className="font-display-mobile text-display-mobile md:font-display md:text-display text-linen-dark tracking-tight drop-shadow-2xl"
            >
              Discover <span className="italic text-ochre-light">Intentionally.</span>
            </h1>
            <HeroIntentCard />
          </div>
        </section>

        {/* Discovery Bento Grid — dual CTAs (Stitch 1.1 + 1.3
            pattern: 1 click to plan, 1 click to explore). */}
        <DestinationBento mode="plan" />
      </main>

      <SiteFooter />
    </div>
  );
}
