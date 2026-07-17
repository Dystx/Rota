"use client";

import * as React from "react";
import Link from "next/link";

import {
  activityExplorerUrl,
  type ActivityIntent,
  type ActivityRegion
} from "@/lib/content/activities";
import { Button, Icon, StatusRegion } from "@repo/ui";

export interface ActivityDetailSaveActionProps {
  activityId: string;
  activityTitle: string;
  region: ActivityRegion;
  moods: readonly string[];
  className?: string;
}

function explorerHref(
  region: ActivityRegion,
  moods: readonly string[],
  activityId: string
): string {
  const intent: ActivityIntent = {
    region,
    timeWindow: "an afternoon",
    moods: moods.length > 0 ? moods : ["good food"],
    group: "two adults",
    constraints: []
  };

  return activityExplorerUrl(intent, [activityId]);
}

export function ActivityDetailSaveAction({
  activityId,
  activityTitle,
  region,
  moods,
  className
}: ActivityDetailSaveActionProps) {
  const [saved, setSaved] = React.useState(false);
  const [status, setStatus] = React.useState("");
  const href = explorerHref(region, moods, activityId);

  function toggleSaved() {
    const nextSaved = !saved;
    setSaved(nextSaved);
    setStatus(
      nextSaved
        ? `${activityTitle} added to your day.`
        : `${activityTitle} removed from your day.`
    );
  }

  return (
    <div data-testid="activity-detail-save-action" className={className ? `space-y-3 ${className}` : "space-y-3"}>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          aria-pressed={saved}
          leadingIcon={saved ? "check" : "bookmark-simple"}
          onClick={toggleSaved}
          tone={saved ? "olive" : "ochre"}
          type="button"
          variant={saved ? "secondary" : "primary"}
        >
          <span className="sr-only">{activityTitle}: </span>
          {saved ? "Remove from my day" : "Save to my day"}
        </Button>

        {saved ? (
          <Link
            className="inline-flex min-h-11 items-center gap-2 px-1 text-sm font-medium text-ochre-dark underline decoration-ochre-light underline-offset-4 transition-colors duration-base hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light"
            href={href}
          >
            See this day
            <Icon name="arrow-right" />
          </Link>
        ) : null}
      </div>

      <StatusRegion testId="activity-detail-save-status">{status}</StatusRegion>
    </div>
  );
}
