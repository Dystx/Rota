"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { ActivityIntentComposer, type ActivityIntentDraft } from "@repo/ui";

import { activityExplorerUrl, type ActivityIntent } from "@/lib/content/activities";

function activityIntentFromDraft(draft: ActivityIntentDraft): ActivityIntent {
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

export function HeroIntentCard() {
  const router = useRouter();

  return (
    <div data-testid="hero-intent-card">
      <ActivityIntentComposer
        onSubmit={(draft) => router.push(activityExplorerUrl(activityIntentFromDraft(draft)))}
      />
    </div>
  );
}
