"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useState } from "react";

import type { EditorialActivity } from "@/lib/content/activities";
import { StatusRegion, useReducedMotion } from "@repo/ui";

const ActivityMap = dynamic(
  () => import("../../_components/activity-map").then((module) => module.ActivityMap),
  {
    ssr: false,
    loading: () => (
      <div role="status" className="rounded-2xl border border-[var(--color-border)] bg-linen p-6 text-sm text-on-surface-variant">
        Loading the optional map…
      </div>
    )
  }
);

function durationLabel(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (hours === 0) return `${remainder} min`;
  if (remainder === 0) return `${hours} hr`;
  return `${hours} hr ${remainder} min`;
}

function workspaceUrl(activities: readonly EditorialActivity[]): string {
  const query = new URLSearchParams();
  for (const activity of activities) query.append("activity", activity.id);
  const search = query.toString();
  return search ? `/explore/workspace?${search}` : "/explore/workspace";
}

export function ActivityWorkspace({
  initialActivities,
  mapEnabled = false
}: {
  initialActivities: readonly EditorialActivity[];
  mapEnabled?: boolean;
}) {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const [activities, setActivities] = useState(initialActivities);
  const [status, setStatus] = useState("");
  const [statusRevision, setStatusRevision] = useState(0);
  const [lastRemoved, setLastRemoved] = useState<{ activity: EditorialActivity; index: number } | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [mapSelectedActivityId, setMapSelectedActivityId] = useState<string | null>(initialActivities[0]?.id ?? null);
  const totalMinutes = activities.reduce((total, activity) => total + activity.durationMinutes, 0);
  const activitiesMotionKey = activities.map((activity) => activity.id).join("|") || "empty";
  const feedbackParams = new URLSearchParams({ source: "activity-day" });
  for (const activity of activities) feedbackParams.append("activity", activity.id);
  const feedbackHref = `/feedback?${feedbackParams.toString()}`;

  function announce(nextStatus: string) {
    setStatus(nextStatus);
    setStatusRevision((revision) => revision + 1);
  }

  function replaceWorkspaceUrl(nextActivities: readonly EditorialActivity[]) {
    const href = workspaceUrl(nextActivities);
    window.history.replaceState(window.history.state, "", href);
    router.replace(href);
  }

  function remove(activityId: string) {
    const index = activities.findIndex((activity) => activity.id === activityId);
    const activity = index >= 0 ? activities[index] : undefined;
    if (!activity) return;
    const nextActivities = activities.filter((candidate) => candidate.id !== activityId);
    setActivities(nextActivities);
    replaceWorkspaceUrl(nextActivities);
    setLastRemoved({ activity, index });
    announce(`${activity.title} removed from your day.`);
  }

  React.useEffect(() => {
    setMapSelectedActivityId((current) => {
      if (current && activities.some((activity) => activity.id === current)) return current;
      return activities[0]?.id ?? null;
    });
    if (activities.length === 0) setMapOpen(false);
  }, [activities]);

  function openMap() {
    if (activities.length === 0) return;
    setMapSelectedActivityId((current) => current && activities.some((activity) => activity.id === current) ? current : activities[0]?.id ?? null);
    setMapOpen(true);
    announce("Map opened. The activity list remains available below.");
  }

  function closeMap() {
    setMapOpen(false);
    announce("Map closed. The activity list remains available.");
  }

  const selectMapActivity = React.useCallback((activityId: string) => {
    setMapSelectedActivityId(activityId);
    const activity = activities.find((candidate) => candidate.id === activityId);
    announce(`${activity?.title ?? "Activity"} selected on the map.`);
  }, [activities]);

  function undoRemove() {
    if (!lastRemoved) return;
    const { activity, index } = lastRemoved;
    const nextActivities = [...activities];
    if (!activities.some((candidate) => candidate.id === activity.id)) {
      nextActivities.splice(Math.min(index, nextActivities.length), 0, activity);
    }
    setActivities(nextActivities);
    replaceWorkspaceUrl(nextActivities);
    setLastRemoved(null);
    announce(`${activity.title} restored to your day.`);
  }

  async function share() {
    const url = new URL("/explore/workspace", window.location.origin);
    for (const activity of activities) url.searchParams.append("activity", activity.id);

    if (!navigator.clipboard?.writeText) {
      announce("Copying is unavailable here. You can copy this page address instead.");
      return;
    }

    try {
      await navigator.clipboard.writeText(url.toString());
      announce("Share link copied.");
    } catch {
      announce("We could not copy the link. You can copy this page address instead.");
    }
  }

  return (
    <div
      data-reduced-motion={reducedMotion ? "true" : "false"}
      className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:py-16"
    >
      <div>
        <p className="text-sm text-ochre-dark">A Rumia day, still yours to change</p>
        <h1 className="mt-3 font-display text-5xl text-primary md:text-6xl">Your tentative day</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-on-surface-variant">
          These are not reservations or a rigid itinerary. They are the activities that deserve your time, held together so you can judge the day as a whole.
        </p>

        {mapEnabled && activities.length > 0 ? (
          <div className="mt-7 rounded-2xl border border-[var(--color-border)] bg-linen-dark p-4 sm:flex sm:items-center sm:justify-between sm:gap-5">
            <div>
              <p className="text-sm font-medium text-primary">Understand the shape without changing the day</p>
              <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">The map is optional and list-equivalent. It only loads after you ask to view these selected activities spatially.</p>
            </div>
            <button
              type="button"
              aria-controls="activity-map-panel"
              aria-expanded={mapOpen}
              onClick={openMap}
              className="mt-4 inline-flex min-h-11 shrink-0 items-center rounded-full border border-ochre-dark px-4 py-2 text-sm font-medium text-ochre-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light sm:mt-0"
            >
              View on map
            </button>
          </div>
        ) : null}

        {mapOpen && activities.length > 0 ? (
          <div id="activity-map-panel" className="mt-8 border-y border-[var(--color-border)] py-7" data-map-intent="explicit">
            <ActivityMap
              activities={activities}
              selectedActivityId={mapSelectedActivityId}
              onSelectActivity={selectMapActivity}
              onClose={closeMap}
            />
          </div>
        ) : null}

        {activities.length > 0 ? (
          <ol key={activitiesMotionKey} data-motion-key={activitiesMotionKey} className={`mt-10 space-y-8 ${reducedMotion ? "transition-none" : "rumia-save-transition"}`} aria-label="Chosen activities">
            {activities.map((activity, index) => (
              <li className={reducedMotion ? "transition-none" : "rumia-save-transition"} key={activity.id}>
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
          <section key="empty" data-motion-key="empty" className={`mt-10 border-t border-[var(--color-border)] py-8 ${reducedMotion ? "transition-none" : "rumia-save-transition"}`} aria-label="No chosen activities">
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

      <aside className={`border-t border-[var(--color-border)] pt-6 lg:sticky lg:top-24 ${reducedMotion ? "transition-none" : "rumia-save-transition"}`}>
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
        <div key={`${statusRevision}:${status}`} data-motion-key={statusRevision} className={status ? `mt-3 text-sm text-on-surface-variant ${reducedMotion ? "transition-none" : "rumia-status-transition"}` : "sr-only"}>
          <StatusRegion testId="workspace-status">{status}</StatusRegion>
        </div>
        {lastRemoved ? <button className="mt-2 min-h-11 border-b border-ochre-dark px-1 py-2 text-left text-sm font-medium text-ochre-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light" type="button" onClick={undoRemove}>Undo remove</button> : null}
      </aside>
    </div>
  );
}
