import * as React from "react";
import Link from "next/link";

import type { EditorialActivity } from "@/lib/content/activities";

export function ActivityResultCard({
  activity,
  index = 0,
  alternativeTitle,
  saved,
  onToggle
}: {
  activity: EditorialActivity;
  index?: number;
  alternativeTitle?: string;
  saved: boolean;
  onToggle: (activityId: string) => void;
}) {
  const sequence = String(index + 1).padStart(2, "0");

  return (
    <article
      data-testid="activity-result-card"
      data-saved={saved ? "true" : "false"}
      className={`group relative border-t border-[var(--color-border)] py-8 md:py-10 first:border-t-0 ${saved ? "bg-white/30" : ""}`}
    >
      <div
        aria-hidden
        className={`absolute inset-y-8 left-0 w-1 rounded-full bg-ochre-dark transition-opacity md:inset-y-10 ${saved ? "opacity-100" : "opacity-0 group-hover:opacity-40"}`}
      />

      <div className="grid gap-6 pl-5 md:grid-cols-[minmax(0,1fr)_minmax(15rem,0.55fr)] md:gap-12 md:pl-7">
        <div>
          <div className="flex items-center gap-4">
            <span
              data-testid="activity-result-index"
              className="font-mono-technical text-sm tracking-[0.24em] text-ochre-dark"
            >
              {sequence}
            </span>
            <span className="h-px w-10 bg-ochre-dark/50" aria-hidden />
            <p className="font-mono-micro text-mono-micro uppercase tracking-[0.2em] text-ochre-dark">
              Rumia verdict
            </p>
          </div>

          <h2 className="mt-4 max-w-2xl font-display text-3xl leading-[1.05] text-primary md:text-4xl">
            <Link
              className="rounded-sm underline decoration-transparent underline-offset-4 transition-[text-decoration-color] duration-200 hover:decoration-ochre-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light"
              href={`/activities/${activity.id}`}
            >
              {activity.title}
            </Link>
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-on-surface-variant md:text-lg">
            {activity.verdict}
          </p>
        </div>

        <aside className="border-l border-ochre-dark/30 pl-5 md:mt-1 md:pl-6">
          <p className="font-mono-micro text-mono-micro uppercase tracking-[0.2em] text-ochre-dark">
            The trade-off
          </p>
          <p className="mt-3 text-sm leading-6 text-on-surface-variant">
            {activity.avoidWhen ?? "Worth choosing when it matches the pace you have available."}
          </p>
          <button
            className="mt-5 min-h-11 min-w-11 scroll-mb-[calc(8rem+env(safe-area-inset-bottom))] border-b border-ochre-dark px-0.5 py-2 text-left text-sm font-medium text-ochre-dark transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light"
            type="button"
            aria-pressed={saved}
            onClick={() => onToggle(activity.id)}
          >
            {saved ? `Remove ${activity.title} from this day` : `Save ${activity.title} to this day`}
          </button>
        </aside>
      </div>

      <dl className="mt-8 grid gap-x-6 gap-y-5 border-t border-[var(--color-border)]/70 pl-5 pt-5 text-sm text-on-surface-variant sm:grid-cols-2 md:ml-7 md:pl-0 lg:grid-cols-5">
        <div>
          <dt className="font-mono-micro text-mono-micro uppercase tracking-[0.16em] text-primary">Best for</dt>
          <dd className="mt-2 leading-6">{activity.bestFor.join(" · ")}</dd>
        </div>
        <div>
          <dt className="font-mono-micro text-mono-micro uppercase tracking-[0.16em] text-primary">Time needed</dt>
          <dd className="mt-2 leading-6">{Math.round(activity.durationMinutes / 30) / 2} hours</dd>
        </div>
        <div>
          <dt className="font-mono-micro text-mono-micro uppercase tracking-[0.16em] text-primary">Go when</dt>
          <dd className="mt-2 leading-6">{activity.bestTime}</dd>
        </div>
        <div>
          <dt className="font-mono-micro text-mono-micro uppercase tracking-[0.16em] text-primary">Pair it with</dt>
          <dd className="mt-2 leading-6">{activity.pairWith.join(" · ")}</dd>
        </div>
        {alternativeTitle ? (
          <div>
            <dt className="font-mono-micro text-mono-micro uppercase tracking-[0.16em] text-primary">Choose instead</dt>
            <dd className="mt-2 leading-6">{alternativeTitle}</dd>
          </div>
        ) : null}
      </dl>
    </article>
  );
}
