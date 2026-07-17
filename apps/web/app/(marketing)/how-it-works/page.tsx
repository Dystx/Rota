import * as React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Button, Icon, SectionHeading } from "@repo/ui";
import { EditorialProofRail } from "../_components/editorial-proof-rail";
import { EditorialChapterClose } from "../_components/editorial-chapter-close";
import { PublicRouteLayout } from "../../_components/public-route-layout";

export const metadata: Metadata = {
  title: "How Rumia works",
  description: "How Rumia turns the time you have into a judged, changeable Portugal activity day.",
  alternates: { canonical: "/how-it-works" }
};

const chapters = [
  {
    step: "time",
    number: "01",
    title: "Name the time you have",
    body: "Start with the place, the block of time, and the company already in front of you. Rumia begins with the day you can actually live, not a catalogue of everything nearby.",
    note: "A half day in Porto. A slow Lisbon evening. One weather window in the Douro.",
    accent: "Field note"
  },
  {
    step: "judgement",
    number: "02",
    title: "See the judgement",
    body: "Each suggestion stays specific about why it helps, what it costs, and when it is the wrong fit. The shortlist is editorial pressure, not a feed to scroll forever.",
    note: "Worth it, but only if the climbs still suit the rest of the day.",
    accent: "Editorial read"
  },
  {
    step: "control",
    number: "03",
    title: "Keep control of the chosen day",
    body: "Save, remove, and compare without losing the reason an activity was there. The day stays changeable as your energy, weather, or appetite shifts.",
    note: "Swap a queue-heavy stop for a slower museum hour without rebuilding the entire plan.",
    accent: "Traveller control"
  },
  {
    step: "review",
    number: "04",
    title: "Add a second look only when it helps",
    body: "A specialist review appears after a chosen day exists. It is there to pressure-test pace, transfers, and pairings, not to turn Rumia into a booking desk or live concierge.",
    note: "Review sharpens the same day you chose; it does not replace your judgement.",
    accent: "Optional review"
  }
] as const;

export default function HowItWorksPage() {
  return (
    <PublicRouteLayout scene="cover" surfaceTone="midnight" surfaceTexture="none" footerMode="compact">
      <div className="rumia-quiet-page rumia-how-route mx-auto grid max-w-6xl gap-20 px-6 py-16 lg:gap-32 lg:px-12 lg:py-24">
        <section className="rumia-how-cover" data-testid="how-sequence-cover">
          <div className="rumia-how-cover__copy">
            <SectionHeading
              eyebrow="A calm way to choose"
              title="From a time window to a day worth keeping."
              description="Rumia keeps the AI in the background and puts your judgement in the foreground."
              h1
            />
          </div>
          <ol className="rumia-how-cover__index" aria-label="How Rumia works in four chapters">
            {chapters.map((chapter) => (
              <li key={chapter.step}>
                <span>{chapter.number}</span>
                <strong>{chapter.step}</strong>
              </li>
            ))}
          </ol>
        </section>

        <EditorialProofRail
          items={[
            { label: "Starting point", value: "A time window, not a destination search." },
            { label: "Selection", value: "Reviewed activities with practical trade-offs." },
            { label: "Control", value: "Save, remove, or reorder without booking." }
          ]}
        />

        <ol className="rumia-how-sequence">
          {chapters.map((chapter, index) => (
            <li
              key={chapter.step}
              className={`rumia-how-chapter${index % 2 === 1 ? " rumia-how-chapter--reverse" : ""}`}
              data-step={chapter.step}
              data-testid="how-chapter"
            >
              <div className="rumia-how-chapter__media" aria-hidden="true">
                <p className="rumia-how-chapter__accent">{chapter.accent}</p>
                <p className="rumia-how-chapter__number">{chapter.number}</p>
                <p className="rumia-how-chapter__note">{chapter.note}</p>
              </div>
              <div className="rumia-how-chapter__body">
                <p className="font-metadata text-metadata uppercase tracking-[0.16em] text-ochre-dark">
                  {chapter.number}
                </p>
                <h2 className="mt-3 font-display text-3xl leading-tight text-primary md:text-4xl">
                  {chapter.title}
                </h2>
                <p className="mt-4 text-base leading-8 text-on-surface-variant">
                  {chapter.body}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <EditorialChapterClose
          ariaLabel="Start using Rumia"
          description="Tell Rumia about the time, mood, and company already in front of you. The result is a considered shortlist, not an automatic tour."
          kicker="Try the decision"
          testId="how-it-works-chapter-close"
          title="A better day starts with less noise."
        >
          <div className="rumia-chapter-close__actions">
            <Button asChild variant="secondary" tone="ochre">
              <Link href="/explore">Explore what to do <Icon name="arrow-right" /></Link>
            </Button>
            <Link className="rumia-chapter-close__secondary" href="/portugal">Read the Portugal guide</Link>
          </div>
        </EditorialChapterClose>
      </div>
    </PublicRouteLayout>
  );
}
