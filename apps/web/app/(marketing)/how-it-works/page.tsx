import * as React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { PageShell, SectionHeading } from "@repo/ui";
import { EditorialProofRail } from "../_components/editorial-proof-rail";

export const metadata: Metadata = {
  title: "How Rumia works",
  description: "How Rumia turns the time you have into a judged, changeable Portugal activity day.",
  alternates: { canonical: "/how-it-works" }
};

const steps = [
  ["Name the time you have", "Start with the place, time window, mood, and company already in front of you."],
  ["See the judgement", "Rumia shows a small reviewed set with time costs, caveats, and better alternatives."],
  ["Shape a day", "Save, remove, or reorder the activities that fit without losing the decision context."],
  ["Add local context", "If you want more confidence later, an optional specialist can pressure-test the saved day."]
];

export default function HowItWorksPage() {
  return (
    <PageShell bare>
      <SectionHeading
        eyebrow="A calm way to choose"
        title="From a time window to a day worth keeping."
        description="Rumia keeps the AI in the background and puts your judgement in the foreground."
        h1
      />
      <EditorialProofRail
        items={[
          { label: "Starting point", value: "A time window, not a destination search." },
          { label: "Selection", value: "Reviewed activities with practical trade-offs." },
          { label: "Control", value: "Save, remove, or reorder without booking." }
        ]}
      />
      <ol className="grid gap-8 md:grid-cols-4">
        {steps.map(([title, text], index) => (
          <li key={title} className="border-t border-[var(--color-border)] pt-4">
            <p className="text-sm text-ochre-dark">0{index + 1}</p>
            <h2 className="mt-3 font-display text-2xl text-primary">{title}</h2>
            <p className="mt-2 text-sm text-on-surface-variant">{text}</p>
          </li>
        ))}
      </ol>
      <Link
        href="/explore"
        className="mt-4 inline-block border-b border-ochre-dark text-ochre-dark"
      >
        Explore what to do
      </Link>
    </PageShell>
  );
}
