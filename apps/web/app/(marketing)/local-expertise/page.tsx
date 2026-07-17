import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Button,
  EditorialHeading,
  EditorialRule
} from "@repo/ui";
import { PublicRouteLayout } from "../../_components/public-route-layout";

export const metadata: Metadata = {
  title: "Local expertise",
  description: "How Portugal specialists review a saved activity day.",
  alternates: { canonical: "/local-expertise" }
};

const REVIEW_CHECKS = [
  "Pacing that looks possible on paper but feels cramped in practice.",
  "Transfer friction, queues, and timing gaps between the activities you already saved.",
  "Seasonal or weather caveats that could make a good-looking day disappointing."
] as const;

const REVIEW_BOUNDARIES = [
  "No bookings, reservations, or accommodation search.",
  "No guarantee that a venue, queue, or weather window will behave perfectly.",
  "No live concierge or on-trip rescue once you are already moving through the day."
] as const;

export default function LocalExpertisePage() {
  return (
    <PublicRouteLayout scene="cover" surfaceTone="midnight" surfaceTexture="none" footerMode="full">
      <div className="rumia-local-expertise-page mx-auto grid max-w-6xl gap-20 px-6 py-16 lg:gap-32 lg:px-12 lg:py-24">
        <section className="rumia-local-expertise-hero" data-testid="local-expertise-evidence">
          <div className="grid gap-6">
            <EditorialHeading
              eyebrow="Local judgement"
              title="A second look at the day you chose."
              dek="You choose the activities first. When a saved day needs more context, a Portugal specialist can pressure-test its shape and explain the trade-offs."
            />
            <div className="grid gap-3 rounded-[24px] border border-white/10 bg-white/8 p-5 text-linen/78">
              <p className="font-metadata text-metadata uppercase tracking-[0.16em] text-ochre-light">
                Field-note evidence
              </p>
              <p className="text-base leading-8">
                Review starts from the exact activities you already selected, then checks whether the day still holds together once pace, transfers, and on-the-ground friction are taken seriously.
              </p>
            </div>
          </div>

          <figure className="rumia-local-expertise-still">
            <img
              src="/media/unsplash/portugal-coast-golden-hour.jpg"
              alt="Golden light over the Portuguese coast, used as a still image for the local expertise chapter."
              width={1600}
              height={1174}
            />
            <figcaption>Review clarifies a chosen day; it does not turn into a new itinerary brief.</figcaption>
          </figure>
        </section>

        <section aria-labelledby="review-checks" className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="grid gap-3">
            <p className="font-metadata text-metadata uppercase tracking-[0.16em] text-ochre-dark">
              Review lens
            </p>
            <h2 id="review-checks" className="font-display text-3xl leading-tight tracking-tight text-primary md:text-4xl">
              What reviewers check
            </h2>
          </div>
          <ul className="rumia-local-expertise-list grid gap-3 text-base leading-8 text-on-surface-variant">
            {REVIEW_CHECKS.map((item) => (
              <li key={item} className="rounded-[22px] border border-[var(--color-border)] bg-white/55 px-5 py-4">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <EditorialRule />

        <section className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="grid gap-3">
            <p className="font-metadata text-metadata uppercase tracking-[0.16em] text-ochre-dark">
              Boundary
            </p>
            <h2 className="font-display text-3xl leading-tight tracking-tight text-primary md:text-4xl">
              What they do not promise
            </h2>
          </div>
          <ul className="rumia-local-expertise-list grid gap-3 text-base leading-8 text-on-surface-variant">
            {REVIEW_BOUNDARIES.map((item) => (
              <li key={item} className="rounded-[22px] border border-[var(--color-border)] bg-white/55 px-5 py-4">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="rumia-local-expertise-turnaround grid gap-4 rounded-[28px] border border-ochre-dark/20 bg-ochre-light/10 p-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:p-8">
          <div className="grid max-w-2xl gap-3">
            <p className="font-metadata text-metadata uppercase tracking-[0.16em] text-ochre-dark">
              Turnaround
            </p>
            <h2 className="font-display text-3xl leading-tight tracking-tight text-primary">
              Most review requests return within 24 hours.
            </h2>
            <p className="text-base leading-8 text-on-surface-variant">
              Timing is shown before purchase because this is a bounded editorial pass, not a live support channel.
            </p>
          </div>
          <Button asChild variant="secondary">
            <Link href="/pricing">See review access</Link>
          </Button>
        </section>
      </div>
    </PublicRouteLayout>
  );
}
