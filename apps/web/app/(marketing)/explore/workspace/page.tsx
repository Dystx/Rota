import * as React from "react";
import type { Metadata } from "next";

import { REVIEWED_ACTIVITY_SEED } from "@/lib/content/activities";

import { ActivityWorkspace } from "./activity-workspace";

export const metadata: Metadata = {
  title: "Your Portugal day | Rumia",
  description: "A flexible collection of Portugal activities that Rumia judges worth your time.",
  alternates: { canonical: "/explore/workspace" }
};

function selectedIds(value: string | readonly string[] | undefined): readonly string[] {
  if (!value) return [];
  const values = typeof value === "string" ? [value] : value;
  return [...new Set(values.map((id) => id.trim()).filter(Boolean))];
}

export default async function WorkspacePage({
  searchParams
}: {
  searchParams: Promise<{ activity?: string | readonly string[] }>;
}) {
  const { activity } = await searchParams;
  const byId = new Map(REVIEWED_ACTIVITY_SEED.map((reviewedActivity) => [reviewedActivity.id, reviewedActivity]));
  const activities = selectedIds(activity).flatMap((id) => {
    const reviewedActivity = byId.get(id);
    return reviewedActivity ? [reviewedActivity] : [];
  });

  return <ActivityWorkspace initialActivities={activities} mapEnabled />;
}
