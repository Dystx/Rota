import Link from "next/link";
import { Metadata } from "next";
import * as React from "react";
import { listCommerceProducts } from "@repo/payments";
import { Button, SectionHeading } from "@repo/ui";
import { EditorialProofRail } from "../_components/editorial-proof-rail";
import { PublicRouteLayout } from "../../_components/public-route-layout";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Optional Portugal activity-day upgrades with clear delivery and limits.",
  alternates: {
    canonical: "/pricing"
  }
};

export default function PricingPage() {
  const products = listCommerceProducts();

  return (
    <PublicRouteLayout scene="utility" surfaceTone="linen" surfaceTexture="none" footerMode="compact">
      <div className="rumia-quiet-page rumia-pricing-route mx-auto grid max-w-6xl gap-20 px-6 py-16 lg:gap-32 lg:px-12 lg:py-24">
        <SectionHeading
          eyebrow="Optional, after your chosen day"
          title="Keep the decisions yours."
          description="Rumia is useful before you pay: compare judged activities, shape a day, and keep the list. Optional upgrades only appear when a saved day is ready for a fuller export or a specialist review."
          h1={true}
        />

        <section className="rumia-pricing-ledger" aria-labelledby="pricing-ledger-title">
          <div className="rumia-pricing-ledger__copy">
            <div className="grid gap-2">
              <p className="font-mono-micro text-mono-micro uppercase tracking-[0.2em] text-ochre-dark">
                Utility ledger / optional access
              </p>
              <h2 id="pricing-ledger-title" className="max-w-2xl font-display text-3xl leading-tight text-primary md:text-4xl">
                Start free, then add only the part that sharpens the same day.
              </h2>
              <p className="max-w-2xl text-base leading-8 text-on-surface-variant">
                The still stays visible because the point is restraint: a chosen day should feel clearer before it costs anything.
              </p>
            </div>

            <section
              aria-label="Free activity-day preview — Included"
              className="rumia-pricing-free-preview"
              data-testid="pricing-free-preview"
            >
              <p className="font-metadata text-metadata uppercase tracking-[0.16em] text-ochre-light">
                Recommended
              </p>
              <div className="grid gap-3">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="font-display text-3xl text-linen">Free activity-day preview</h3>
                  <strong className="text-xl text-linen">€0</strong>
                </div>
                <p className="text-base leading-8 text-linen/78">
                  Review judged activities, compare trade-offs, and shape a day before you decide whether anything paid is useful.
                </p>
              </div>
              <Button asChild variant="secondary" tone="ochre" className="w-full sm:w-fit">
                <Link href="/explore">Start with the free preview</Link>
              </Button>
            </section>
          </div>

          <figure className="rumia-pricing-place" data-testid="pricing-place-image">
            <img
              src="/media/unsplash/douro-terraces.jpg"
              alt="Terraced vineyards descending toward the Douro River in northern Portugal."
              width={1600}
              height={996}
            />
            <figcaption>
              The image stays present because the free starting point should remain in the same first glance as the Portugal landscape it helps you judge.
            </figcaption>
          </figure>
        </section>

        <EditorialProofRail
          items={[
            { label: "Free first", value: "Explore and shape a day before payment." },
            { label: "Optional upgrades", value: "Export or specialist review only after a saved day." },
            { label: "Independent", value: "No bookings, accommodation search, or on-trip support." }
          ]}
        />

        <div className="rumia-pricing-tiers divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
          {products.map((product) => (
            <TierRow
              key={product.sku}
              status="optional"
              name={product.sku === "full_itinerary_v1" ? "Chosen-day export" : "Optional local review"}
              price={`€${product.unitAmountCents / 100}`}
              delivery={product.sku === "full_itinerary_v1" ? "A fuller saved-day version and export access after payment." : "A Portugal specialist checks pace, pairings, and practical context after export unlock."}
              limitation={product.sku === "full_itinerary_v1" ? "No bookings or accommodation search." : "Only available after the chosen day is unlocked; no bookings or on-trip concierge."}
              href={product.sku === "local_polish_v1" ? "/local-expertise" : "/planner"}
              action={product.sku === "local_polish_v1" ? "Review the boundaries" : "Unlock the export later"}
            />
          ))}
          <TierRow name="On-trip concierge" status="future" price="Waitlist" delivery="A future higher-touch program, not part of the current Rumia product." limitation="Not available to buy; no on-trip support is promised today." href="/support" action="Ask about future access" />
        </div>

      </div>
    </PublicRouteLayout>
  );
}

function TierRow({ name, status, price, delivery, limitation, href, action }: { name: string; status: "included" | "optional" | "future"; price: string; delivery: string; limitation: string; href: string; action: string }) {
  const statusLabel = status === "included" ? "Included" : status === "optional" ? "Optional" : "Future access";

  return (
    <section
      data-tier-state={status}
      aria-label={`${name} — ${statusLabel}`}
      className="rumia-tier-row grid gap-4 py-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
    >
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
            <p className="font-metadata text-metadata uppercase tracking-[0.16em] text-ochre-dark">
              {statusLabel}
            </p>
            <h2 className="font-display text-2xl text-primary">{name}</h2>
          </div>
          <strong className="text-lg text-primary">{price}</strong>
        </div>
        <p className="mt-2 text-base leading-7 text-on-surface-variant">{delivery}</p>
        <p className="mt-1 text-base leading-7 text-on-surface-variant">{limitation}</p>
      </div>
      <Button asChild variant="ghost">
        <Link href={href}>{action}</Link>
      </Button>
    </section>
  );
}
