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
import { ActivityIntentComposer, type ActivityIntentDraft } from "@repo/ui";

import { ActivityDayTray } from "../_components/activity-day-tray";
import { ActivityResultCard } from "../_components/activity-result-card";

function toIntent(draft: ActivityIntentDraft): ActivityIntent {
  const regionByLabel = {
    Porto: "porto",
    Lisbon: "lisbon",
    Douro: "douro",
    "The Algarve": "algarve",
    "The Azores": "azores"
  } as const;

  return {
    region: regionByLabel[draft.region as keyof typeof regionByLabel] ?? "porto",
    timeWindow: draft.timeWindow || "an afternoon",
    moods: draft.moods.length > 0 ? draft.moods : ["good food"],
    group: draft.group || "two adults",
    constraints: draft.constraints
  };
}

export function ActivityExplorer({ initialIntent }: { initialIntent: ActivityIntent }) {
  const router = useRouter();
  const [intent, setIntent] = useState(initialIntent);
  const [savedIds, setSavedIds] = useState<readonly string[]>([]);
  const activities = useMemo(() => getReviewedActivities(REVIEWED_ACTIVITY_SEED, intent), [intent]);
  const savedActivities = activities.filter((activity) => savedIds.includes(activity.id));

  function toggle(activityId: string) {
    setSavedIds((current) => current.includes(activityId) ? current.filter((id) => id !== activityId) : [...current, activityId]);
  }

  function updateIntent(draft: ActivityIntentDraft) {
    const next = toIntent(draft);
    setIntent(next);
    setSavedIds([]);
    router.replace(activityExplorerUrl(next));
  }

  function continueToWorkspace() {
    const query = new URLSearchParams();
    for (const id of savedIds) query.append("activity", id);
    router.push(`/explore/workspace?${query.toString()}`);
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:py-16">
      <div>
        <p className="text-sm text-ochre-dark">Portugal, judged with your time in mind</p>
        <h1 className="mt-3 font-display text-5xl text-primary md:text-6xl">What deserves this day?</h1>
        <div className="mt-7 rounded-sm bg-primary px-5 py-7 md:px-8"><ActivityIntentComposer initial={{ region: intent.region === "porto" ? "Porto" : intent.region === "lisbon" ? "Lisbon" : intent.region === "douro" ? "Douro" : intent.region === "algarve" ? "The Algarve" : "The Azores", timeWindow: intent.timeWindow, moods: intent.moods, group: intent.group, constraints: intent.constraints }} onSubmit={updateIntent} /></div>

        <section aria-label="Judged activities" className="mt-12">
          {activities.length > 0 ? activities.map((activity) => <ActivityResultCard activity={activity} key={activity.id} saved={savedIds.includes(activity.id)} onToggle={toggle} />) : (
            <div className="border-t border-[var(--color-border)] py-8">
              <h2 className="font-display text-3xl text-primary">That combination is still under review.</h2>
              <p className="mt-3 max-w-xl text-on-surface-variant">Try changing one phrase. Rumia will not fill a gap with unrelated recommendations.</p>
            </div>
          )}
        </section>
      </div>
      <div className="lg:sticky lg:top-24"><ActivityDayTray activities={savedActivities} onRemove={toggle} onContinue={continueToWorkspace} /></div>
    </div>
  );
}
