import Link from "next/link";
import * as React from "react";
import { DecisionStatePanel } from "@repo/ui";

export interface BetaUnavailablePanelProps {
  title: string;
  description: string;
  returnHref?: string;
}

/**
 * A chrome-agnostic unavailable state for feature-gated routes.
 * The containing route layout owns navigation, the main landmark, and the
 * footer so this panel can be embedded without creating nested app shells.
 */
export function BetaUnavailablePanel({
  title,
  description,
  returnHref = "/"
}: BetaUnavailablePanelProps) {
  return (
    <div
      data-testid="beta-unavailable"
      className="mx-auto flex min-h-[calc(100vh-12rem)] w-full max-w-4xl items-center px-container-padding-sm py-16"
    >
      <DecisionStatePanel
        kind="unavailable"
        tone="light"
        headingLevel={1}
        className="w-full"
        title={title}
        description={description}
        illustration={<span aria-hidden className="font-mono-micro text-sm uppercase tracking-[0.18em]">β</span>}
        primaryAction={
          <Link
            href={returnHref}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 font-body text-sm font-semibold text-on-primary transition-colors duration-fast hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
          >
            Return to Rumia
          </Link>
        }
      />
    </div>
  );
}
