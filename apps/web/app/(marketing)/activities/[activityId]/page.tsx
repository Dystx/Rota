import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getReviewedActivityById, REVIEWED_ACTIVITY_SEED } from "@/lib/content/activities";

export const metadata: Metadata = {
  title: "Activity judgement",
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
    <article
      data-testid="activity-detail-page"
      className="mx-auto max-w-6xl px-6 py-12 md:py-16"
    >
      <Link
        className="inline-flex min-h-11 items-center text-sm font-medium text-ochre-dark underline decoration-ochre-light underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light"
        href={`/explore?region=${activity.region}`}
      >
        Back to judged activities
      </Link>

      <div className="mt-12 grid gap-10 md:grid-cols-[minmax(0,1fr)_18rem] md:gap-16">
        <header>
          <p className="font-mono-micro text-mono-micro uppercase tracking-[0.22em] text-ochre-dark">
            Portugal / {activity.region} / activity judgement
          </p>
          <h1 className="mt-4 max-w-4xl font-display text-5xl leading-[0.98] text-primary md:text-7xl">
            {activity.title}
          </h1>
          <div
            data-testid="activity-detail-judgement"
            className="mt-10 max-w-3xl border-t border-ochre-dark/40 pt-5"
          >
            <p className="font-mono-micro text-mono-micro uppercase tracking-[0.22em] text-ochre-dark">
              Rumia verdict
            </p>
            <p className="mt-4 font-display text-2xl leading-tight text-primary md:text-3xl">
              {activity.verdict}
            </p>
          </div>
        </header>

        <aside className="border-t border-[var(--color-border)] pt-5 md:mt-2">
          <p className="font-mono-micro text-mono-micro uppercase tracking-[0.22em] text-ochre-dark">
            The decision
          </p>
          <p className="mt-3 text-sm leading-6 text-on-surface-variant">
            Choose this when the time, pace, and trade-off match the day you
            actually have.
          </p>
          <Link
            className="mt-6 inline-flex min-h-11 items-center border-b border-ochre-dark px-1 py-2 text-sm font-medium text-ochre-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light"
            href={`/explore?region=${activity.region}`}
          >
            Compare with other activities
          </Link>
        </aside>
      </div>

      <dl
        data-testid="activity-detail-fact-rail"
        className="mt-12 grid gap-x-8 gap-y-7 border-y border-[var(--color-border)] py-7 text-sm text-on-surface-variant sm:grid-cols-2 lg:grid-cols-4"
      >
        <div>
          <dt className="font-mono-micro text-mono-micro uppercase tracking-[0.16em] text-primary">Best for</dt>
          <dd className="mt-2 leading-6">{activity.bestFor.join(" · ")}</dd>
        </div>
        <div>
          <dt className="font-mono-micro text-mono-micro uppercase tracking-[0.16em] text-primary">Time to allow</dt>
          <dd className="mt-2 leading-6">{timeLabel(activity.durationMinutes)}</dd>
        </div>
        <div>
          <dt className="font-mono-micro text-mono-micro uppercase tracking-[0.16em] text-primary">Go when</dt>
          <dd className="mt-2 leading-6">{activity.bestTime}</dd>
        </div>
        <div>
          <dt className="font-mono-micro text-mono-micro uppercase tracking-[0.16em] text-primary">Planning</dt>
          <dd className="mt-2 leading-6">
            {activity.bookingNeed === "essential"
              ? "Plan ahead"
              : activity.bookingNeed === "consider"
                ? "Check ahead"
                : "No advance booking needed"}
          </dd>
        </div>
      </dl>

      <section className="mt-10 grid gap-8 md:grid-cols-2">
        <div className="border-l-2 border-ochre-dark/60 pl-5">
          <p className="font-mono-micro text-mono-micro uppercase tracking-[0.2em] text-ochre-dark">
            Leave room for
          </p>
          <p className="mt-3 text-base leading-7 text-on-surface-variant">
            {activity.avoidWhen ?? "The unplanned parts of the day."}
          </p>
        </div>
        <div className="border-l-2 border-olive-light/50 pl-5">
          <p className="font-mono-micro text-mono-micro uppercase tracking-[0.2em] text-ochre-dark">
            Pair it with
          </p>
          <p className="mt-3 text-base leading-7 text-on-surface-variant">
            {activity.pairWith.join(" · ")}
          </p>
        </div>
      </section>

      <footer className="mt-12 border-t border-[var(--color-border)] pt-6">
        <p className="max-w-2xl text-sm leading-relaxed text-on-surface-variant">
          This is Rumia&apos;s editorial judgement. The source below supports
          the underlying place information; it is not a booking relationship or
          a paid placement.
        </p>
        <a
          className="mt-4 inline-flex min-h-11 items-center border-b border-ochre-dark px-1 py-2 text-sm font-medium text-ochre-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light"
          href={activity.evidenceUrl}
          target="_blank"
          rel="noreferrer"
        >
          Read the editorial evidence
        </a>
      </footer>
    </article>
  );
}
