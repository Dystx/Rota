import { Card } from "./card";
import type { JSX } from "react";

export type TripContextValues = {
  destination: string;
  days: number;
  travelWindow: string | null;
  transport: string;
  vibe: string;
};

const contextLabels: Record<keyof TripContextValues, string> = {
  destination: "Destination",
  days: "Length",
  travelWindow: "Travel window",
  transport: "Transport",
  vibe: "Trip vibe"
};

function displayContextValue(key: keyof TripContextValues, draft: TripContextValues): string {
  if (key === "days") return `${draft.days} day${draft.days === 1 ? "" : "s"}`;
  if (key === "travelWindow") return draft.travelWindow ?? "Any time";
  return draft[key];
}

export function TripContextBar(props: {
  draft: TripContextValues;
  onEdit: (key: keyof TripContextValues) => void;
  tripState?: "draft" | "preview" | "unlocked" | "review";
}): JSX.Element {
  const keys = Object.keys(contextLabels) as Array<keyof TripContextValues>;

  return (
    <Card as="section" padding="none" aria-label="Trip context" className="overflow-hidden">
      <div className="flex flex-wrap divide-x divide-y divide-[var(--color-border)]">
        {keys.map((key) => (
          <div key={key} className="min-w-[10rem] flex-1 p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">
              {contextLabels[key]}
            </p>
            <p className="mt-1 text-sm font-medium text-[var(--color-foreground)]">
              {displayContextValue(key, props.draft)}
            </p>
            <button
              type="button"
              onClick={() => props.onEdit(key)}
              className="mt-3 min-h-11 rounded-full px-3 text-sm font-medium text-[var(--color-foreground)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:shadow-focus"
              aria-label={`Edit ${contextLabels[key].toLowerCase()}`}
            >
              Edit
            </button>
          </div>
        ))}
      </div>
      {props.tripState ? (
        <p className="border-t border-[var(--color-border)] px-4 py-2 text-xs font-medium uppercase tracking-widest text-[var(--color-muted-foreground)]">
          {props.tripState}
        </p>
      ) : null}
    </Card>
  );
}
