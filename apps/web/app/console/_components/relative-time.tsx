"use client";

import { useEffect, useState } from "react";

/**
 * Live "Updated Xm ago" / "Xm ago" badge that ticks every minute.
 * SSR-rendered with the current value; client hydrates with the same
 * value (no hydration mismatch), then ticks up. Used by the pipeline
 * board and any other ops surface that surfaces a freshness signal.
 */
export function RelativeTime({
  iso,
  className
}: {
  iso: string;
  className?: string;
}) {
  // Read once on mount; the value is "frozen" until the tick fires.
  // This is intentional — we don't want SSR and the first client
  // render to differ by minutes for slow-loading pages.
  const [minutes, setMinutes] = useState<number>(() =>
    Math.max(1, Math.round((Date.now() - Date.parse(iso)) / 60_000))
  );

  useEffect(() => {
    // Tick at the next minute boundary, then every minute. Cheaper
    // than setInterval(60_000) because it stays aligned to wall clock.
    const msToNextMinute = 60_000 - (Date.now() % 60_000);
    let interval: ReturnType<typeof setInterval> | undefined;
    const timeout = setTimeout(() => {
      setMinutes(Math.max(1, Math.round((Date.now() - Date.parse(iso)) / 60_000)));
      interval = setInterval(() => {
        setMinutes(Math.max(1, Math.round((Date.now() - Date.parse(iso)) / 60_000)));
      }, 60_000);
    }, msToNextMinute);
    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [iso]);

  return (
    <time
      dateTime={iso}
      title={new Date(iso).toLocaleString()}
      className={className}
    >
      {minutes}m ago
    </time>
  );
}
