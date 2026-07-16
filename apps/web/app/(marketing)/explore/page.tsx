import * as React from "react";
import type { Metadata } from "next";

import { parseActivityIntent, parseSavedActivityIds } from "@/lib/content/activities";

import { ActivityExplorer } from "./activity-explorer";
import { PublicRouteLayout } from "../../_components/public-route-layout";

export const metadata: Metadata = {
  title: "What to do in Portugal",
  description:
    "Rumia helps you decide what is genuinely worth doing with the time you have in Portugal.",
  alternates: { canonical: "/explore" }
};

export default async function ExplorePage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | readonly string[] | undefined>>;
}) {
  const query = await searchParams;
  const intent = parseActivityIntent(query);

  return (
    <PublicRouteLayout scene="decision" surfaceTone="linen" surfaceTexture="none" footerMode="none">
      <ActivityExplorer initialIntent={intent} initialSavedIds={parseSavedActivityIds(query)} />
    </PublicRouteLayout>
  );
}
