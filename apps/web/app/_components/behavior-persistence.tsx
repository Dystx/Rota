"use client";

import { useEffect } from "react";
import {
  cacheBehaviorEvents,
  loadCachedBehaviorEvents
} from "@/app/_lib/offline-cache";
import {
  drainBehaviorBuffer,
  recordBehavior
} from "@/app/_lib/behavioral-profiler";

/**
 * Mounts the `pagehide` / `pageshow` listeners that flush
 * the in-memory behavioral ring buffer to IndexedDB and
 * restore it on the next visit.
 *
 * Place this in the root layout (once per app) so the
 * persistence path runs for every page. The component
 * renders nothing.
 *
 * The trip id is taken from the URL (`:tripId` segment
 * under `/trip/...`). Pages without a trip id don't
 * trigger a flush — the ring buffer is per-trip and a
 * page without a trip context doesn't have anything to
 * persist. The buffer still records events; we just don't
 * archive them on `pagehide` for those pages.
 */
export function BehaviorPersistence() {
  useEffect(() => {
    function getTripId(): string | null {
      if (typeof window === "undefined") return null;
      const match = window.location.pathname.match(/^\/trip\/([^/]+)/u);
      return match ? decodeURIComponent(match[1]!) : null;
    }

    function onPageHide() {
      const tripId = getTripId();
      if (!tripId) return;
      const drained = drainBehaviorBuffer();
      if (drained.length === 0) return;
      // Fire-and-forget. The browser may unload before the
      // IDB transaction commits; modern browsers hold
      // IndexedDB transactions open across `pagehide` for a
      // short grace period, but we accept the loss if the
      // page is force-killed.
      void cacheBehaviorEvents(tripId, drained);
    }

    async function onPageShow() {
      const tripId = getTripId();
      if (!tripId) return;
      const cached = await loadCachedBehaviorEvents(tripId);
      if (!cached) return;
      // Re-inject the cached events into the live buffer
      // so the current page's UI sees them. We use
      // `recordBehavior` to ensure the consent gate is
      // still respected (it's a no-op if consent was
      // revoked between visits).
      for (const event of cached.events) {
        recordBehavior({
          type: event.type,
          tripId: event.tripId,
          targetId: event.targetId,
          ...(event.metadata ? { metadata: event.metadata } : {})
        });
      }
    }

    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  return null;
}
