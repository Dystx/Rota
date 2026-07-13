"use client";

import * as React from "react";

export type CachedTripPack = { label: string; href: string; lastSynced: string };

export function OfflineStatus({
  online,
  cachedPacks,
  onRetry = () => window.location.reload(),
  safeHref
}: {
  online: boolean;
  cachedPacks: CachedTripPack[];
  onRetry?: () => void;
  safeHref: string;
}) {
  const message = online
    ? "You’re back online."
    : cachedPacks.length
      ? "You’re offline. Cached activity days are still available."
    : "You’re offline. No saved activity days are cached on this device.";

  return (
    <div className="grid justify-items-center gap-5 text-center" data-testid="offline-status">
      <p className="max-w-prose text-base leading-relaxed text-on-surface-variant" role="status" aria-live="polite">
        {message}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <a
          href={cachedPacks[0]?.href ?? safeHref}
          className="inline-flex min-h-11 items-center rounded-full border border-ochre-dark/45 px-5 text-sm font-medium text-ochre-dark underline-offset-4 hover:border-ochre-dark hover:bg-ochre-light/10 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
        >
          {cachedPacks[0] ? `Open ${cachedPacks[0].label}` : "Stay on this offline page"}
        </a>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex min-h-11 items-center rounded-full px-5 text-sm font-medium text-primary underline-offset-4 hover:text-ochre-dark hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
