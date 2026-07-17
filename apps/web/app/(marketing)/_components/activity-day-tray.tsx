import * as React from "react";

import type { EditorialActivity } from "@/lib/content/activities";
import { useReducedMotion } from "@repo/ui";

export function ActivityDayTray({
  activities,
  onRemove,
  onContinue
}: {
  activities: readonly EditorialActivity[];
  onRemove: (activityId: string) => void;
  onContinue: () => void;
}) {
  const reducedMotion = useReducedMotion();

  if (activities.length === 0) {
    return (
      <aside
        aria-label="Your day"
        data-empty="true"
        data-testid="activity-day-empty"
        className="hidden min-h-[18rem] border-t border-[var(--color-border)] pt-6 md:block"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ochre-dark">
          Your day
        </p>
        <h2 className="mt-3 font-display text-3xl leading-tight text-primary">
          Your day is open.
        </h2>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-on-surface-variant">
          Save an activity and it will appear here with its time cost, verdict,
          and practical shape.
        </p>
        <ol className="mt-8 grid gap-4 border-t border-[var(--color-border)] pt-5 text-sm text-on-surface-variant">
          <li className="flex gap-3">
            <span className="font-mono-micro text-mono-micro text-ochre-dark">01</span>
            <span>Compare the judgement before you keep anything.</span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono-micro text-mono-micro text-ochre-dark">02</span>
            <span>Leave enough room for the day to stay yours.</span>
          </li>
        </ol>
        <a
          className="mt-8 inline-flex min-h-11 items-center border-b border-ochre-dark px-0.5 py-2 text-sm font-medium text-ochre-dark transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light"
          href="#judged-activities"
        >
          Browse the judged activities
        </a>
      </aside>
    );
  }

  const totalMinutes = activities.reduce((total, activity) => total + activity.durationMinutes, 0);
  const transitionClass = reducedMotion ? "transition-none" : "rumia-save-transition";
  const motionKey = activities.map((activity) => activity.id).join("|");

  return (
    <aside data-testid="activity-day-tray" aria-label="Your day" data-reduced-motion={reducedMotion ? "true" : "false"} data-motion-key={motionKey} className={`fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 flex min-h-16 items-center gap-3 border border-[var(--color-border)] bg-surface p-3 shadow-[0_12px_28px_rgba(43,62,52,0.16)] md:static md:inset-auto md:z-auto md:block md:p-5 md:shadow-[0_12px_28px_rgba(43,62,52,0.08)] ${transitionClass}`} role="region">
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
            <li className={`flex items-start justify-between gap-3 ${transitionClass}`} key={activity.id}>
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
