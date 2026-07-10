"use client";

import * as React from "react";
import Link from "next/link";
import { useState } from "react";

import type { EditorialActivity } from "@/lib/content/activities";

function durationLabel(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (hours === 0) return `${remainder} min`;
  if (remainder === 0) return `${hours} hr`;
  return `${hours} hr ${remainder} min`;
}

export function ActivityWorkspace({
  initialActivities
}: {
  initialActivities: readonly EditorialActivity[];
}) {
  const [activities, setActivities] = useState(initialActivities);
  const totalMinutes = activities.reduce((total, activity) => total + activity.durationMinutes, 0);

  function remove(activityId: string) {
    setActivities((current) => current.filter((activity) => activity.id !== activityId));
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:py-16">
      <div>
        <p className="text-sm text-ochre-dark">A Rumia day, still yours to change</p>
        <h1 className="mt-3 font-display text-5xl text-primary md:text-6xl">Your tentative day</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-on-surface-variant">
          These are not reservations or a rigid itinerary. They are the activities that deserve your time, held together so you can judge the day as a whole.
        </p>

        {activities.length > 0 ? (
          <ol className="mt-10 space-y-8" aria-label="Chosen activities">
            {activities.map((activity, index) => (
              <li key={activity.id}>
                <article className="border-t border-[var(--color-border)] py-7">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <p className="text-sm font-medium text-ochre-dark">{String(index + 1).padStart(2, "0")} · {durationLabel(activity.durationMinutes)}</p>
                    <button
                      type="button"
                      className="min-h-11 border-b border-ochre-dark px-1 py-2 text-sm font-medium text-ochre-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light"
                      onClick={() => remove(activity.id)}
                      aria-label={`Remove ${activity.title} from this day`}
                    >
                      Remove
                    </button>
                  </div>
                  <h2 className="mt-3 font-display text-3xl text-primary">{activity.title}</h2>
                  <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-ochre-dark">Rumia&apos;s judgement</p>
                  <p className="mt-2 max-w-2xl leading-relaxed text-on-surface-variant">{activity.verdict}</p>
                  <dl className="mt-6 grid gap-4 border-l border-ochre-light pl-4 text-sm leading-relaxed text-on-surface-variant sm:grid-cols-2">
                    <div>
                      <dt className="font-medium text-primary">Best time</dt>
                      <dd>{activity.bestTime}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-primary">Planning</dt>
                      <dd>{activity.bookingNeed === "essential" ? "Plan ahead" : activity.bookingNeed === "consider" ? "Check ahead" : "No advance booking needed"}</dd>
                    </div>
                    {activity.avoidWhen ? <div className="sm:col-span-2">
                      <dt className="font-medium text-primary">Avoid when</dt>
                      <dd>{activity.avoidWhen}</dd>
                    </div> : null}
                  </dl>
                  <a className="mt-6 inline-flex min-h-11 items-center text-sm font-medium text-ochre-dark underline decoration-ochre-light underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light" href={activity.evidenceUrl} target="_blank" rel="noreferrer">
                    Read the editorial evidence
                  </a>
                </article>
              </li>
            ))}
          </ol>
        ) : (
          <section className="mt-10 border-t border-[var(--color-border)] py-8" aria-label="No chosen activities">
            <h2 className="font-display text-3xl text-primary">Clear it and choose again.</h2>
            <p className="mt-3 max-w-xl text-on-surface-variant">A good day starts with the activities you are genuinely excited to make time for.</p>
          </section>
        )}
      </div>

      <aside className="border-t border-[var(--color-border)] pt-6 lg:sticky lg:top-24">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ochre-dark">The shape of the day</p>
        <p className="mt-3 font-display text-4xl text-primary">{activities.length === 0 ? "Open" : durationLabel(totalMinutes)}</p>
        <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
          {activities.length === 0 ? "Choose an activity to start again." : `${activities.length} ${activities.length === 1 ? "activity" : "activities"}, with space left for the unplanned parts.`}
        </p>
        <Link className="mt-7 inline-flex min-h-11 items-center border-b border-ochre-dark px-1 py-2 text-sm font-medium text-ochre-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light" href="/explore">
          Keep exploring
        </Link>
      </aside>
    </div>
  );
}
