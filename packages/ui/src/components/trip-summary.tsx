import { Button } from "./button";
import type { JSX } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import type { TripContextValues } from "./trip-context-bar";

export function TripSummary(props: {
  draft: TripContextValues;
  primaryAction: string;
  onPrimaryAction: () => void;
  primaryActionDisabled?: boolean;
  onEdit?: (key: keyof TripContextValues) => void;
  title?: string;
  ariaLabel?: string;
}): JSX.Element {
  const travelWindow = props.draft.travelWindow ?? "Any time";
  const dayLabel = props.draft.days === 1 ? "day" : "days";

  return (
    <Card as="section" aria-label={props.ariaLabel ?? "Trip summary"}>
      <CardHeader>
        <CardTitle as="h2">{props.title ?? "Your trip"}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">Destination</dt>
            <dd className="mt-1 text-[var(--color-foreground)]">
              {props.draft.destination}
              {props.onEdit ? <EditContextButton label="destination" onClick={() => props.onEdit?.("destination")} /> : null}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">Length</dt>
            <dd className="mt-1 text-[var(--color-foreground)]">
              {props.draft.days} {dayLabel}
              {props.onEdit ? <EditContextButton label="length" onClick={() => props.onEdit?.("days")} /> : null}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">Travel window</dt>
            <dd className="mt-1 text-[var(--color-foreground)]">
              {travelWindow}
              {props.onEdit ? <EditContextButton label="travel window" onClick={() => props.onEdit?.("travelWindow")} /> : null}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">Transport</dt>
            <dd className="mt-1 text-[var(--color-foreground)]">
              {props.draft.transport}
              {props.onEdit ? <EditContextButton label="transport" onClick={() => props.onEdit?.("transport")} /> : null}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">Trip vibe</dt>
            <dd className="mt-1 text-[var(--color-foreground)]">
              {props.draft.vibe}
              {props.onEdit ? <EditContextButton label="trip vibe" onClick={() => props.onEdit?.("vibe")} /> : null}
            </dd>
          </div>
        </dl>
        <Button type="button" fullWidth onClick={props.onPrimaryAction} disabled={props.primaryActionDisabled} aria-disabled={props.primaryActionDisabled || undefined}>
          {props.primaryAction}
        </Button>
      </CardContent>
    </Card>
  );
}

function EditContextButton({ label, onClick }: { label: string; onClick: () => void }): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-2 min-h-9 rounded-full px-2 text-xs font-medium text-[var(--color-foreground)] underline underline-offset-4 transition-colors hover:text-[var(--color-ochre-on-light)] focus-visible:outline-none focus-visible:shadow-focus"
      aria-label={`Edit ${label}`}
    >
      Edit
    </button>
  );
}
