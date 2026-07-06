import Link from "next/link";
import { Metadata } from "next";
import { buildEmailPreview } from "@repo/emails";
import { getCheckoutPlan } from "@repo/payments";
import { Button, Card, CardContent, CardHeader, CardTitle, PageShell, SectionHeading, PricingCard, TestimonialCard, FeatureGrid, FeatureGridItem } from "@repo/ui";
import { getTripCommerceState } from "@/lib/trip-commerce";
import { TopNav } from "../../_components/top-nav";
import { SiteFooter } from "../../_components/site-footer";

export const metadata: Metadata = {
  title: "Human Review Trust Layer",
  description: "Add a premium human review layer to your AI-generated route for local notes, pace adjustments, and rain plans.",
  alternates: {
    canonical: "/human-review"
  }
};

export default function HumanReviewPage() {
  const reviewedTripState = getTripCommerceState({ isPaid: true, hasHumanReview: true });
  const reviewPlan = getCheckoutPlan("human-polish");
  const reviewEmail = buildEmailPreview("review-complete", "Porto & Douro / 5 days");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNav />
      <main
        id="main-content"
        className="flex-1 pt-header-height"
      >
      <PageShell bare>
        <SectionHeading
          eyebrow="Trust layer"
          title="Expert polish for your itinerary"
          description="Elevate your generated route with a premium human review. Our local Portugal specialists adjust pacing, swap restaurants, and add exclusive rain plans."
          h1={true}
        />

        <div className="mb-20">
          <FeatureGrid>
            <FeatureGridItem title="Route & Pacing Validation">
              We ensure your driving times are realistic and your daily schedule allows you to breathe. We fix overly ambitious AI routes before you hit the road.
            </FeatureGridItem>
            <FeatureGridItem title="Restaurant Curation">
              We swap generic recommendations for hard-to-find local favorites, hidden gems, and confirm their opening hours for your travel dates.
            </FeatureGridItem>
            <FeatureGridItem title="Rain Plans & Contingencies">
              We add backup plans for outdoor activities, ensuring your trip stays on track regardless of unexpected weather changes.
            </FeatureGridItem>
          </FeatureGrid>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <TestimonialCard author="Sofia Almeida" role="Lead Portugal Specialist">
              We don't just check the map—we visualize your entire day. If a restaurant is closed on Mondays or a coastal drive faces afternoon fog, we adjust the itinerary before you even arrive.
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
              title="Human Review Add-on"
              description="Available exclusively after unlocking your base trip."
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
      </main>
      <SiteFooter />
    </div>
  );
}
