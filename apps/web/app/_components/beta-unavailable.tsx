import Link from "next/link";
import * as React from "react";
import { DecisionStatePanel } from "@repo/ui";
import { PublicRouteLayout } from "./public-route-layout";

export function BetaUnavailable({
  title,
  description,
  returnHref = "/"
}: {
  title: string;
  description: string;
  returnHref?: string;
}) {
  return (
    <PublicRouteLayout scene="utility" footerMode="compact" surfaceTone="linen" surfaceTexture="none">
      <div
        data-testid="beta-unavailable"
        className="mx-auto flex min-h-[calc(100vh-12rem)] w-full max-w-4xl items-center px-container-padding-sm py-16"
      >
        <h1 className="sr-only">{title}</h1>
        <DecisionStatePanel
          kind="unavailable"
          tone="inverse"
          className="w-full"
          title={title}
          description={description}
          illustration={<span aria-hidden className="font-mono-micro text-sm uppercase tracking-[0.18em]">β</span>}
          primaryAction={
            <Link
              href={returnHref}
              className="inline-flex items-center justify-center rounded-full bg-ochre-light px-5 py-3 font-body text-sm font-semibold text-primary transition-colors duration-fast hover:bg-ochre-light/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              Return to Rumia
            </Link>
          }
        />
      </div>
    </PublicRouteLayout>
  );
}
