import * as React from "react";
import { Metadata } from "next";
import { RouteScene } from "../_components/route-scene";
import { HeroMap } from "./hero-map";
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

const COVER_HEIGHT = "h-[760px] md:h-[min(82vh,56rem)] md:min-h-[720px]";

/** The cover keeps its ambient map, poster, and contrast treatment in one media layer. */
function HomeCoverMedia() {
  return (
    <div
      data-testid="home-cover-media"
      className={`relative w-full ${COVER_HEIGHT} overflow-hidden bg-primary`}
    >
      <HeroMap initialProjection="mercator" />
      <HeroEditorialMedia />
      <div
        aria-hidden="true"
        data-testid="home-text-contrast-overlay"
        data-contrast-treatment="frame-independent"
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(12, 31, 22, 0.82) 0%, rgba(12, 31, 22, 0.3) 26%, rgba(12, 31, 22, 0.12) 52%, rgba(12, 31, 22, 0.76) 100%), radial-gradient(ellipse at 50% 0%, transparent 0%, rgba(12, 31, 22, 0.28) 64%, rgba(12, 31, 22, 0.65) 100%)"
        }}
      />
      <HeroEditorialFigure />
    </div>
  );
}

function HomeActivityBrief() {
  return (
    <div
      className={`relative z-10 mx-auto flex w-full max-w-4xl ${COVER_HEIGHT} flex-col items-center justify-start px-container-padding-sm pt-12 text-center md:px-container-padding-lg md:pt-20`}
      style={{ textShadow: "0 2px 24px rgba(4, 18, 11, 0.72)" }}
    >
      <p className="font-mono-micro text-mono-micro uppercase tracking-[0.24em] text-ochre-light/90">
        Portugal / activity edition
      </p>
      <h1
        data-testid="home-headline"
        className="mt-6 max-w-3xl text-balance font-display-mobile text-display-mobile md:font-display md:text-display text-linen-dark tracking-tight"
      >
        What is actually worth your time in <span className="italic text-ochre-light">Portugal?</span>
      </h1>
      <p
        data-testid="home-value-prop"
        className="mt-6 max-w-2xl px-2 font-body-lg text-body-lg text-linen-dark/95 md:font-body-xl md:text-body-xl"
      >
        A small set of judged Portugal activities, with the timing and trade-offs that make a day work — not an endless list to research alone.
      </p>
      <div
        data-testid="hero-proof-rail"
        className="pointer-events-none mt-auto mb-7 hidden w-full items-center justify-between gap-6 border-t border-linen-dark/25 pt-3 text-left font-mono-micro text-mono-micro uppercase tracking-[0.16em] text-linen-dark/70 md:flex"
      >
        <span>Portugal-wide</span>
        <span>Activity first</span>
        <span>No paid ranking</span>
      </div>
    </div>
  );
}

function HomeExploreAction() {
  return (
    <div
      data-testid="home-explore-action"
      data-cover-action="above-fold"
      className="relative z-10 mx-auto w-full max-w-4xl px-container-padding-sm pb-8 md:px-container-padding-lg md:pb-10"
    >
      <HeroIntentCard />
    </div>
  );
}

function HomeJudgementChapter() {
  const steps = [
    ["01", "Name the slice of time", "Place, time, mood, and who is with you."],
    ["02", "See the judgement", "A reviewed set with time costs and caveats."],
    ["03", "Keep a day in view", "Save what fits without losing the context."],
  ] as const;

  return (
    <div className="mx-auto w-full max-w-6xl px-container-padding-sm py-20 md:px-container-padding-lg md:py-28">
      <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_18rem] md:gap-16">
        <div>
          <p className="font-mono-micro text-mono-micro uppercase tracking-[0.2em] text-ochre-dark">
            How Rumia decides / 02
          </p>
          <h2 className="mt-5 max-w-3xl font-display text-4xl leading-[1.02] tracking-[-0.02em] text-primary md:text-6xl">
            A better day starts with a better choice.
          </h2>
        </div>
        <p className="max-w-xs text-base leading-7 text-on-surface-variant md:pt-10">
          From one honest activity situation to a day you can still change.
        </p>
      </div>
      <ol className="mt-14 grid gap-8 border-t border-primary/15 pt-8 md:grid-cols-3 md:gap-10">
        {steps.map(([number, title, body]) => (
          <li key={number} className="border-b border-primary/10 pb-8 md:border-b-0 md:pb-0">
            <p className="font-mono-technical text-sm tracking-[0.24em] text-ochre-dark">{number}</p>
            <h3 className="mt-5 font-headline-lg text-headline-lg leading-tight text-primary">{title}</h3>
            <p className="mt-3 max-w-xs text-base leading-7 text-on-surface-variant">{body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function HomeFieldNoteCopy() {
  return (
    <div className="relative z-10 mx-auto -mt-36 w-full max-w-7xl px-container-padding-sm pb-16 md:-mt-28 md:px-container-padding-lg md:pb-24">
      <div className="max-w-xl rounded-[1.5rem] border border-linen-dark/20 bg-midnight/70 px-6 py-6 text-linen-dark shadow-overlay backdrop-blur-md md:px-8 md:py-7">
        <p className="font-mono-micro text-mono-micro uppercase tracking-[0.2em] text-ochre-light">Field note / 03</p>
        <p className="mt-3 font-display text-3xl leading-tight md:text-4xl">Leave room for the light to change.</p>
        <p className="mt-3 max-w-md text-base leading-7 text-linen-dark/75">A generous day has edges. We help you choose what deserves the middle.</p>
      </div>
    </div>
  );
}

/**
 * Rumia landing page: an activity situation is the first decision.
 * The atmospheric map remains a non-interactive backdrop; the phrase-led
 * activity composer is the meaningful task and routes to /explore.
 */
export default function HomePage() {
  return (
    <PublicRouteLayout scene="cover" surfaceTone="midnight" surfaceTexture="none" footerMode="full">
      <div className="rumia-public-home min-h-screen flex flex-col rumia-page-enter overflow-x-clip">
        <RouteScene
          tone="cover"
          bleed="full"
          layout="overlay"
          focalLayer="media"
          data-testid="home-cover"
          data-above-fold="cover-brief-and-action"
          data-text-safe-zone="left-top-and-lower-center"
          className="min-h-[760px] overflow-hidden bg-primary md:min-h-[min(82vh,56rem)]"
          media={<HomeCoverMedia />}
          foreground={<HomeActivityBrief />}
          actions={<HomeExploreAction />}
        />

        <RouteScene
          tone="decision"
          bleed="contained"
          focalLayer="typography"
          data-testid="home-editorial-chapter"
          foreground={<HomeJudgementChapter />}
        />

        <RouteScene
          tone="cover"
          bleed="contained"
          focalLayer="media"
          data-testid="home-field-note-chapter"
          media={<PortugalEditorialChapter />}
          foreground={<HomeFieldNoteCopy />}
        />

        <RouteScene
          tone="atlas"
          bleed="contained"
          focalLayer="illustration"
          data-testid="home-atlas-chapter"
          foreground={<DestinationBento mode="explore" />}
        />
      </div>
    </PublicRouteLayout>
  );
}
