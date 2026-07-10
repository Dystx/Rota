import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getReviewedActivityById, REVIEWED_ACTIVITY_SEED } from "@/lib/content/activities";

export const metadata: Metadata = {
  title: "Activity judgement | Rumia",
  description: "Rumia’s evidence-led judgement about a Portugal activity and when it is worth your time."
};

function timeLabel(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (hours === 0) return `${remainder} min`;
  if (remainder === 0) return `${hours} hr`;
  return `${hours} hr ${remainder} min`;
}

export default async function ActivityDetailPage({
  params
}: {
  params: Promise<{ activityId: string }>;
}) {
  const { activityId } = await params;
  const activity = getReviewedActivityById(REVIEWED_ACTIVITY_SEED, activityId);
  if (!activity) notFound();

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <Link className="inline-flex min-h-11 items-center text-sm font-medium text-ochre-dark underline decoration-ochre-light underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light" href={`/explore?region=${activity.region}`}>
        Back to judged activities
      </Link>
      <p className="mt-10 text-sm text-ochre-dark">Portugal activity judgement</p>
      <h1 className="mt-3 font-display text-5xl leading-tight text-primary md:text-6xl">{activity.title}</h1>
      <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-ochre-dark">Rumia verdict</p>
      <p className="mt-3 text-lg leading-relaxed text-on-surface-variant">{activity.verdict}</p>

      <dl className="mt-10 grid gap-x-8 gap-y-6 border-y border-[var(--color-border)] py-8 sm:grid-cols-2">
        <div><dt className="font-medium text-primary">Best for</dt><dd className="mt-1 text-on-surface-variant">{activity.bestFor.join(" · ")}</dd></div>
        <div><dt className="font-medium text-primary">Time to allow</dt><dd className="mt-1 text-on-surface-variant">{timeLabel(activity.durationMinutes)}</dd></div>
        <div><dt className="font-medium text-primary">Go when</dt><dd className="mt-1 text-on-surface-variant">{activity.bestTime}</dd></div>
        <div><dt className="font-medium text-primary">Planning</dt><dd className="mt-1 text-on-surface-variant">{activity.bookingNeed === "essential" ? "Plan ahead" : activity.bookingNeed === "consider" ? "Check ahead" : "No advance booking needed"}</dd></div>
        {activity.avoidWhen ? <div className="sm:col-span-2"><dt className="font-medium text-primary">Avoid when</dt><dd className="mt-1 text-on-surface-variant">{activity.avoidWhen}</dd></div> : null}
        <div className="sm:col-span-2"><dt className="font-medium text-primary">Pair it with</dt><dd className="mt-1 text-on-surface-variant">{activity.pairWith.join(" · ")}</dd></div>
      </dl>

      <p className="mt-8 text-sm leading-relaxed text-on-surface-variant">This is Rumia’s editorial judgement. The source below supports the underlying place information; it is not a booking relationship or a paid placement.</p>
      <a className="mt-4 inline-flex min-h-11 items-center border-b border-ochre-dark px-1 py-2 text-sm font-medium text-ochre-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light" href={activity.evidenceUrl} target="_blank" rel="noreferrer">
        Read the editorial evidence
      </a>
    </article>
  );
}
