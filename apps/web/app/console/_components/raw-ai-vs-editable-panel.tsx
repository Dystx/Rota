/**
 * Side-by-side panel: raw AI itinerary output vs. the
 * specialist's editable state.
 *
 * Part of the Level 2 15-min audit workspace. The left
 * column shows the AI's initial output (read-only); the
 * right column shows the editable state with action
 * buttons per stop ("Swap for Hidden Gem", "Fix
 * Logistics Bottleneck"). Changes propagate through
 * `onEdit` to the parent, which is responsible for
 * persisting them.
 *
 * The panel is the seam between the AI output and the
 * specialist's edits. The parent's `onEdit` is the
 * single mutation point; the panel itself is a pure
 * presentation + dispatch component.
 */

import { useState } from "react";

export type AiStop = {
  /** Stop id (matches the destination's osm_id or
   *  places.id; either is fine — the panel doesn't
   *  know which). */
  id: string;
  name: string;
  reason: string;
  /** Optional warning emitted by the deterministic
   *  generator (e.g. opening-hours unknown). */
  warning?: string;
  /** When the specialist edits a stop, the panel
   *  passes the new reason string back via `onEdit`. */
  editedReason?: string;
  /** "raw" = the AI's output; "edited" = the
   *  specialist's current state. */
  source: "raw" | "edited";
};

export type RawAiVsEditablePanelProps = {
  stops: readonly AiStop[];
  onEdit?: (stopId: string, editedReason: string) => void;
  /** Swap a stop for a hidden gem. Consumer should call
   *  `recordSpecialistSwap` from `@repo/db` with
   *  `reason: "swap_for_hidden_gem"` to record the action in
   *  `public.place_adjustment_log` and decrement `places.quality`
   *  by 1. See `packages/db/src/places.ts:287`. */
  onSwapForHiddenGem?: (stopId: string) => void;
  /** Mark a stop as a logistics bottleneck. Consumer should call
   *  `recordSpecialistSwap` from `@repo/db` with
   *  `reason: "fix_logistics_bottleneck"`. Same audit + decrement
   *  as onSwapForHiddenGem. */
  onFixLogisticsBottleneck?: (stopId: string) => void;
  /** When true, render a "Loading…" placeholder
   *  instead of the panel. */
  isLoading?: boolean;
};

/**
 * Internal editing state for a single stop. We track
 * the local input string so the specialist can
 * type freely before committing via the Save button.
 */
function useStopEdit(initial: string) {
  const [draft, setDraft] = useState(initial);
  return { draft, setDraft, reset: () => setDraft(initial) };
}

export function RawAiVsEditablePanel({
  stops,
  onEdit,
  onSwapForHiddenGem,
  onFixLogisticsBottleneck,
  isLoading = false
}: RawAiVsEditablePanelProps) {
  if (isLoading) {
    return (
      <div
        className="grid gap-3"
        data-testid="raw-ai-vs-editable-panel-loading"
      >
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Loading AI output…
        </p>
      </div>
    );
  }

  return (
    <div
      className="grid gap-4 md:grid-cols-2"
      data-testid="raw-ai-vs-editable-panel"
    >
      <section
        className="rounded-[18px] border border-[var(--color-border)] bg-white/70 p-4"
        data-testid="raw-ai-column"
        aria-label="Raw AI output (read-only)"
      >
        <h3 className="font-headline-sm text-headline-sm text-[var(--color-foreground)]">
          Raw AI output
        </h3>
        <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
          Read-only. Edit on the right.
        </p>
        <ol className="mt-3 grid gap-3">
          {stops.map((stop) => (
            <li
              key={stop.id}
              className="rounded-[14px] border border-[var(--color-border)] bg-surface-container p-3"
            >
              <p className="font-medium text-[var(--color-foreground)]">
                {stop.name}
              </p>
              <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                {stop.reason}
              </p>
              {stop.warning ? (
                <p className="mt-1 text-xs text-ochre-dark">
                  ⚠ {stop.warning}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      <section
        className="rounded-[18px] border border-[var(--color-border)] bg-white/70 p-4"
        data-testid="editable-column"
        aria-label="Editable view (specialist)"
      >
        <h3 className="font-headline-sm text-headline-sm text-[var(--color-foreground)]">
          Your edits
        </h3>
        <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
          Edit the reason; swap a stop; flag a logistics issue.
        </p>
        <ol className="mt-3 grid gap-3">
          {stops.map((stop) => (
            <EditableStop
              key={stop.id}
              stop={stop}
              onEdit={onEdit}
              onSwapForHiddenGem={onSwapForHiddenGem}
              onFixLogisticsBottleneck={onFixLogisticsBottleneck}
            />
          ))}
        </ol>
      </section>
    </div>
  );
}

function EditableStop({
  stop,
  onEdit,
  onSwapForHiddenGem,
  onFixLogisticsBottleneck
}: {
  stop: AiStop;
  onEdit?: RawAiVsEditablePanelProps["onEdit"];
  onSwapForHiddenGem?: RawAiVsEditablePanelProps["onSwapForHiddenGem"];
  onFixLogisticsBottleneck?: RawAiVsEditablePanelProps["onFixLogisticsBottleneck"];
}) {
  const initial = stop.editedReason ?? stop.reason;
  const { draft, setDraft, reset } = useStopEdit(initial);
  const isDirty = draft !== initial;

  return (
    <li
      className="rounded-[14px] border border-[var(--color-border)] bg-surface-container p-3"
      data-testid={`editable-stop-${stop.id}`}
    >
      <p className="font-medium text-[var(--color-foreground)]">
        {stop.name}
      </p>
      <textarea
        className="mt-2 w-full rounded-[10px] border border-[var(--color-border)] bg-white/80 p-2 text-sm text-[var(--color-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light"
        rows={3}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        data-testid={`editable-stop-${stop.id}-reason`}
      />
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            onEdit?.(stop.id, draft);
            reset();
          }}
          disabled={!isDirty || !onEdit}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-on-primary hover:bg-olive-dark disabled:opacity-50"
          data-testid={`editable-stop-${stop.id}-save`}
        >
          {isDirty ? "Save edit" : "Saved"}
        </button>
        {onSwapForHiddenGem ? (
          <button
            type="button"
            onClick={() => onSwapForHiddenGem(stop.id)}
            className="rounded-lg bg-surface-container-high px-3 py-1.5 text-xs font-medium text-on-surface-variant hover:bg-ochre-light/30"
            data-testid={`editable-stop-${stop.id}-swap`}
          >
            Swap for hidden gem
          </button>
        ) : null}
        {onFixLogisticsBottleneck ? (
          <button
            type="button"
            onClick={() => onFixLogisticsBottleneck(stop.id)}
            className="rounded-lg bg-surface-container-high px-3 py-1.5 text-xs font-medium text-on-surface-variant hover:bg-ochre-light/30"
            data-testid={`editable-stop-${stop.id}-fix-logistics`}
          >
            Fix logistics bottleneck
          </button>
        ) : null}
      </div>
    </li>
  );
}
