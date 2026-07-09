import { Metadata } from "next";
import { TopNav } from "../_components/top-nav";
import { SiteFooter } from "../_components/site-footer";
import { HeroMap } from "./hero-map";
import { BrandMark } from "@repo/ui";
import { HowItWorks } from "./_components/how-it-works";
import { DestinationBento } from "../_components/destination-bento";
import { HeroIntentCard } from "./_components/hero-intent-card";

export const metadata: Metadata = {
  title: "Discover Intentionally. | Rumia",
  description:
    "Portugal-first AI travel planning with cinematic detail. Tell us where, when, and how you travel — we handle the rest.",
  alternates: { canonical: "/" }
};

/**
 * Rumia landing page — 3-element hero (PR-A3).
 *   1. Headline  "Discover *Intentionally*."
 *   2. Subhead   "Portugal-first itineraries, plotted with care."
 *   3. Choice-led route starter → /planner
 */
export default function HomePage() {
  return (
    <div className="min-h-screen pt-header-height flex flex-col">
      <TopNav />

      <main className="flex-1" id="main-content">
        <section className="relative h-[60vh] min-h-[560px] md:h-[80vh] md:min-h-[720px] w-full flex flex-col justify-start items-center overflow-hidden bg-primary">
          <HeroMap initialProjection="globe" />

          <div
            aria-hidden
            className="absolute inset-0 z-[1] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 50% 0%, transparent 0%, rgba(12, 31, 22, 0.35) 65%, rgba(12, 31, 22, 0.7) 100%), radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.08) 0%, transparent 0.4%), radial-gradient(circle at 80% 60%, rgba(255, 255, 255, 0.06) 0%, transparent 0.4%)",
              backgroundSize: "auto, 800px 800px, 800px 800px",
            }}
          />
          <div
            className="absolute inset-x-0 top-0 h-1/2 md:h-1/3 bg-gradient-to-b from-primary/80 via-primary/40 to-transparent z-[1] pointer-events-none"
            aria-hidden="true"
          />

          <div className="absolute top-6 right-6 md:top-8 md:right-8 z-10">
            <BrandMark size="md" tone="dark" />
          </div>

          <div className="relative z-10 w-full max-w-4xl mx-auto px-container-padding-sm md:px-container-padding-lg pt-12 md:pt-20 flex flex-col items-center text-center gap-6">
            <h1
              data-testid="home-headline"
              className="font-display-mobile text-display-mobile md:font-display md:text-display text-linen-dark tracking-tight drop-shadow-2xl"
            >
              Discover <span className="italic text-ochre-light">Intentionally.</span>
            </h1>
            <p
              data-testid="home-value-prop"
              className="font-body-lg md:font-body-xl text-body-lg md:text-body-xl text-linen-dark/90 max-w-xl drop-shadow-md px-2"
            >
              Portugal-first itineraries, plotted with care.
            </p>
            <HeroIntentCard />
          </div>
        </section>

        <HowItWorks />
        <DestinationBento mode="plan" />
      </main>

      <SiteFooter />
    </div>
  );
}
