import * as React from "react";
import { Metadata } from "next";
import { HeroMap } from "./hero-map";
import { HowItWorks } from "./_components/how-it-works";
import { DestinationBento } from "../_components/destination-bento";
import { HeroIntentCard } from "./_components/hero-intent-card";
import { HeroEditorialFigure } from "./_components/hero-editorial-figure";
import { HeroEditorialMedia } from "./_components/hero-editorial-media";
import { PortugalEditorialChapter } from "./_components/portugal-editorial-chapter";
import { PublicRouteLayout } from "../_components/public-route-layout";

export const metadata: Metadata = {
  title: "What to do in Portugal, judged well",
  description:
    "A Portugal-first guide to activities genuinely worth your limited time.",
  alternates: { canonical: "/" }
};

/**
 * Rumia landing page: an activity situation is the first decision.
 * The atmospheric map remains a non-interactive backdrop; the phrase-led
 * activity composer is the meaningful task and routes to /explore.
 */
export default function HomePage() {
  return (
    <PublicRouteLayout scene="cover" surfaceTone="midnight" surfaceTexture="none" footerMode="full">
      <div className="rumia-public-home min-h-screen flex flex-col rumia-page-enter">
        <section className="relative w-full flex flex-col items-center justify-start overflow-visible bg-primary pb-12 md:h-[80vh] md:min-h-[720px] md:overflow-hidden md:pb-0">
          <HeroMap initialProjection="mercator" />
          <HeroEditorialMedia />

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

          <HeroEditorialFigure />

          <div className="relative z-10 w-full max-w-4xl mx-auto px-container-padding-sm md:px-container-padding-lg pt-12 md:pt-20 flex flex-col items-center text-center gap-6">
            <p className="font-mono-micro text-mono-micro uppercase tracking-[0.24em] text-ochre-light/90">
              Portugal / activity edition
            </p>
            <h1
              data-testid="home-headline"
              className="max-w-3xl text-balance font-display-mobile text-display-mobile md:font-display md:text-display text-linen-dark tracking-tight drop-shadow-2xl"
            >
              What is actually worth your time in <span className="italic text-ochre-light">Portugal?</span>
            </h1>
            <p
              data-testid="home-value-prop"
              className="max-w-lg font-body-lg md:font-body-xl text-body-lg md:text-body-xl text-linen-dark/90 drop-shadow-md px-2"
            >
              A small set of judged Portugal activities, with the timing and trade-offs that make a day work — not an endless list to research alone.
            </p>
            <HeroIntentCard />
          </div>

          <div
            data-testid="hero-proof-rail"
            className="pointer-events-none absolute bottom-6 left-6 z-10 hidden w-[52%] items-center justify-between gap-6 border-t border-linen-dark/20 pt-3 font-mono-micro text-mono-micro uppercase tracking-[0.16em] text-linen-dark/65 md:flex"
          >
            <span>Portugal-wide</span>
            <span>Activity first</span>
            <span>No paid ranking</span>
          </div>
        </section>

        <HowItWorks />
        <PortugalEditorialChapter />
        <DestinationBento mode="explore" />
      </div>
    </PublicRouteLayout>
  );
}
