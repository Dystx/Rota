import { Metadata } from "next";
import { Badge, Button, PageShell, SectionHeading, PricingCard, FeatureGrid, FeatureGridItem, TestimonialCard } from "@repo/ui";
import { listCheckoutPlans } from "@repo/payments";

export const metadata: Metadata = {
  title: "T16 Demo",
  description: "Test page for T16 components",
};

export default function TestT16Page() {
  const tiers = listCheckoutPlans();

  return (
    <PageShell>
      <SectionHeading
        eyebrow="T16 Demo"
        title="Cinematic Concierge Components"
        description="Testing PricingCard, FeatureGrid, and TestimonialCard."
        h1={true}
      />
      
      <div className="py-12">
        <h2 className="mb-8 font-[family-name:var(--font-rota-display)] text-3xl">Feature Grid</h2>
        <FeatureGrid>
          <FeatureGridItem title="Expert Curation" icon={<span>✨</span>}>
            Our specialists handpick every hotel and restaurant to ensure an unforgettable experience.
          </FeatureGridItem>
          <FeatureGridItem title="Seamless Logistics" icon={<span>🚗</span>}>
            From airport transfers to train tickets, every detail is orchestrated for your comfort.
          </FeatureGridItem>
          <FeatureGridItem title="Local Access" icon={<span>🍷</span>}>
            Exclusive reservations and experiences you won't find in typical guidebooks.
          </FeatureGridItem>
        </FeatureGrid>
      </div>

      <div className="py-12">
        <h2 className="mb-8 font-[family-name:var(--font-rota-display)] text-3xl">Testimonial Card</h2>
        <div className="max-w-2xl">
          <TestimonialCard author="Elena Rostova" role="Honeymoon Traveler">
            The itinerary was nothing short of perfection. Every detail felt personal, and the pacing was flawless. It truly felt like having a local friend guiding us.
          </TestimonialCard>
        </div>
      </div>

      <div className="py-12">
        <h2 className="mb-8 font-[family-name:var(--font-rota-display)] text-3xl">Pricing Cards</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {tiers.map((tier, index) => (
            <PricingCard
              key={tier.tier}
              title={tier.tier.replace(/-/g, " ")}
              price={tier.priceLabel}
              fulfillment={tier.fulfillment}
              features={tier.deliverables}
              highlighted={index === 1}
              highlightBadge={index === 1 ? <Badge>Most Popular</Badge> : undefined}
              action={<Button variant={index === 1 ? "primary" : "ghost"} className="w-full">{tier.ctaLabel}</Button>}
            />
          ))}
        </div>
      </div>
    </PageShell>
  );
}
