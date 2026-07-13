import Link from "next/link";
import { Metadata } from "next";
import * as React from "react";
import { listCommerceProducts } from "@repo/payments";
import { Button, PageShell, SectionHeading } from "@repo/ui";
import { EditorialProofRail } from "../_components/editorial-proof-rail";

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
      <PageShell bare>
        <SectionHeading
          eyebrow="Optional, after your chosen day"
          title="Keep the decisions yours."
          description="Rumia is useful before you pay: compare judged activities, shape a day, and keep the list. Optional upgrades only appear when a saved day is ready for a fuller export or a specialist review."
          h1={true}
        />
        <EditorialProofRail
          items={[
            { label: "Free first", value: "Explore and shape a day before payment." },
            { label: "Optional upgrades", value: "Export or specialist review only after a saved day." },
            { label: "Independent", value: "No bookings, accommodation search, or on-trip support." }
          ]}
        />
        <div className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
          <TierRow name="Free activity-day preview" status="included" price="€0" delivery="Reviewed activities, practical context, and a day you can keep changing." limitation="No booking, reservation, or specialist review is implied." href="/explore" action="Explore what to do" />
          {products.map((product) => (
            <TierRow
              key={product.sku}
              status="optional"
              name={product.sku === "full_itinerary_v1" ? "Chosen-day export" : "Optional local review"}
              price={`€${product.unitAmountCents / 100}`}
              delivery={product.sku === "full_itinerary_v1" ? "A fuller saved-day version and export access after payment." : "A Portugal specialist checks pace, pairings, and practical context after export unlock."}
              limitation={product.sku === "full_itinerary_v1" ? "No bookings or accommodation search." : "Only available after the chosen day is unlocked; no bookings or on-trip concierge."}
              href={product.sku === "local_polish_v1" ? "/local-expertise" : "/planner"}
              action={product.sku === "local_polish_v1" ? "Review the boundaries" : "Shape a chosen day"}
            />
          ))}
          <TierRow name="On-trip concierge" status="future" price="Waitlist" delivery="A future higher-touch program, not part of the current Rumia product." limitation="Not available to buy; no on-trip support is promised today." href="/support" action="Ask about future access" />
        </div>
      </PageShell>
  );
}

function TierRow({ name, status, price, delivery, limitation, href, action }: { name: string; status: "included" | "optional" | "future"; price: string; delivery: string; limitation: string; href: string; action: string }) {
  const statusLabel = status === "included" ? "Included" : status === "optional" ? "Optional" : "Future access";

  return (
    <section
      data-tier-state={status}
      aria-label={`${name} — ${statusLabel}`}
      className="grid gap-4 py-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
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
        <p className="mt-2 text-sm text-on-surface-variant">{delivery}</p>
        <p className="mt-1 text-sm text-on-surface-variant">{limitation}</p>
      </div>
      <Button asChild variant="ghost">
        <Link href={href}>{action}</Link>
      </Button>
    </section>
  );
}
