import { Metadata } from "next";
import { PageShell, SectionHeading } from "@repo/ui";
import { TopNav } from "../../_components/top-nav";
import { SiteFooter } from "../../_components/site-footer";

export const metadata: Metadata = {
  title: "How It Works | Portugal Travel Concierge",
  description: "Learn how rumia.pt transforms your trip prompt into a validated, cinematic Portugal itinerary.",
  alternates: {
    canonical: "/how-it-works"
  }
};

const flow = [
  {
    title: "1. Free preview",
    description: "Choose a destination and pace. See a useful route preview at €0, with no card and no full export."
  },
  {
    title: "2. Itinerary unlock",
    description: "Unlock the complete day-by-day route and exports for €19. It is a one-time payment, delivered immediately."
  },
  {
    title: "3. Expert polish",
    description: "After unlock, add a local specialist review for €49. Expect practical pacing, food, and weather adjustments within one business day."
  },
  {
    title: "4. Travel with limits clear",
    description: "Recommendations are not bookings. Confirm opening hours, transport, visas, and insurance yourself."
  }
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNav />
      <main
        id="main-content"
        className="flex-1 pt-header-height"
      >
      <PageShell bare>
        <SectionHeading
          eyebrow="The Journey"
          title="From free preview to expert polish"
          description="One clear ascension model: preview the route, unlock the itinerary, then add human judgment when it matters."
          h1={true}
        />
        {/* 5-step flow rendered as a 1-up / 2-up / 5-up grid so all
            steps sit on one row at desktop width. This avoids the
            awkward 3+2 left-aligned bottom row that the shared
            FeatureGrid (lg:grid-cols-3) produced for 5 items. */}
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
          {flow.map((step) => (
            <li key={step.title} className="flex flex-col gap-3">
              <h3 className="font-display text-xl font-medium tracking-tight text-[var(--color-foreground)]">
                {step.title}
              </h3>
              <p className="text-base leading-relaxed text-[var(--color-muted-foreground)]">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </PageShell>
      </main>
      <SiteFooter />
    </div>
  );
}
