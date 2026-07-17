import * as React from "react";
import { Metadata } from "next";
import { LegalPage, type LegalSection } from "../_components/legal-page";

export const metadata: Metadata = {
  title: "Sustainability",
  description: "How Rumia thinks about sustainable travel in Portugal.",
  alternates: { canonical: "/sustainability" }
};

const SECTIONS: readonly LegalSection[] = [
  {
    id: "commitments",
    heading: "Commitments we can explain",
    content: (
      <>
        <figure
          className="overflow-hidden rounded-3xl border border-olive-light/20 bg-midnight"
          data-testid="sustainability-place-media"
          data-motion-policy="poster-only"
        >
          <img
            src="/media/unsplash/portugal-coast-golden-hour.jpg"
            alt="Golden light over the Portuguese coast, used as a still landscape for the sustainability promise."
            width={1600}
            height={1174}
            className="block aspect-[16/7] w-full object-cover"
          />
          <figcaption className="px-4 py-3 text-sm leading-6 text-linen/80">
            Place and pace are part of the decision, not a marketing badge.
          </figcaption>
        </figure>
        <p>
          Rumia can surface locally grounded activities and calmer ways to
          spend time in Portugal. We prefer context that helps people make
          thoughtful choices rather than encouraging a checklist of stops.
        </p>
      </>
    )
  },
  {
    id: "what-we-do-not-claim",
    heading: "What we do not claim",
    content: (
      <p>
        We do not claim that a recommendation is automatically sustainable.
        Conditions, operators, transport, and local impact change; travellers
        should check current information and choose the pace and route that
        fit their circumstances.
      </p>
    )
  }
];

export default function SustainabilityPage() {
  return (
    <LegalPage
      scene="cover"
      kicker="Our promise"
      title="Sustainability"
      intro="How Rumia thinks about place, people, and pace without making claims a recommendation cannot support."
      asideTitle="Context over checklists."
      asideText="The guide can help you choose a calmer, more locally grounded day, while leaving the final decision with you."
      asideHref="/portugal"
      asideLinkLabel="Explore Portugal"
      sections={SECTIONS}
    />
  );
}
