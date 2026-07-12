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
  StatusRegion,
  type ActivityIntentDraft,
  useReducedMotion
} from "@repo/ui";

import { ActivityDayTray } from "../_components/activity-day-tray";
import { ActivityResultCard } from "../_components/activity-result-card";

const REGION_LABELS: Record<ActivityIntent["region"], string> = {
  porto: "Porto",
  lisbon: "Lisbon",
  douro: "Douro",
  algarve: "The Algarve",
  azores: "The Azores"
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
    const activity = activities.find((candidate) => candidate.id === savedId);
    return activity ? [activity] : [];
  });
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
      className="mx-auto grid max-w-6xl gap-10 px-6 pb-[calc(12rem+env(safe-area-inset-bottom))] pt-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:pb-28 lg:py-16"
    >
      <div
        key={`${statusRevision}:${status}`}
        data-motion-key={statusRevision}
        data-testid="activity-status-motion"
        className={`sr-only ${reducedMotion ? "transition-none" : "rumia-status-transition"}`}
      >
        <StatusRegion testId="activity-status">{status}</StatusRegion>
      </div>
      <div>
        <p className="text-sm text-ochre-dark">Portugal, judged with your time in mind</p>
        <h1 className="mt-3 font-display text-5xl text-primary md:text-6xl">What deserves this day?</h1>
        <div
          key={intentMotionKey}
          data-motion-key={intentMotionKey}
          data-testid="activity-phrase-motion"
          className={`mt-7 rounded-sm bg-primary px-5 py-7 md:px-8 ${reducedMotion ? "transition-none" : "rumia-phrase-transition"}`}
        >
          <ActivityIntentComposer initial={{ region: intent.region === "porto" ? "Porto" : intent.region === "lisbon" ? "Lisbon" : intent.region === "douro" ? "Douro" : intent.region === "algarve" ? "The Algarve" : "The Azores", timeWindow: intent.timeWindow, moods: intent.moods, group: intent.group, constraints: intent.constraints }} onSubmit={updateIntent} />
        </div>

        <section aria-label="Judged activities" className="mt-12">
          {activities.length > 0 ? activities.map((activity) => <ActivityResultCard activity={activity} alternativeTitle={activity.alternativeId ? activitiesById.get(activity.alternativeId)?.title : undefined} key={activity.id} saved={savedIds.includes(activity.id)} onToggle={toggle} />) : (
            <div className="border-t border-[var(--color-border)] py-8">
              <h2 className="font-display text-3xl text-primary">That combination is still under review.</h2>
              <p className="mt-3 max-w-xl text-on-surface-variant">Try changing one phrase. Rumia will not fill a gap with unrelated recommendations.</p>
            </div>
          )}
        </section>
      </div>
      <div
        key={savedMotionKey}
        data-motion-key={savedMotionKey}
        className={`lg:sticky lg:top-24 ${reducedMotion ? "transition-none" : "rumia-save-transition"}`}
      >
        <ActivityDayTray key={savedMotionKey} activities={savedActivities} onRemove={toggle} onContinue={continueToWorkspace} />
      </div>
    </div>
  );
}
