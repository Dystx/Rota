import { Metadata } from "next";
import { PageShell, SectionHeading } from "@repo/ui";
import Link from "next/link";

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
      <PageShell bare>
        <SectionHeading
          eyebrow="The Journey"
          title="From free preview to expert polish"
          description="One clear ascension model: preview the route, unlock the itinerary, then add human judgment when it matters."
          h1={true}
        />
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
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
        <div className="mt-10">
          <Link href="/planner" className="inline-flex rounded-full bg-olive-light px-6 py-3 font-label-ui text-label-ui text-on-primary hover:bg-olive-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light">
            Plan a trip
          </Link>
        </div>
      </PageShell>
  );
}
