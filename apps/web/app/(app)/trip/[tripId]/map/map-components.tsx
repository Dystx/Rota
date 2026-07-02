"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { isMapProviderEnabled } from "@repo/maps";
import { prewarm } from "@repo/maps/prewarm";
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
    const { onLoad, ...rest } = props;
    return <ProviderMap {...rest} onLoad={() => {
      const loadEvent = {} as Parameters<NonNullable<typeof onLoad>>[0];
      onLoad?.(loadEvent);
    }} />;
  }

  return <SchematicMap {...props} />;
}

export function PrewarmLink(props: React.ComponentProps<typeof Link>) {
  const handlePrewarm = (): void => {
    void prewarm();
  };

  return <Link {...props} onFocus={handlePrewarm} onMouseEnter={handlePrewarm} />;
}

export const MapPanel = dynamic(() => import("@repo/ui").then(mod => ({ default: mod.MapPanel })), { ssr: false });
