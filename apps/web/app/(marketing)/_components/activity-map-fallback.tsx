import * as React from "react";

import type { ActivityMapModel } from "./activity-map-model";

export interface ActivityMapFallbackProps {
  model: ActivityMapModel;
  selectedActivityId?: string | null;
  onSelectActivity?: (activityId: string) => void;
  error?: string | null;
  onRetry?: () => void;
  compact?: boolean;
}

/**
 * Semantic equivalent for the optional map. It is also rendered beside the
 * live canvas so WebGL never becomes the only way to inspect a selected day.
 */
export function ActivityMapFallback({
  model,
  selectedActivityId = null,
  onSelectActivity,
  error,
  onRetry,
  compact = false
}: ActivityMapFallbackProps) {
  return (
    <section
      data-map-fallback="true"
      aria-label="Activity map list fallback"
      className={compact ? "rounded-2xl border border-[var(--color-border)] bg-linen p-4" : "border-t border-[var(--color-border)] pt-6"}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ochre-dark">The complete list</p>
          <h2 className="mt-2 font-display text-2xl text-primary">Every selected activity stays here</h2>
        </div>
        {error ? <span role="alert" className="text-sm text-on-surface-variant">{error}</span> : null}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
        The map is a spatial explanation, not the source of your day. Use these cards to compare the same editorial judgement without WebGL.
      </p>
      {model.fallback.required && model.fallback.message ? (
        <p className="mt-3 rounded-xl border border-ochre-light/60 bg-ochre-light/10 px-3 py-3 text-sm leading-relaxed text-on-surface-variant">
          {model.fallback.message}
        </p>
      ) : null}
      <ol aria-label="Selected activities" className="mt-5 space-y-3">
        {model.list.map((item, index) => {
          const point = model.byActivityId.get(item.activityId);
          const selected = item.activityId === selectedActivityId;
          const geometryLabel = point
            ? point.geometryPrecision === "approximate" || point.locationPrivacy === "coarse"
              ? "Approximate public area"
              : "Public point"
            : item.geometryLabel;
          return (
            <li key={`${item.activityId}-${index}`}>
              <button
                type="button"
                id={`activity-map-item-${item.activityId}`}
                aria-pressed={selected}
                onClick={() => onSelectActivity?.(item.activityId)}
                className={`block min-h-11 w-full rounded-xl border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light ${selected ? "border-ochre-dark bg-ochre-light/15" : "border-[var(--color-border)] bg-linen"}`}
              >
                <span className="flex items-start gap-3">
                  <span aria-hidden="true" className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-linen">
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-medium text-primary">{item.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-on-surface-variant">{item.verdict}</span>
                    <span className="mt-2 block text-xs uppercase tracking-[0.12em] text-ochre-dark">{geometryLabel} · {item.bestTime}{item.durationMinutes ? ` · ${item.durationMinutes} min` : ""}</span>
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex min-h-11 items-center border-b border-ochre-dark px-1 py-2 text-sm font-medium text-ochre-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light"
        >
          Retry map
        </button>
      ) : null}
      <p className="mt-5 text-xs leading-relaxed text-on-surface-variant">
        Map data attribution: <a className="underline underline-offset-2" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors</a> · <a className="underline underline-offset-2" href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>. Activity locations are public-area approximations where labelled.
      </p>
    </section>
  );
}
