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
  const [status, setStatus] = useState("");
  const [lastRemoved, setLastRemoved] = useState<{ activity: EditorialActivity; index: number } | null>(null);
  const totalMinutes = activities.reduce((total, activity) => total + activity.durationMinutes, 0);
  const feedbackParams = new URLSearchParams({ source: "activity-day" });
  for (const activity of activities) feedbackParams.append("activity", activity.id);
  const feedbackHref = `/feedback?${feedbackParams.toString()}`;

  function remove(activityId: string) {
    const index = activities.findIndex((activity) => activity.id === activityId);
    const activity = index >= 0 ? activities[index] : undefined;
    if (!activity) return;
    setActivities((current) => current.filter((candidate) => candidate.id !== activityId));
    setLastRemoved({ activity, index });
    setStatus(`${activity.title} removed from your day.`);
  }

  function undoRemove() {
    if (!lastRemoved) return;
    const { activity, index } = lastRemoved;
    setActivities((current) => {
      if (current.some((candidate) => candidate.id === activity.id)) return current;
      const next = [...current];
      next.splice(Math.min(index, next.length), 0, activity);
      return next;
    });
    setLastRemoved(null);
    setStatus(`${activity.title} restored to your day.`);
  }

  async function share() {
    const url = new URL("/explore/workspace", window.location.origin);
    for (const activity of activities) url.searchParams.append("activity", activity.id);

    if (!navigator.clipboard?.writeText) {
      setStatus("Copying is unavailable here. You can copy this page address instead.");
      return;
    }

    try {
      await navigator.clipboard.writeText(url.toString());
      setStatus("Share link copied.");
    } catch {
      setStatus("We could not copy the link. You can copy this page address instead.");
    }
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
            <h2 className="font-display text-3xl text-primary">Choose again, with the day still yours.</h2>
            <p className="mt-3 max-w-xl text-on-surface-variant">Nothing is locked in. Start with one good decision, then leave room for the day to breathe.</p>
            <div className="mt-7 border-y border-[var(--color-border)] py-5" role="group" aria-label="Empty day preview">
              <p className="text-sm text-on-surface-variant">A considered day has a shape before it has a schedule.</p>
              <dl className="mt-5 grid gap-5 text-sm leading-relaxed text-on-surface-variant sm:grid-cols-3">
                <div>
                  <dt className="font-medium text-primary">Time</dt>
                  <dd className="mt-1">One or two activities, with a little air between them.</dd>
                </div>
                <div>
                  <dt className="font-medium text-primary">Judgement</dt>
                  <dd className="mt-1">Rumia&apos;s verdict and best time stay visible for every choice.</dd>
                </div>
                <div>
                  <dt className="font-medium text-primary">Practical space</dt>
                  <dd className="mt-1">Leave room for travel, food, and whatever the day brings.</dd>
                </div>
              </dl>
            </div>
            <Link className="mt-7 inline-flex min-h-11 items-center bg-primary px-4 py-3 text-sm font-medium text-linen-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light" href="/explore">
              Keep exploring
            </Link>
          </section>
        )}
      </div>

      <aside className="border-t border-[var(--color-border)] pt-6 lg:sticky lg:top-24">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ochre-dark">The shape of the day</p>
        <p className="mt-3 font-display text-4xl text-primary">{activities.length === 0 ? "Open" : durationLabel(totalMinutes)}</p>
        <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
          {activities.length === 0 ? "Choose an activity to start again." : `${activities.length} ${activities.length === 1 ? "activity" : "activities"}, with space left for the unplanned parts.`}
        </p>
        {activities.length > 0 ? <Link className="mt-7 inline-flex min-h-11 items-center border-b border-ochre-dark px-1 py-2 text-sm font-medium text-ochre-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light" href="/explore">
          Keep exploring
        </Link> : null}
        {activities.length > 0 ? <button className="mt-3 inline-flex min-h-11 items-center border-b border-ochre-dark px-1 py-2 text-left text-sm font-medium text-ochre-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light" type="button" onClick={share}>Share this day</button> : null}
        {activities.length > 0 ? <Link className="mt-3 inline-flex min-h-11 items-center border-b border-ochre-dark px-1 py-2 text-sm font-medium text-ochre-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light" href={feedbackHref}>Give feedback on this day</Link> : null}
        <p className={status ? "mt-3 text-sm text-on-surface-variant" : "sr-only"} role="status" aria-live="polite" aria-atomic="true" data-testid="workspace-status">{status}</p>
        {lastRemoved ? <button className="mt-2 min-h-11 border-b border-ochre-dark px-1 py-2 text-left text-sm font-medium text-ochre-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light" type="button" onClick={undoRemove}>Undo remove</button> : null}
      </aside>
    </div>
  );
}
