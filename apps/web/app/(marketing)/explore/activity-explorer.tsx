"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  activityExplorerUrl,
  getReviewedActivities,
  REVIEWED_ACTIVITY_SEED,
  type ActivityIntent
} from "@/lib/content/activities";
import {
  ActivityIntentComposer,
  CinematicMedia,
  Icon,
  StatusRegion,
  type ActivityIntentDraft,
  useReducedMotion
} from "@repo/ui";

import { ActivityDayTray } from "../_components/activity-day-tray";
import { ActivityResultCard } from "../_components/activity-result-card";
import { EditorialChapterClose } from "../_components/editorial-chapter-close";

const REGION_LABELS: Record<ActivityIntent["region"], string> = {
  porto: "Porto",
  lisbon: "Lisbon",
  douro: "Douro",
  algarve: "The Algarve",
  azores: "The Azores"
};

const EXPLORER_MEDIA: Record<ActivityIntent["region"], {
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
    caption: "Porto rewards a day that leaves room for the climb back down.",
    credit: "Photo · Cláudio Luiz Castro / Unsplash",
    width: 2400,
    height: 3600
  },
  lisbon: {
    poster: "/media/unsplash/portugal-coast-golden-hour.webp",
    fallback: "/media/unsplash/portugal-coast-golden-hour.jpg",
    alt: "Atlantic seawall and surf at golden hour on the Portuguese coast.",
    caption: "Lisbon is better when the next decision is close enough to walk to.",
    credit: "Photo · Jacek Ulinski / Unsplash",
    width: 2400,
    height: 1761
  },
  douro: {
    poster: "/media/unsplash/douro-terraces.webp",
    fallback: "/media/unsplash/douro-terraces.jpg",
    alt: "Terraced vineyards descending toward the Douro River in northern Portugal.",
    caption: "The Douro asks for fewer stops and more time between them.",
    credit: "Photo · Bruno Ferreira / Unsplash",
    width: 2400,
    height: 1495
  },
  algarve: {
    poster: "/media/unsplash/portugal-coast-golden-hour.webp",
    fallback: "/media/unsplash/portugal-coast-golden-hour.jpg",
    alt: "Atlantic seawall and surf at golden hour on the Portuguese coast.",
    caption: "Choose the Algarve for the light, not a checklist of beaches.",
    credit: "Photo · Jacek Ulinski / Unsplash",
    width: 2400,
    height: 1761
  },
  azores: {
    poster: "/media/unsplash/douro-terraces.webp",
    fallback: "/media/unsplash/douro-terraces.jpg",
    alt: "Terraced vineyards descending toward the Douro River in northern Portugal.",
    caption: "On the islands, weather is part of the judgement.",
    credit: "Photo · Bruno Ferreira / Unsplash",
    width: 2400,
    height: 1495
  }
};

function toIntent(draft: ActivityIntentDraft): ActivityIntent {
  const regionByLabel = {
    Porto: "porto",
    Lisbon: "lisbon",
    Douro: "douro",
    "The Algarve": "algarve",
    "The Azores": "azores"
  } as const;

  const customContext = draft.customContext.trim();

  return {
    region: regionByLabel[draft.region as keyof typeof regionByLabel] ?? "porto",
    timeWindow: draft.timeWindow || "an afternoon",
    moods: draft.moods.length > 0 ? draft.moods : ["good food"],
    group: draft.group || "two adults",
    constraints: customContext ? [...draft.constraints, customContext] : draft.constraints
  };
}

export function ActivityExplorer({
  initialIntent,
  initialSavedIds = []
}: {
  initialIntent: ActivityIntent;
  initialSavedIds?: readonly string[];
}) {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const [intent, setIntent] = useState(initialIntent);
  const [savedIds, setSavedIds] = useState<readonly string[]>(initialSavedIds);
  const [status, setStatus] = useState("");
  const [statusRevision, setStatusRevision] = useState(0);
  const activities = useMemo(() => getReviewedActivities(REVIEWED_ACTIVITY_SEED, intent), [intent]);
  const activitiesById = useMemo(
    () => new Map(REVIEWED_ACTIVITY_SEED.map((activity) => [activity.id, activity])),
    []
  );
  const savedActivities = savedIds.flatMap((savedId) => {
    const activity = activitiesById.get(savedId);
    return activity ? [activity] : [];
  });
  const mobileBottomPadding = savedActivities.length > 0
    ? "pb-[calc(8rem+env(safe-area-inset-bottom))]"
    : "pb-12";
  const intentMotionKey = [
    intent.region,
    intent.timeWindow,
    intent.moods.join(","),
    intent.group,
    intent.constraints.join("|")
  ].join(":");
  const savedMotionKey = savedIds.join("|") || "empty";

  function announce(nextStatus: string) {
    setStatus(nextStatus);
    setStatusRevision((revision) => revision + 1);
  }

  function toggle(activityId: string) {
    const activity = activitiesById.get(activityId);
    const removing = savedIds.includes(activityId);
    const nextSavedIds = removing
      ? savedIds.filter((id) => id !== activityId)
      : [...savedIds, activityId];

    setSavedIds(nextSavedIds);
    router.replace(activityExplorerUrl(intent, nextSavedIds));

    if (activity) {
      const count = nextSavedIds.length;
      announce(
        removing
          ? `${activity.title} removed from your day.`
          : `${activity.title} added to your day; ${count} ${count === 1 ? "activity" : "activities"} selected.`
      );
    }
  }

  function updateIntent(draft: ActivityIntentDraft) {
    const next = toIntent(draft);
    setIntent(next);
    setSavedIds([]);
    const savedDaySuffix = savedIds.length > 0 ? "; your saved day was cleared" : "";
    announce(`Activity suggestions updated for ${REGION_LABELS[next.region]}${savedDaySuffix}.`);
    router.replace(activityExplorerUrl(next));
  }

  function continueToWorkspace() {
    const query = new URLSearchParams();
    for (const id of savedIds) query.append("activity", id);
    router.push(`/explore/workspace?${query.toString()}`);
  }

  return (
    <div
      data-testid="activity-explorer"
      data-reduced-motion={reducedMotion ? "true" : "false"}
      className={`rumia-explore-page mx-auto grid min-w-0 max-w-6xl gap-10 px-6 ${mobileBottomPadding} pt-12 lg:grid-cols-12 lg:items-start lg:pb-28 lg:py-16`}
    >
      <div data-testid="explore-results-column" className="min-w-0 lg:col-span-8">
        <div
          key={`${statusRevision}:${status}`}
          data-motion-key={statusRevision}
          data-testid="activity-status-motion"
          className={`sr-only ${reducedMotion ? "transition-none" : "rumia-status-transition"}`}
        >
          <StatusRegion testId="activity-status">{status}</StatusRegion>
        </div>
        <div className="min-w-0">
        <p className="text-sm text-ochre-dark">Portugal, judged with your time in mind</p>
        <h1 className="mt-3 font-display text-5xl text-primary md:text-6xl">What deserves this day?</h1>
        <div
          key={intentMotionKey}
          data-motion-key={intentMotionKey}
          data-testid="activity-phrase-motion"
          id="intent-composer"
          className={`rumia-intent-panel mt-7 rounded-2xl bg-primary px-5 py-7 md:px-8 ${reducedMotion ? "transition-none" : "rumia-phrase-transition"}`}
        >
          <ActivityIntentComposer initial={{ region: intent.region === "porto" ? "Porto" : intent.region === "lisbon" ? "Lisbon" : intent.region === "douro" ? "Douro" : intent.region === "algarve" ? "The Algarve" : "The Azores", timeWindow: intent.timeWindow, moods: intent.moods, group: intent.group, constraints: intent.constraints }} onSubmit={updateIntent} />
        </div>

        <section aria-label={`${REGION_LABELS[intent.region]} atmosphere`} className="mt-8">
          <CinematicMedia
            src="/media/unsplash/portugal-coast-golden-hour-loop.mp4"
            poster={EXPLORER_MEDIA[intent.region].poster}
            fallbackSrc={EXPLORER_MEDIA[intent.region].fallback}
            alt={EXPLORER_MEDIA[intent.region].alt}
            caption={EXPLORER_MEDIA[intent.region].caption}
            credit={EXPLORER_MEDIA[intent.region].credit}
            width={EXPLORER_MEDIA[intent.region].width}
            height={EXPLORER_MEDIA[intent.region].height}
            sizes="(min-width: 1024px) 760px, 100vw"
            motionPolicy="poster-only"
            className="relative aspect-[16/6] min-h-[12rem] w-full rounded-[24px] border border-midnight/10 shadow-flat"
            posterClassName="brightness-[0.78] saturate-[0.9]"
            overlayClassName="bg-gradient-to-t from-midnight/60 via-midnight/10 to-transparent"
            testId="explore-atmosphere-media"
          />
        </section>

        <section id="judged-activities" aria-label="Judged activities" className="mt-12">
          {activities.length > 0 ? <div className="rumia-result-list">{activities.map((activity, index) => <ActivityResultCard activity={activity} index={index} alternativeTitle={activity.alternativeId ? activitiesById.get(activity.alternativeId)?.title : undefined} key={activity.id} saved={savedIds.includes(activity.id)} onToggle={toggle} />)}</div> : (
            <div className="border-t border-[var(--color-border)] py-8">
              <h2 className="font-display text-3xl text-primary">That combination is still under review.</h2>
              <p className="mt-3 max-w-xl text-on-surface-variant">Try changing one phrase. Rumia will not fill a gap with unrelated recommendations.</p>
            </div>
          )}
        </section>

        <EditorialChapterClose
          ariaLabel="Next step after judging activities"
          description={activities.length === 0
            ? "Change one phrase in the brief and let the recommendations move with the day you actually have."
            : savedActivities.length > 0
              ? "You have a first decision. Carry it into a day you can still edit, share, and leave room around."
              : "A shortlist is useful before it becomes a schedule. Keep the activity that earns its place, then shape the day around it."
          }
          kicker={activities.length === 0 ? "No forced fill" : savedActivities.length > 0 ? "A day begins here" : "The first decision"}
          testId="explore-chapter-close"
          title={activities.length === 0
            ? "A gap is better than a bad recommendation."
            : savedActivities.length > 0
              ? "Your day has a first shape."
              : "One good choice is enough to start."
          }
        >
          <div className="rumia-chapter-close__actions">
            {savedActivities.length > 0 ? (
              <button
                type="button"
                className="rumia-chapter-close__primary"
                onClick={continueToWorkspace}
              >
                Shape this day <Icon name="arrow-right" />
              </button>
            ) : (
              <a className="rumia-chapter-close__primary" href="#intent-composer">
                Change the lens <Icon name="arrow-up" />
              </a>
            )}
            <a className="rumia-chapter-close__secondary" href="#judged-activities">
              {activities.length === 0 ? "Read the note again" : "Keep reading the judgement"}
            </a>
          </div>
        </EditorialChapterClose>
        </div>
      </div>
      <aside
        data-testid="explore-day-rail"
        aria-label="Your chosen day"
        key={savedMotionKey}
        data-motion-key={savedMotionKey}
        className={`min-w-0 lg:col-span-4 lg:sticky lg:top-24 ${reducedMotion ? "transition-none" : "rumia-save-transition"}`}
      >
        <ActivityDayTray key={savedMotionKey} activities={savedActivities} onRemove={toggle} onContinue={continueToWorkspace} />
      </aside>
    </div>
  );
}
