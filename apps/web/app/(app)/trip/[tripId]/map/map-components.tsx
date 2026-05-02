"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { isMapProviderEnabled } from "@repo/maps";
import { RouteMap as SchematicMap } from "@repo/ui";

const ProviderMap = dynamic(() => import("@repo/maps").then(mod => ({ default: mod.ProviderMap })), { ssr: false });

export function RouteMap(props: React.ComponentProps<typeof SchematicMap>) {
  const [useProvider, setUseProvider] = useState<boolean | null>(null);

  useEffect(() => {
    // We check env on the client to safely resolve if mapbox is enabled
    setUseProvider(isMapProviderEnabled());
  }, []);

  // SSR or before mount, render the fallback to avoid hydration mismatch
  if (useProvider === null) {
    return <SchematicMap {...props} />;
  }

  if (useProvider) {
    return <ProviderMap {...props} />;
  }

  return <SchematicMap {...props} />;
}

export const MapPanel = dynamic(() => import("@repo/ui").then(mod => ({ default: mod.MapPanel })), { ssr: false });
