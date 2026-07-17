"use client";

import { useReducedMotion } from "../hooks/use-reduced-motion";
import type { JSX } from "react";
import { Button } from "./button";
import { Card } from "./card";
import { cn } from "../lib/cn";

export function RouteConsequence(props: {
  status: "idle" | "updating" | "ready" | "error";
  stopCount?: number;
  travelMinutes?: number;
  transportLabel?: string;
  warnings?: string[];
  onRetry?: () => void;
}): JSX.Element {
  const reducedMotion = useReducedMotion();

  if (props.status === "updating") {
    return (
      <Card as="section" role="status" aria-live="polite" className="flex items-center gap-3 p-5">
        <span
          aria-hidden
          className={cn(
            "h-4 w-4 rounded-full border-2 border-[var(--color-accent)] border-r-transparent",
            !reducedMotion && "animate-spin"
          )}
        />
        <p className="text-base leading-7 text-[var(--color-muted-foreground)]">Updating route…</p>
      </Card>
    );
  }

  if (props.status === "error") {
    return (
      <Card as="section" role="alert" className="grid gap-3 p-5">
        <p className="font-medium text-[var(--color-foreground)]">We couldn&apos;t update the route.</p>
        <p className="text-base leading-7 text-[var(--color-muted-foreground)]">
          Your choices are saved locally. Try updating again when you&apos;re ready.
        </p>
        {props.onRetry ? (
          <div>
            <Button type="button" variant="secondary" size="sm" onClick={props.onRetry}>
              Try again
            </Button>
          </div>
        ) : null}
      </Card>
    );
  }

  if (props.status === "ready") {
    const stopLabel = props.stopCount === undefined
      ? null
      : `${props.stopCount} stop${props.stopCount === 1 ? "" : "s"}`;
    const travelLabel = props.travelMinutes === undefined ? null : `${props.travelMinutes} min travel`;

    return (
      <Card as="section" aria-label="Route consequences" className="grid gap-3 p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">
          Route impact
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium text-[var(--color-foreground)]">
          {stopLabel ? <span>{stopLabel}</span> : null}
          {travelLabel ? <span>{travelLabel}</span> : null}
          {props.transportLabel ? <span>{props.transportLabel}</span> : null}
        </div>
        {props.warnings && props.warnings.length > 0 ? (
          <ul className="grid gap-1 text-base leading-7 text-[var(--color-status-danger-fg)]">
            {props.warnings.map((warning) => <li key={warning}>{warning}</li>)}
          </ul>
        ) : null}
      </Card>
    );
  }

  return (
    <Card as="section" aria-label="Route consequences" className="p-5">
      <p className="text-base leading-7 text-[var(--color-muted-foreground)]">
        Choose an option to see how it changes your route.
      </p>
    </Card>
  );
}
