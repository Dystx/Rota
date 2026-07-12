import * as React from "react";
import Link from "next/link";

import type { EditorialActivity } from "@/lib/content/activities";

export function ActivityResultCard({
  activity,
  alternativeTitle,
  saved,
  onToggle
}: {
  activity: EditorialActivity;
  alternativeTitle?: string;
  saved: boolean;
  onToggle: (activityId: string) => void;
}) {
  return (
    <article className="border-t border-[var(--color-border)] py-6 first:border-t-0">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ochre-dark">Rumia verdict</p>
          <h2 className="mt-2 font-display text-3xl text-primary"><Link className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light" href={`/activities/${activity.id}`}>{activity.title}</Link></h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-on-surface-variant">{activity.verdict}</p>
        </div>
        <button
          className="min-h-11 border-b border-ochre-dark px-1 py-2 text-left text-sm font-medium text-ochre-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light md:text-right"
          type="button"
          aria-pressed={saved}
          data-saved={saved ? "true" : "false"}
          onClick={() => onToggle(activity.id)}
        >
          {saved ? `Remove ${activity.title} from this day` : `Save ${activity.title} to this day`}
        </button>
      </div>

      <dl className="mt-5 grid gap-4 text-sm text-on-surface-variant sm:grid-cols-2 lg:grid-cols-5">
        <div><dt className="font-medium text-primary">Best for</dt><dd className="mt-1">{activity.bestFor.join(" · ")}</dd></div>
        <div><dt className="font-medium text-primary">Time needed</dt><dd className="mt-1">{Math.round(activity.durationMinutes / 30) / 2} hours</dd></div>
        <div><dt className="font-medium text-primary">Go when</dt><dd className="mt-1">{activity.bestTime}</dd></div>
        <div><dt className="font-medium text-primary">Pair it with</dt><dd className="mt-1">{activity.pairWith.join(" · ")}</dd></div>
        {alternativeTitle ? <div><dt className="font-medium text-primary">Choose instead</dt><dd className="mt-1">{alternativeTitle}</dd></div> : null}
      </dl>

      {activity.avoidWhen ? <p className="mt-4 text-sm leading-6 text-on-surface-variant"><span className="font-medium text-primary">Avoid when: </span>{activity.avoidWhen}</p> : null}
    </article>
  );
}
