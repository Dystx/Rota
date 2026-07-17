"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useState } from "react";

import { REVIEWED_ACTIVITY_SEED, type EditorialActivity } from "@/lib/content/activities";

import { CinematicMedia, DecisionStatePanel, Icon, StatusRegion, useReducedMotion } from "@repo/ui";
import { captureMapTelemetry } from "@/app/_lib/map-telemetry";
import type { ActivityMapProviderConfig } from "../../_components/activity-map";
import { EditorialChapterClose } from "../../_components/editorial-chapter-close";

const ActivityMap = dynamic(
  () => import("../../_components/activity-map").then((module) => module.ActivityMap),
  {
    ssr: false,
    loading: () => (
      <div role="status" className="rounded-2xl border border-[var(--color-border)] bg-linen p-6 text-base leading-7 text-on-surface-variant">
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

function plannerUrl(activities: readonly EditorialActivity[]): string {
  const query = new URLSearchParams({ dayTime: "afternoon", transport: "transit" });
  for (const activity of activities) query.append("activity", activity.id);
  return `/planner?${query.toString()}`;
}

const WORKSPACE_MEDIA: Record<EditorialActivity["region"], {
  poster: string;
  fallback: string;
  alt: string;
  caption: string;
  credit: string;
  width: number;
  height: number;
}> = {
  porto: {
    poster: "/media/unsplash/porto-cobblestone-street.webp",
    fallback: "/media/unsplash/porto-cobblestone-street.jpg",
    alt: "A quiet, steep cobblestone street in Porto with weathered façades and balconies.",
    caption: "A chosen day should have a shape, not a script.",
    credit: "Porto / considered pace",
    width: 2400,
    height: 3600
  },
  lisbon: {
    poster: "/media/unsplash/portugal-coast-golden-hour.webp",
    fallback: "/media/unsplash/portugal-coast-golden-hour.jpg",
    alt: "Atlantic seawall and surf at golden hour on the Portuguese coast.",
    caption: "Keep one decision open for the light to change.",
    credit: "Lisbon / Atlantic edge",
    width: 2400,
    height: 1761
  },
  douro: {
    poster: "/media/unsplash/douro-terraces.webp",
    fallback: "/media/unsplash/douro-terraces.jpg",
    alt: "Terraced vineyards descending toward the Douro River in northern Portugal.",
    caption: "The Douro is generous when the day is not overfilled.",
    credit: "Douro / room around the stops",
    width: 2400,
    height: 1495
  },
  algarve: {
    poster: "/media/unsplash/portugal-coast-golden-hour.webp",
    fallback: "/media/unsplash/portugal-coast-golden-hour.jpg",
    alt: "Atlantic seawall and surf at golden hour on the Portuguese coast.",
    caption: "Choose the coast for the day you have, not the list you saw.",
    credit: "Algarve / slower coast",
    width: 2400,
    height: 1761
  },
  azores: {
    poster: "/media/unsplash/douro-terraces.webp",
    fallback: "/media/unsplash/douro-terraces.jpg",
    alt: "Terraced vineyards descending toward the Douro River in northern Portugal.",
    caption: "Weather belongs in the plan, not in the footnotes.",
    credit: "Azores / weather window",
    width: 2400,
    height: 1495
  }
};

export function ActivityWorkspace({
  initialActivities,
  invalidActivityIds = [],
  mapEnabled = false,
  map3dEnabled = false,
  mapProvider
}: {
  initialActivities: readonly EditorialActivity[];
  /** IDs from the share URL that were not in the reviewed activity corpus. */
  invalidActivityIds?: readonly string[];
  mapEnabled?: boolean;
  map3dEnabled?: boolean;
  mapProvider?: ActivityMapProviderConfig;
}) {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const [activities, setActivities] = useState(initialActivities);
  const [status, setStatus] = useState("");
  const [statusRevision, setStatusRevision] = useState(0);
  const [lastRemoved, setLastRemoved] = useState<{ activity: EditorialActivity; index: number } | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [mapSelectedActivityId, setMapSelectedActivityId] = useState<string | null>(initialActivities[0]?.id ?? null);
  const [urlInvalidActivityIds, setUrlInvalidActivityIds] = useState<readonly string[]>([]);
  const mapTriggerRef = React.useRef<HTMLButtonElement | null>(null);
  const handleMapTelemetry = React.useCallback((event: Parameters<typeof captureMapTelemetry>[0]) => {
    captureMapTelemetry(event);
  }, []);
  const totalMinutes = activities.reduce((total, activity) => total + activity.durationMinutes, 0);
  const workspaceState = activities.length === 0 ? "empty" : activities.length === 1 ? "one" : "multiple";
  const invalidIds = [...new Set([...invalidActivityIds, ...urlInvalidActivityIds])];
  const activitiesMotionKey = activities.map((activity) => activity.id).join("|") || "empty";
  const feedbackParams = new URLSearchParams({ source: "activity-day" });
  for (const activity of activities) feedbackParams.append("activity", activity.id);
  const feedbackHref = `/feedback?${feedbackParams.toString()}`;
  const shapeDayHref = plannerUrl(activities);

  const announce = React.useCallback((nextStatus: string) => {
    setStatus(nextStatus);
    setStatusRevision((revision) => revision + 1);
  }, []);

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
    if (typeof window !== "undefined") {
      const requestedIds = new URLSearchParams(window.location.search).getAll("activity");
      const selectedIds = new Set(initialActivities.map((activity) => activity.id));
      const knownIds = new Set(REVIEWED_ACTIVITY_SEED.map((activity) => activity.id));
      setUrlInvalidActivityIds(
        requestedIds.filter((id) => !selectedIds.has(id) && !knownIds.has(id))
      );
    }
  }, [initialActivities]);

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

  const closeMap = React.useCallback(() => {
    setMapOpen(false);
    announce("Map closed. The activity list remains available.");
    mapTriggerRef.current?.focus();
  }, [announce]);

  React.useEffect(() => {
    if (!mapOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeMap();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeMap, mapOpen]);

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

  function move(activityId: string, direction: -1 | 1) {
    const index = activities.findIndex((activity) => activity.id === activityId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= activities.length) return;

    const nextActivities = activities.slice();
    const [moving] = nextActivities.splice(index, 1);
    if (!moving) return;
    nextActivities.splice(nextIndex, 0, moving);
    setActivities(nextActivities);
    replaceWorkspaceUrl(nextActivities);
    announce(
      `${moving.title} moved ${direction < 0 ? "earlier" : "later"} in your day.`
    );
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
      data-testid="activity-workspace"
      data-state={workspaceState}
      data-reduced-motion={reducedMotion ? "true" : "false"}
      className="rumia-workspace-page mx-auto grid min-w-0 max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:py-16"
    >
      <div className="min-w-0">
        <p className="text-sm text-ochre-dark">A Rumia day, still yours to change</p>
        <h1 className="mt-3 font-display text-5xl text-primary md:text-6xl">Your tentative day</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-on-surface-variant">
          These are not reservations or a rigid itinerary. They are the activities that deserve your time, held together so you can judge the day as a whole.
        </p>

        {invalidIds.length > 0 ? (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-ochre-dark/40 bg-ochre-light/20 px-4 py-3 text-base leading-7 text-primary"
          >
            We ignored {invalidIds.join(", ")} because it is not a reviewed activity. Your chosen day is unchanged.
          </div>
        ) : null}

        {activities[0] ? (
          <section aria-label="Chosen day atmosphere" className="mt-8">
            <CinematicMedia
              src="/media/unsplash/portugal-coast-golden-hour-loop.mp4"
              poster={WORKSPACE_MEDIA[activities[0].region].poster}
              fallbackSrc={WORKSPACE_MEDIA[activities[0].region].fallback}
              alt={WORKSPACE_MEDIA[activities[0].region].alt}
              caption={WORKSPACE_MEDIA[activities[0].region].caption}
              credit={WORKSPACE_MEDIA[activities[0].region].credit}
              width={WORKSPACE_MEDIA[activities[0].region].width}
              height={WORKSPACE_MEDIA[activities[0].region].height}
              sizes="(min-width: 1024px) 760px, 100vw"
              motionPolicy="poster-only"
              className="relative aspect-[16/5] min-h-[13rem] w-full rounded-[24px] border border-midnight/10 shadow-flat"
              posterClassName="brightness-[0.76] saturate-[0.86]"
              overlayClassName="bg-gradient-to-t from-midnight/65 via-midnight/10 to-transparent"
              testId="workspace-atmosphere-media"
            />
          </section>
        ) : null}

        {mapEnabled && activities.length > 0 ? (
          <div className="mt-7 rounded-2xl border border-[var(--color-border)] bg-linen-dark p-4 sm:flex sm:items-center sm:justify-between sm:gap-5">
            <div>
        <p className="text-base font-medium text-primary">Understand the shape without changing the day</p>
              <p className="mt-1 text-base leading-7 text-on-surface-variant">The map is optional and list-equivalent. It only loads after you ask to view these selected activities spatially.</p>
            </div>
            <button
              ref={mapTriggerRef}
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
              showBuildingExtrusions={map3dEnabled}
              onMapTelemetry={handleMapTelemetry}
              provider={mapProvider}
            />
          </div>
        ) : null}

        {activities.length > 0 ? (
          <>
            <ol
              key={activitiesMotionKey}
              data-testid="workspace-activity-sequence"
              data-motion-key={activitiesMotionKey}
              className={`rumia-workspace-list mt-10 space-y-8 ${reducedMotion ? "transition-none" : "rumia-save-transition"}`}
              aria-label="Chosen activities"
            >
            {activities.map((activity, index) => (
              <li className={reducedMotion ? "transition-none" : "rumia-save-transition"} key={activity.id}>
                <article data-testid="workspace-activity-card" className="group relative border-t border-[var(--color-border)] py-8 md:py-9">
                  <div aria-hidden className="absolute inset-y-8 left-0 w-1 rounded-full bg-ochre-dark md:inset-y-9" />
                  <div className="grid gap-6 pl-5 md:grid-cols-[minmax(0,1fr)_16rem] md:gap-12 md:pl-7">
                    <div>
                      <div className="flex flex-wrap items-center gap-4">
                        <p data-testid="workspace-activity-index" className="font-mono-technical text-sm tracking-[0.24em] text-ochre-dark">{String(index + 1).padStart(2, "0")}</p>
                        <span className="h-px w-10 bg-ochre-dark/50" aria-hidden />
                        <p className="font-mono-micro text-mono-micro uppercase tracking-[0.16em] text-ochre-dark">{durationLabel(activity.durationMinutes)} · chosen</p>
                      </div>
                      <h2 className="mt-4 font-display text-3xl leading-tight text-primary md:text-4xl">{activity.title}</h2>
                      <p className="mt-5 font-mono-micro text-mono-micro uppercase tracking-[0.18em] text-ochre-dark">Rumia&apos;s judgement</p>
                      <p className="mt-3 max-w-2xl leading-relaxed text-on-surface-variant">{activity.verdict}</p>
                    </div>
                    <aside className="border-l border-ochre-dark/30 pl-5 md:mt-1 md:pl-6">
                      <p className="font-mono-micro text-mono-micro uppercase tracking-[0.18em] text-ochre-dark">Practical shape</p>
                      <p className="mt-3 text-base leading-7 text-on-surface-variant">Leave room for travel, food, and the day changing its mind.</p>
                      <button
                        type="button"
                        className="mt-5 min-h-11 border-b border-ochre-dark px-1 py-2 text-left text-sm font-medium text-ochre-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light"
                        onClick={() => remove(activity.id)}
                        aria-label={`Remove ${activity.title} from this day`}
                      >
                        Remove from this day
                      </button>
                      <div className="mt-4 flex flex-wrap gap-2" aria-label={`Reorder ${activity.title}`}>
                        <button
                          type="button"
                          disabled={index === 0}
                          className="inline-flex min-h-11 items-center rounded-full border border-[var(--color-border)] px-3 py-2 text-sm font-medium text-ochre-dark disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light"
                          onClick={() => move(activity.id, -1)}
                          aria-label={`Move ${activity.title} earlier`}
                        >
                          Move earlier
                        </button>
                        <button
                          type="button"
                          disabled={index === activities.length - 1}
                          className="inline-flex min-h-11 items-center rounded-full border border-[var(--color-border)] px-3 py-2 text-sm font-medium text-ochre-dark disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light"
                          onClick={() => move(activity.id, 1)}
                          aria-label={`Move ${activity.title} later`}
                        >
                          Move later
                        </button>
                      </div>
                    </aside>
                  </div>
                  <dl className="mt-8 grid gap-4 border-t border-[var(--color-border)]/70 pl-5 pt-5 text-base leading-7 text-on-surface-variant sm:grid-cols-2 md:ml-7 md:pl-0">
                    <div>
                      <dt className="font-mono-micro text-mono-micro uppercase tracking-[0.16em] text-primary">Best time</dt>
                      <dd className="mt-2">{activity.bestTime}</dd>
                    </div>
                    <div>
                      <dt className="font-mono-micro text-mono-micro uppercase tracking-[0.16em] text-primary">Planning</dt>
                      <dd className="mt-2">{activity.bookingNeed === "essential" ? "Plan ahead" : activity.bookingNeed === "consider" ? "Check ahead" : "No advance booking needed"}</dd>
                    </div>
                    {activity.avoidWhen ? <div className="sm:col-span-2">
                      <dt className="font-mono-micro text-mono-micro uppercase tracking-[0.16em] text-primary">Leave room for</dt>
                      <dd className="mt-2">{activity.avoidWhen}</dd>
                    </div> : null}
                  </dl>
                  <a className="mt-6 ml-5 inline-flex min-h-11 items-center text-sm font-medium text-ochre-dark underline decoration-ochre-light underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light md:ml-7" href={activity.evidenceUrl} target="_blank" rel="noreferrer">
                    Read the editorial evidence
                  </a>
                  <span className="sr-only">{activity.title} is selected for this day.</span>
                </article>
              </li>
            ))}
            </ol>
            <EditorialChapterClose
            ariaLabel="Close the chosen day chapter"
            description="The point is not to fill every hour. Use this shape to make the next practical decision, then keep the rest of the day open."
            kicker="Leave room around the plan"
            testId="workspace-chapter-close"
            title={activities.length === 1 ? "One considered stop can carry a day." : "The shape is yours to keep changing."}
          >
            <div
              data-testid="workspace-day-summary"
              className="mb-6 grid gap-3 border-y border-ochre-light/25 py-5 text-base leading-7 text-linen-dark sm:grid-cols-2"
            >
              <p data-testid="workspace-total-time">
                <span className="block font-mono-micro text-mono-micro uppercase tracking-[0.16em] text-ochre-light">Total activity time</span>
                <strong className="mt-1 block font-display text-2xl">{durationLabel(totalMinutes)}</strong>
              </p>
              <p data-testid="workspace-travel-caveat">
                <span className="block font-mono-micro text-mono-micro uppercase tracking-[0.16em] text-ochre-light">Travel and pauses</span>
                <span className="mt-1 block">Allow room between stops for travel, food, pauses, and a day that changes.</span>
              </p>
            </div>
            <div className="rumia-chapter-close__stats" role="list" aria-label="Chosen day summary">
              <div role="listitem">
                <span>Selected</span>
                <strong>{activities.length} {activities.length === 1 ? "activity" : "activities"}</strong>
              </div>
              <div role="listitem">
                <span>Attention</span>
                <strong>{durationLabel(totalMinutes)}</strong>
              </div>
              <div role="listitem">
                <span>Still open</span>
                <strong>{activities.length === 1 ? "One more choice" : "The unplanned parts"}</strong>
              </div>
            </div>
            <div className="rumia-chapter-close__actions">
              <Link className="rumia-chapter-close__primary" href={shapeDayHref}>
                Shape this day <Icon name="arrow-right" />
              </Link>
            </div>
            </EditorialChapterClose>
          </>
        ) : (
          <section key="empty" data-motion-key="empty" className={`rumia-workspace-empty relative mt-10 overflow-hidden rounded-[28px] p-6 md:p-8 ${reducedMotion ? "transition-none" : "rumia-save-transition"}`} aria-label="No chosen activities">
            <DecisionStatePanel
              data-testid="workspace-empty-anchor"
              kind="empty"
              tone="inverse"
              className="relative min-h-0 rounded-none border-0 bg-transparent p-0 text-left shadow-none"
              title="Choose again, with the day still yours."
              description="Nothing is locked in. Start with one good decision, then leave room for the day to breathe."
              illustration={<Icon name="compass" weight="thin" aria-hidden />}
              primaryAction={(
                <Link
                  href="/explore"
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-ochre-light px-5 py-3 text-sm font-medium text-primary shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-ochre-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
                >
                  Start with an activity <Icon name="arrow-right" />
                </Link>
              )}
              secondaryAction={(
                <Link
                  className="inline-flex min-h-11 min-w-11 items-center px-1 py-2 text-sm font-medium text-ochre-light underline decoration-ochre-light underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light"
                  href="/explore"
                >
                  Keep exploring
                </Link>
              )}
            />
            <div className="rumia-workspace-empty__shape relative mt-7 border-y py-5" role="group" aria-label="Empty day preview">
              <p className="text-base text-on-surface-variant">A considered day has a shape before it has a schedule.</p>
              <dl className="mt-5 grid gap-5 text-base leading-7 text-on-surface-variant sm:grid-cols-3">
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
          </section>
        )}
      </div>

      <aside className={`rumia-day-tray border-t border-[var(--color-border)] pt-6 lg:sticky lg:top-24 ${reducedMotion ? "transition-none" : "rumia-save-transition"}`}>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ochre-dark">The shape of the day</p>
        <p className="mt-3 font-display text-4xl text-primary">{activities.length === 0 ? "Open" : durationLabel(totalMinutes)}</p>
        <p className="mt-3 text-base leading-7 text-on-surface-variant">
          {activities.length === 0 ? "Choose an activity to start again." : `${activities.length} ${activities.length === 1 ? "activity" : "activities"}, with space left for the unplanned parts.`}
        </p>
        {activities.length > 0 ? <Link className="mt-4 inline-flex min-h-11 items-center border-b border-ochre-dark px-1 py-2 text-sm font-medium text-ochre-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light" href="/explore">
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
