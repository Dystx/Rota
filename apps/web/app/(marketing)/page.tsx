import { Metadata } from "next";
import { TopNav } from "../_components/top-nav";
import { SiteFooter } from "../_components/site-footer";
import { DestinationBento } from "../_components/destination-bento";
import { HeroMap } from "./hero-map";
import { HeroIntentCard } from "./_components/hero-intent-card";
import { HowItWorks } from "./_components/how-it-works";

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
 *     the visual hero. The headline + value-proposition subtitle +
 *     an inline-editable intent card (destination / days / travel
 *     window) sit on a top scrim so the map is fully visible in
 *     the lower portion.
 *  3. HowItWorks — 3-step visual between hero and bento so a new
 *     user understands the flow before they commit.
 *  4. DestinationBento with dual CTAs (Plan this trip / View on map)
 *  5. SiteFooter
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
        <section className="relative h-[60vh] min-h-[560px] md:h-[80vh] md:min-h-[720px] w-full flex flex-col justify-start items-center overflow-hidden bg-primary">
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

          {/* Top-only directional scrim — keeps the headline
              readable without darkening the lower portion of
              the map. The 3D globe is fully visible below. On
              mobile the value-prop subtitle wraps to 3 lines
              and falls into the globe area, so the scrim is
              taller (h-1/2) and slightly stronger there. */}
          <div
            className="absolute inset-x-0 top-0 h-1/2 md:h-1/3 bg-gradient-to-b from-primary/80 via-primary/40 to-transparent z-[1] pointer-events-none"
            aria-hidden="true"
          />

          {/* Headline + value proposition — anchored at the top
              of the hero so the globe has room to spin below
              it. The user said the globe was being hidden by
              the card; moving the card to the bottom (below)
              keeps the globe fully visible. A one-sentence
              subtitle tells a new user what Rumia does — a
              critical fix for the "what is this?" first
              impression. */}
          <div className="relative z-10 w-full max-w-4xl mx-auto px-container-padding-sm md:px-container-padding-lg pt-10 md:pt-16 flex flex-col items-center text-center gap-4">
            <h1
              data-testid="home-headline"
              className="font-display-mobile text-display-mobile md:font-display md:text-display text-linen-dark tracking-tight drop-shadow-2xl"
            >
              Discover <span className="italic text-ochre-light">Intentionally.</span>
            </h1>
            <p
              data-testid="home-value-prop"
              className="font-body-lg md:font-body-xl text-body-lg md:text-body-xl text-linen-dark/90 max-w-2xl drop-shadow-md md:drop-shadow-none px-4 py-2 md:px-0 md:py-0 rounded-full md:rounded-none bg-primary/30 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none"
            >
              AI-crafted Portugal itineraries with cinematic detail. Tell us where, when, and how you travel — we handle the rest.
            </p>
          </div>

          {/* Intent card — anchored at the BOTTOM of the hero
              so the rotating globe stays fully visible above
              it. The card sits in a darker scrim zone so the
              white card reads as a clear surface. */}
          <div className="relative z-10 w-full max-w-4xl mx-auto px-container-padding-sm md:px-container-padding-lg pb-8 md:pb-12 mt-auto flex flex-col items-center">
            <HeroIntentCard />
          </div>
        </section>

        {/* Discovery Bento Grid — dual CTAs (Stitch 1.1 + 1.3
            pattern: 1 click to plan, 1 click to explore). */}
        <HowItWorks />
        <DestinationBento mode="plan" />
      </main>

      <SiteFooter />
    </div>
  );
}
