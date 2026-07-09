import { Button } from "./button";
import type { JSX } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import type { TripContextValues } from "./trip-context-bar";

export function TripSummary(props: {
  draft: TripContextValues;
  primaryAction: string;
  onPrimaryAction: () => void;
  primaryActionDisabled?: boolean;
}): JSX.Element {
  const travelWindow = props.draft.travelWindow ?? "Any time";
  const dayLabel = props.draft.days === 1 ? "day" : "days";

  return (
    <Card as="section" aria-label="Trip summary">
      <CardHeader>
        <CardTitle as="h2">Your trip</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">Destination</dt>
            <dd className="mt-1 text-[var(--color-foreground)]">{props.draft.destination}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">Length</dt>
            <dd className="mt-1 text-[var(--color-foreground)]">{props.draft.days} {dayLabel}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">Travel window</dt>
            <dd className="mt-1 text-[var(--color-foreground)]">{travelWindow}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">Transport</dt>
            <dd className="mt-1 text-[var(--color-foreground)]">{props.draft.transport}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">Trip vibe</dt>
            <dd className="mt-1 text-[var(--color-foreground)]">{props.draft.vibe}</dd>
          </div>
        </dl>
        <Button type="button" fullWidth onClick={props.onPrimaryAction} disabled={props.primaryActionDisabled} aria-disabled={props.primaryActionDisabled || undefined}>
          {props.primaryAction}
        </Button>
      </CardContent>
    </Card>
  );
}
