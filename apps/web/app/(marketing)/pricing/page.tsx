import Link from "next/link";
import { Metadata } from "next";
import * as React from "react";
import { listCommerceProducts } from "@repo/payments";
import { Button, PageShell, SectionHeading } from "@repo/ui";

export const metadata: Metadata = {
  title: "Pricing | Rumia",
  description: "One-time Portugal trip planning upgrades with clear delivery and limits.",
  alternates: {
    canonical: "/pricing"
  }
};

export default function PricingPage() {
  const products = listCommerceProducts();

  return (
      <PageShell bare>
        <SectionHeading
          eyebrow="Simple, one-time upgrades"
          title="Choose the level of certainty you need."
          description="Start with a free route preview. Unlock the full itinerary when it feels right, then add local judgment if you want a specialist to check it."
          h1={true}
        />
        <div className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
          <TierRow name="Free preview" price="€0" delivery="A considered Portugal route preview." limitation="No full export or specialist review." href="/planner" action="Start a preview" />
          {products.map((product) => (
            <TierRow
              key={product.sku}
              name={product.label}
              price={`€${product.unitAmountCents / 100}`}
              delivery={product.delivery}
              limitation={product.limitations}
              href="/planner"
              action={product.sku === "local_polish_v1" ? "Plan then add review" : "Plan my route"}
            />
          ))}
          <TierRow name="Concierge & on-trip help" price="Waitlist" delivery="A future higher-touch program." limitation="Not available to buy yet." href="/support" action="Join concierge waitlist" />
        </div>
      </PageShell>
  );
}

function TierRow({ name, price, delivery, limitation, href, action }: { name: string; price: string; delivery: string; limitation: string; href: string; action: string }) {
  return <section className="grid gap-4 py-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"><div><div className="flex flex-wrap items-baseline justify-between gap-3"><h2 className="font-display text-2xl text-primary">{name}</h2><strong className="text-lg text-primary">{price}</strong></div><p className="mt-2 text-sm text-on-surface-variant">{delivery}</p><p className="mt-1 text-sm text-on-surface-variant">{limitation}</p></div><Button asChild variant="ghost"><Link href={href}>{action}</Link></Button></section>;
}
