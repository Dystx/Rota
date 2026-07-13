import * as React from "react";
import type { Metadata } from "next";
import { getOptionalRumiaMapStyleUrl, isFeatureEnabled } from "@repo/config";

import { REVIEWED_ACTIVITY_SEED } from "@/lib/content/activities";

import { ActivityWorkspace } from "./activity-workspace";
import type { ActivityMapProviderConfig } from "../../_components/activity-map";

export const metadata: Metadata = {
  title: "Your Portugal day",
  description: "A flexible collection of Portugal activities that Rumia judges worth your time.",
  alternates: { canonical: "/explore/workspace" }
};

function selectedIds(value: string | readonly string[] | undefined): readonly string[] {
  if (!value) return [];
  const values = typeof value === "string" ? [value] : value;
  return [...new Set(values.map((id) => id.trim()).filter(Boolean))];
}

function configuredMapProvider(): ActivityMapProviderConfig | undefined {
  const styleUrl = getOptionalRumiaMapStyleUrl();
  if (!styleUrl) return undefined;

  return {
    style: {
      id: "protomaps-portugal-canary",
      name: "Rumia Portugal basemap",
      url: styleUrl,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors · <a href="https://protomaps.com/about">Protomaps</a>'
    },
    attribution: {
      links: [
        { label: "© OpenStreetMap contributors", href: "https://www.openstreetmap.org/copyright" },
        { label: "Protomaps", href: "https://protomaps.com/about" }
      ],
      note: "Activity locations are reviewed public-area approximations where labelled."
    }
  };
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
  const mapProvider = configuredMapProvider();
  const mapEnabled = isFeatureEnabled("activityMap") && Boolean(mapProvider);

  return (
    <ActivityWorkspace
      initialActivities={activities}
      mapEnabled={mapEnabled}
      map3dEnabled={mapEnabled && isFeatureEnabled("activityMap3d")}
      mapProvider={mapProvider}
    />
  );
}
