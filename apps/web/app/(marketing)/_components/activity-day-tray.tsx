import * as React from "react";

import type { EditorialActivity } from "@/lib/content/activities";

export function ActivityDayTray({
  activities,
  onRemove,
  onContinue
}: {
  activities: readonly EditorialActivity[];
  onRemove: (activityId: string) => void;
  onContinue: () => void;
}) {
  if (activities.length === 0) return null;

  const totalMinutes = activities.reduce((total, activity) => total + activity.durationMinutes, 0);

  return (
    <aside aria-label="Your day" className="fixed inset-x-3 bottom-3 z-40 flex items-center gap-3 border border-[var(--color-border)] bg-surface p-3 shadow-[0_12px_28px_rgba(43,62,52,0.16)] md:static md:inset-auto md:z-auto md:block md:p-5 md:shadow-[0_12px_28px_rgba(43,62,52,0.08)]" role="region">
      <p className="min-w-0 text-sm text-primary md:hidden">
        <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-ochre-dark">Your day</span>
        {activities.length} {activities.length === 1 ? "activity" : "activities"} · {Math.round(totalMinutes / 30) / 2} hr
      </p>
      <div className="hidden md:block">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ochre-dark">Your day</p>
        <h2 className="mt-2 font-display text-2xl text-primary">{activities.length} {activities.length === 1 ? "activity" : "activities"} saved</h2>
        <p className="mt-2 text-sm text-on-surface-variant">About {Math.round(totalMinutes / 30) / 2} hours before travel, pauses, or a meal.</p>
        <ul className="mt-4 space-y-3">
          {activities.map((activity) => (
            <li className="flex items-start justify-between gap-3" key={activity.id}>
              <span className="text-sm text-primary">{activity.title}</span>
              <button
                aria-label={`Remove ${activity.title} from this day`}
                className="min-h-11 min-w-11 text-sm text-ochre-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light"
                type="button"
                onClick={() => onRemove(activity.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
      <button
        className="ml-auto min-h-11 shrink-0 bg-primary px-4 py-3 text-sm font-medium text-linen-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light md:mt-5 md:w-full"
        type="button"
        onClick={onContinue}
      >
        See this day
      </button>
    </aside>
  );
}
