"use client";

import * as React from "react";
import Link from "next/link";
import { DecisionStatePanel } from "@repo/ui";

export type RouteRecoveryKind = "error" | "unavailable";
export type RouteRecoveryLandmark = "content" | "document";

export interface RouteRecoveryProps {
  kind: RouteRecoveryKind;
  onRetry?: () => void;
  landmark?: RouteRecoveryLandmark;
}

/**
 * Stable, provider-safe recovery language for route and document boundaries.
 * Content mode deliberately renders a section so it can live inside an
 * existing shell `main`; document mode owns the one root landmark itself.
 */
export function RouteRecovery({
  kind,
  onRetry,
  landmark = "content"
}: RouteRecoveryProps) {
  const panel = (
    <DecisionStatePanel
      kind={kind}
      tone="light"
      headingLevel={1}
      title={kind === "unavailable" ? "This part of Rumia is temporarily unavailable" : "We hit a detour"}
      description="Your saved work has not been changed. Try again, or return to support."
      primaryAction={
        onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-primary px-6 py-3 font-label-ui text-label-ui text-on-primary transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
          >
            Try again
          </button>
        ) : (
          <Link
            href="/"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-primary px-6 py-3 font-label-ui text-label-ui text-on-primary transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
          >
            Return home
          </Link>
        )
      }
      secondaryAction={
        <Link
          href="/support"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-primary/25 px-6 py-3 font-label-ui text-label-ui text-primary transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
        >
          Get support
        </Link>
      }
    />
  );

  const className = "min-h-screen bg-linen px-6 py-16";

  if (landmark === "document") {
    return (
      <main
        id="main-content"
        data-scene="utility"
        data-surface-texture="none"
        className={className}
      >
        {panel}
      </main>
    );
  }

  return (
    <section
      aria-label="Route recovery"
      data-scene="utility"
      data-surface-texture="none"
      className={className}
    >
      {panel}
    </section>
  );
}
