import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { getReviewedActivityById, REVIEWED_ACTIVITY_SEED } from "@/lib/content/activities";
import { Button } from "@repo/ui";
import { EditorialProofRail } from "../_components/editorial-proof-rail";
import { PublicRouteLayout } from "../../_components/public-route-layout";

import { ActivityFeedbackForm } from "./activity-feedback-form";

export const metadata: Metadata = {
  title: "Feedback",
  description: "Share whether Rumia's activity judgements made better use of your time in Portugal.",
  alternates: { canonical: "/feedback" }
};

function values(value: string | readonly string[] | undefined): readonly string[] {
  if (!value) return [];
  return typeof value === "string" ? [value] : value;
}

function feedbackSource(value: string | undefined): "activity-day" | "activity-detail" | "feedback-page" {
  if (value === "activity-day" || value === "activity-detail") return value;
  return "feedback-page";
}

export default async function FeedbackPage({
  searchParams
}: {
  searchParams: Promise<{ activity?: string | readonly string[]; source?: string }>;
}) {
  const { activity, source } = await searchParams;
  const selectedActivities = [...new Set(values(activity).map((id) => id.trim()))]
    .map((id) => getReviewedActivityById(REVIEWED_ACTIVITY_SEED, id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .slice(0, 5);
  const activityIds = selectedActivities.map((item) => item.id);

  return (
    <PublicRouteLayout scene="utility" surfaceTone="linen" surfaceTexture="none" footerMode="compact">
      <div className="rumia-feedback-page mx-auto grid max-w-5xl gap-8 px-6 py-16 lg:px-12 lg:py-20">
      <Link className="inline-flex min-h-11 items-center text-sm font-medium text-ochre-dark underline decoration-ochre-light underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light" href="/explore">
        Back to judged activities
      </Link>
      <div className="grid gap-3">
        <p className="text-sm text-ochre-dark">Rumia feedback · field note</p>
        <h1 className="font-display text-5xl leading-tight text-primary md:text-6xl">Did Rumia make better use of your time?</h1>
        <p className="max-w-2xl text-lg leading-relaxed text-on-surface-variant">We use a small, anonymous rating to test whether our activity judgement works during real Portugal trips. We do not ask for an account, email address, or booking information here.</p>
      </div>
      <EditorialProofRail
        items={[
          { label: "Signal", value: "A quick reaction to the activities you actually chose." },
          { label: "Privacy", value: "No account, email address, or booking data is required." },
          { label: "Use", value: "Your note helps keep the Portugal activity corpus honest." }
        ]}
      />

      {activityIds.length > 0 ? (
        <>
          <section className="rumia-feedback-context" aria-labelledby="feedback-context-title">
            <div className="grid gap-3">
              <p className="font-metadata text-metadata uppercase tracking-[0.16em] text-ochre-dark">
                Selected day context
              </p>
              <h2 id="feedback-context-title" className="font-display text-3xl leading-tight text-primary">
                You are rating the activities you actually kept.
              </h2>
            </div>
            <ul className="grid gap-3 text-base leading-8 text-on-surface-variant">
              {selectedActivities.map((item) => (
                <li key={item.id} className="rounded-[22px] border border-[var(--color-border)] bg-white/55 px-5 py-4">
                  {item.title}
                </li>
              ))}
            </ul>
          </section>
          <ActivityFeedbackForm
            activityIds={activityIds}
            activityTitles={selectedActivities.map((item) => item.title)}
            source={feedbackSource(source)}
          />
        </>
      ) : (
        <section className="rumia-feedback-empty mt-10 border-t border-[var(--color-border)] pt-8" aria-label="Choose activities before sharing feedback">
          <h2 className="font-display text-3xl text-primary">Choose a day to review.</h2>
          <p className="mt-3 max-w-xl leading-relaxed text-on-surface-variant">Feedback is tied only to activities you selected, so the signal stays useful to the editorial team and does not drift into generic travel opinions.</p>
          <Button asChild variant="primary" tone="ochre" className="mt-6 w-fit">
            <Link href="/explore">Explore Portugal activities</Link>
          </Button>
        </section>
      )}
      </div>
    </PublicRouteLayout>
  );
}
