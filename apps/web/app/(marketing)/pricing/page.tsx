import Link from "next/link";
import { Metadata } from "next";
import { listCheckoutPlans } from "@repo/payments";
import { Badge, Button, PageShell, SectionHeading, PricingCard } from "@repo/ui";
import { TopNav } from "../../_components/top-nav";
import { SiteFooter } from "../../_components/site-footer";

export const metadata: Metadata = {
  title: "Pricing & Unlock Tiers",
  description: "Simple one-time payments for your Portugal trip itinerary. Choose between free preview, paid unlock, and human review.",
  alternates: {
    canonical: "/pricing"
  }
};

export default function PricingPage() {
  const tiers = listCheckoutPlans();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNav />
      <main
        id="main-content"
        className="flex-1 pt-header-height"
      >
      <PageShell bare>
        <SectionHeading
          eyebrow="Unlock your itinerary"
          title="One-time payments, zero subscriptions"
          description="Experience the route preview for free, unlock full export capabilities when you're ready, and optionally add a dedicated local expert review."
          h1={true}
        />
        <div className="grid gap-8 lg:grid-cols-3">
          {tiers.map((tier, index) => (
            <PricingCard
              key={tier.tier}
              title={tier.tier.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
              highlighted={index === 1}
              highlightBadge={index === 1 ? <Badge>Recommended</Badge> : undefined}
              features={[
                ...tier.deliverables,
                index === 0 ? "Preview only; no export" : index === 1 ? "Immediate access after payment" : "One business day target; after unlock"
              ]}
              price={tier.priceLabel}
              fulfillment={tier.fulfillment}
              action={
                <Button asChild variant={index === 1 ? "primary" : "ghost"} className="w-full">
                  <Link href={index === 2 ? "/human-review" : "/planner"}>
                    {tier.ctaLabel}
                  </Link>
                </Button>
              }
            />
          ))}
        </div>
      </PageShell>
      </main>
      <SiteFooter />
    </div>
  );
}
