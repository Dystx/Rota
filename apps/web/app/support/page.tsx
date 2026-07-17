import * as React from "react";
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

const RECOVERY_GROUPS = [
  {
    topic: "self-service",
    title: "Self-service recovery",
    summary: "Restart from the place where the activity choice first became unclear.",
    items: [
      "Return to Explore when you need a fresh judged list rather than a saved-day edit.",
      "Use the workspace when the activities are right but the order or keep/remove decision still needs work."
    ],
    href: "/explore"
  },
  {
    topic: "saved-days",
    title: "Saved days and exports",
    summary: "Open the day you already shaped before assuming you need a new purchase or a second plan.",
    items: [
      "Saved-day changes live in the workspace and itinerary views, not inside the marketing routes.",
      "Export access appears only after the chosen-day upgrade is unlocked."
    ],
    href: "/itineraries"
  },
  {
    topic: "payments",
    title: "Payments and unlocked access",
    summary: "Check what the tier unlocks before treating a missing feature as a billing error.",
    items: [
      "The free preview stays available without payment.",
      "Paid access applies to the chosen day you already shaped; it does not add booking or concierge service."
    ],
    href: "/pricing"
  },
  {
    topic: "account",
    title: "Account and return links",
    summary: "Use the private email sign-in flow to get back to your saved work.",
    items: [
      "Rumia sends access through a private email link rather than a password reset flow.",
      "If the email thread is missing, start a new sign-in request from the same address."
    ],
    href: "/sign-in"
  }
] as const;

export default function SupportPage() {
  return (
    <div className="rumia-support-page mx-auto grid max-w-6xl gap-12 px-6 py-12 lg:gap-16 lg:px-12 lg:py-20">
      <div className="rumia-support-hero">
        <EditorialHeading
          eyebrow="Support"
          title="Find the next useful step."
          dek="Rumia is built around one calm decision at a time. Choose the part of your activity-curation journey that needs attention."
        />
      </div>

      <section aria-labelledby="support-start" className="rumia-support-start grid gap-6 rounded-[28px] border p-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-8">
        <div className="grid max-w-2xl gap-2">
          <p className="font-metadata text-metadata uppercase tracking-[0.16em] text-ochre-dark">
            Topic index
          </p>
          <h2 id="support-start" className="font-display text-3xl leading-tight tracking-tight text-primary">
            Choose the recovery path that matches the problem.
          </h2>
          <p className="text-base leading-relaxed text-on-surface-variant">
            Support in Rumia is mostly about getting you back to the right product surface: the judged list, the saved-day workspace, payment boundaries, or your return link.
          </p>
        </div>
        <Button asChild variant="secondary" className="w-full md:w-auto">
          <Link href="/explore">Start with judged activities</Link>
        </Button>
      </section>

      <EditorialRule />

      <section aria-labelledby="support-topics" className="rumia-support-topics grid gap-6">
        <div className="grid gap-2">
          <p className="font-metadata text-metadata uppercase tracking-[0.16em] text-ochre-dark">
            Recovery groups
          </p>
          <h2 id="support-topics" className="font-display text-3xl leading-tight tracking-tight text-primary">
            Open the topic that matches what broke.
          </h2>
        </div>
        <div className="rumia-support-disclosures grid gap-4">
          {RECOVERY_GROUPS.map((group) => (
            <details
              key={group.topic}
              className="rumia-support-disclosure rounded-[24px] border border-[var(--color-border)] bg-white/55 p-5"
              data-testid="support-disclosure"
              data-topic={group.topic}
            >
              <summary className="cursor-pointer list-none pr-8">
                <span className="block font-display text-2xl leading-tight text-primary">
                  {group.title}
                </span>
                <span className="mt-2 block max-w-3xl text-base leading-relaxed text-on-surface-variant">
                  {group.summary}
                </span>
              </summary>
              <div className="mt-4 grid gap-4 border-t border-[var(--color-border)] pt-4">
                <ul className="grid gap-3 text-base leading-relaxed text-on-surface-variant">
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <Link
                  href={group.href}
                  className="inline-flex min-h-11 w-fit items-center rounded-full border border-ochre-dark/35 px-4 py-2 text-sm font-medium text-primary transition-colors hover:border-ochre-dark hover:text-ochre-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
                >
                  Open this recovery path
                </Link>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="grid gap-8 border-t border-[var(--color-border)] pt-8 md:grid-cols-2">
        <div className="grid gap-3">
          <p className="font-metadata text-metadata uppercase tracking-[0.16em] text-ochre-dark">
            Contact boundary
          </p>
          <h2 className="font-display text-3xl leading-tight tracking-tight text-primary">
            Response expectation
          </h2>
          <p className="max-w-3xl text-base leading-relaxed text-on-surface-variant">
            Rumia support is for account return, chosen-day access, and product recovery questions. It is not live emergency assistance or in-trip operations help.
          </p>
          <Link
            href="/sign-in"
            className="inline-flex min-h-11 w-fit items-center rounded-full border border-ochre-dark/35 px-4 py-2 text-sm font-medium text-primary transition-colors hover:border-ochre-dark hover:text-ochre-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
          >
            Contact support
          </Link>
        </div>

        <div className="grid gap-3">
          <p className="font-metadata text-metadata uppercase tracking-[0.16em] text-ochre-dark">
            Urgent issues
          </p>
          <h2 className="font-display text-3xl leading-tight tracking-tight text-primary">
            Escalation path
          </h2>
          <p className="max-w-3xl text-base leading-relaxed text-on-surface-variant">
            If you are already travelling and the issue is urgent, use local emergency or transport channels first. Rumia can help you choose activities; it cannot intervene once an urgent real-world problem is unfolding.
          </p>
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
