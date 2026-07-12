import Link from "next/link";
import type { Metadata } from "next";
import {
  Button,
  EditorialHeading,
  EditorialRule
} from "@repo/ui";

export const metadata: Metadata = {
  title: "Support",
  description: "Find the next useful step in your Rumia activity-curation journey.",
  alternates: { canonical: "/support" }
};

const TOPICS = [
  {
    title: "Choose activities",
    text: "Start with the time, mood, and company you already have in mind.",
    href: "/explore"
  },
  {
    title: "Shape a saved day",
    text: "Review, remove, or keep exploring before you commit to a day.",
    href: "/explore/workspace"
  },
  {
    title: "Payment and access",
    text: "Review optional chosen-day access, payment status, and what each tier unlocks.",
    href: "/pricing"
  },
  {
    title: "Exports and saved days",
    text: "Open your saved days and find available export controls after access is confirmed.",
    href: "/itineraries"
  },
  {
    title: "Share or give feedback",
    text: "Copy a chosen-day link or tell us what was genuinely useful.",
    href: "/feedback"
  },
  {
    title: "Optional local review",
    text: "Understand the boundary of specialist context before you unlock it.",
    href: "/local-expertise"
  },
  {
    title: "Account access",
    text: "Use a private email link to return to your saved work.",
    href: "/sign-in"
  }
] as const;

export default function SupportPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-6 py-12 lg:gap-16 lg:px-12 lg:py-20">
      <EditorialHeading
        eyebrow="Support"
        title="Find the next useful step."
        dek="Rumia is built around one calm decision at a time. Choose the part of your activity-curation journey that needs attention."
      />

      <section aria-labelledby="support-start" className="grid gap-6 rounded-[28px] border border-ochre-dark/20 bg-ochre-light/10 p-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-8">
        <div className="grid max-w-2xl gap-2">
          <p className="font-metadata text-metadata uppercase tracking-[0.16em] text-ochre-dark">
            Start here
          </p>
          <h2 id="support-start" className="font-display text-3xl leading-tight tracking-tight text-primary">
            Already know where you&apos;ll be?
          </h2>
          <p className="text-base leading-relaxed text-on-surface-variant">
            Tell Rumia how much time you have and what kind of day you want. We&apos;ll help you choose what is worth doing.
          </p>
        </div>
        <Button asChild variant="secondary" className="w-full md:w-auto">
          <Link href="/explore">Explore activities</Link>
        </Button>
      </section>

      <EditorialRule />

      <section aria-labelledby="support-topics" className="grid gap-6">
        <div className="grid gap-2">
          <p className="font-metadata text-metadata uppercase tracking-[0.16em] text-ochre-dark">
            Other paths
          </p>
          <h2 id="support-topics" className="font-display text-3xl leading-tight tracking-tight text-primary">
            Pick up where you left off.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {TOPICS.slice(1).map((topic) => (
            <Link
              key={topic.title}
              href={topic.href}
              className="group grid min-h-[132px] gap-3 rounded-[24px] border border-[var(--color-border)] bg-white/45 p-6 transition-colors hover:border-ochre-dark/45 hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 md:p-7"
            >
              <span className="font-display text-2xl leading-tight text-primary group-hover:text-ochre-dark">
                {topic.title}
              </span>
              <span className="max-w-prose text-sm leading-relaxed text-on-surface-variant">
                {topic.text}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="support-boundary" className="grid gap-3 border-t border-[var(--color-border)] pt-8">
        <p className="font-metadata text-metadata uppercase tracking-[0.16em] text-ochre-dark">
          A clear boundary
        </p>
        <h2 id="support-boundary" className="font-display text-3xl leading-tight tracking-tight text-primary">
          Rumia is not emergency or on-trip support.
        </h2>
        <p className="max-w-3xl text-base leading-relaxed text-on-surface-variant">
          Rumia helps you choose activities and shape saved days; it cannot respond to emergencies, provide live assistance, or guarantee current conditions. For urgent help, contact local emergency services.
        </p>
      </section>
    </div>
  );
}
