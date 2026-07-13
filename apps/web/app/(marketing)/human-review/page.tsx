import Link from "next/link";
import { Metadata } from "next";
import { buildEmailPreview } from "@repo/emails";
import { getCheckoutPlan } from "@repo/payments";
import { Button, Card, CardContent, CardHeader, CardTitle, PageShell, SectionHeading, PricingCard, TestimonialCard, FeatureGrid, FeatureGridItem } from "@repo/ui";
import { getTripCommerceState } from "@/lib/trip-commerce";

export const metadata: Metadata = {
  title: "Human Review Trust Layer",
  description: "Optional specialist context for a saved Portugal activity day.",
  alternates: {
    canonical: "/human-review"
  }
};

export default function HumanReviewPage() {
  const reviewedTripState = getTripCommerceState({ isPaid: true, hasHumanReview: true });
  const reviewPlan = getCheckoutPlan("human-polish");
  const reviewEmail = buildEmailPreview("review-complete", "Porto & Douro / 5 days");

  return (
      <PageShell bare>
        <SectionHeading
          eyebrow="Optional trust layer"
          title="A specialist can pressure-test the day."
          description="Rumia helps you choose activities first. If you later unlock a saved day, an optional Portugal specialist can check pacing, pairings, and practical context. This is not booking, concierge, or a guarantee."
          h1={true}
        />

        <section aria-labelledby="review-scope-heading" className="mb-20">
          <h2 id="review-scope-heading" className="sr-only">
            What a specialist checks
          </h2>
          <FeatureGrid>
            <FeatureGridItem title="Day shape checked">
              We look at the time you have, the effort between activities, and whether the day leaves room to breathe.
            </FeatureGridItem>
            <FeatureGridItem title="Pairings made practical">
              We can suggest nearby combinations and flag where opening hours, queues, or transfer friction need checking.
            </FeatureGridItem>
            <FeatureGridItem title="Fallbacks, when known">
              We add a practical weather or energy alternative where the reviewed activity set supports it; no bookings or guarantees are included.
            </FeatureGridItem>
          </FeatureGrid>
        </section>

        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <TestimonialCard author="Sofia Almeida" role="Lead Portugal Specialist">
              We check the shape of your days and suggest realistic local adjustments before you travel.
            </TestimonialCard>

            <Card className="bg-linen-dark">
              <CardHeader>
                <CardTitle>Delivery Email Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-base font-semibold text-on-background">{reviewEmail.subject}</div>
                <div className="mt-2 text-sm leading-relaxed text-olive-light">{reviewEmail.previewText}</div>
              </CardContent>
            </Card>
          </div>

          <div>
            <PricingCard
              title="Optional local review"
              description="Available only after a chosen day is unlocked."
              price={reviewPlan.priceLabel}
              fulfillment={reviewPlan.fulfillment}
              features={reviewedTripState.markers}
              highlighted={true}
              action={
                <Button asChild className="w-full" variant="primary">
                  <Link href="/pricing">See unlock tiers</Link>
                </Button>
              }
            />
          </div>
        </div>
      </PageShell>
  );
}
