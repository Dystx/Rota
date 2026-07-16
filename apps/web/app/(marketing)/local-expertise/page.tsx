import type { Metadata } from "next";
import Link from "next/link";
import {
  Button,
  Card,
  CardContent,
  EditorialHeading,
  EditorialRule,
} from "@repo/ui";
import { EditorialProofRail } from "../_components/editorial-proof-rail";
import { PublicRouteLayout } from "../../_components/public-route-layout";

export const metadata: Metadata = {
  title: "Local expertise",
  description: "How Portugal specialists review a saved activity day.",
  alternates: { canonical: "/local-expertise" }
};

const REVIEW_PILLARS = [
  {
    index: "01",
    title: "Pacing checked",
    description:
      "We look for days that are technically possible but tiring in practice, with enough room for a real pause."
  },
  {
    index: "02",
    title: "Context added",
    description:
      "We flag seasonal constraints, transfer friction, queues, and pairings that need more time or a calmer order."
  },
  {
    index: "03",
    title: "Boundaries clear",
    description:
      "Review does not include bookings, accommodation search, guarantees, or on-trip support."
  }
] as const;

export default function LocalExpertisePage() {
  return (
    <PublicRouteLayout scene="cover" surfaceTone="midnight" surfaceTexture="none" footerMode="full">
      <div className="mx-auto grid max-w-6xl gap-20 px-6 py-16 lg:gap-32 lg:px-12 lg:py-24">
      <EditorialHeading
        eyebrow="Local judgement"
        title="A second look at the day you chose."
        dek="You choose the activities first. When a saved day needs more context, a Portugal specialist can pressure-test its shape and explain the trade-offs."
      />

      <EditorialProofRail
        items={[
          { label: "Review begins", value: "After your chosen day has a shape." },
          { label: "Specialist lens", value: "Pace, transfers, seasonality, and pairings." },
          { label: "Boundary", value: "No booking, accommodation search, or on-trip support." }
        ]}
      />

      <section aria-labelledby="review-pillars" className="grid gap-8">
        <div className="grid gap-3 md:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] md:items-end">
          <p className="font-metadata text-metadata uppercase tracking-[0.16em] text-ochre-dark">
            What gets checked
          </p>
          <h2 id="review-pillars" className="max-w-2xl font-display text-3xl leading-tight tracking-tight text-primary md:text-4xl">
            Useful context, not a different trip.
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {REVIEW_PILLARS.map((pillar) => (
            <Card key={pillar.index} as="article" variant="outline" className="bg-white/45">
              <CardContent className="grid gap-6 p-6 md:min-h-[220px] md:p-7">
                <p className="font-mono-micro text-mono-micro tracking-[0.18em] text-ochre-dark">
                  {pillar.index}
                </p>
                <div className="grid gap-3">
                  <h3 className="font-display text-2xl leading-tight text-primary">
                    {pillar.title}
                  </h3>
                  <p className="text-base leading-relaxed text-on-surface-variant">
                    {pillar.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <EditorialRule />

      <section aria-labelledby="review-access" className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div className="grid max-w-2xl gap-3">
          <p className="font-metadata text-metadata uppercase tracking-[0.16em] text-ochre-dark">
            When it appears
          </p>
          <h2 id="review-access" className="font-display text-3xl leading-tight tracking-tight text-primary">
            Keep exploring before you decide.
          </h2>
          <p className="text-base leading-relaxed text-on-surface-variant">
            A review request is available only after the relevant chosen-day access is unlocked. Delivery timing and limits are shown before purchase.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Button asChild variant="secondary">
            <Link href="/pricing">See optional access</Link>
          </Button>
          <Link
            href="/explore"
            className="inline-flex min-h-11 items-center rounded-full px-2 text-sm font-medium text-primary underline-offset-4 hover:text-ochre-dark hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
          >
            Explore activities
          </Link>
        </div>
      </section>
      </div>
    </PublicRouteLayout>
  );
}
