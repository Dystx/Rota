"use client";

import * as React from "react";

export type CachedTripPack = { label: string; href: string; lastSynced: string };

export function OfflineStatus({ online, cachedPacks, onRetry = () => window.location.reload(), safeHref }: { online: boolean; cachedPacks: CachedTripPack[]; onRetry?: () => void; safeHref: string }) {
  return <div className="grid gap-5 text-center"><p className="text-on-surface-variant">{online ? "You’re back online." : cachedPacks.length ? "You’re offline. Cached trip packs are still available." : "You’re offline. No trip packs are cached on this device."}</p>{cachedPacks[0] ? <a href={cachedPacks[0].href} className="text-ochre-dark underline">Open {cachedPacks[0].label}</a> : <a href={safeHref} className="text-ochre-dark underline">Stay on this offline page</a>}<button type="button" onClick={onRetry} className="mx-auto border-b border-ochre-dark text-ochre-dark">Try again</button></div>;
}
