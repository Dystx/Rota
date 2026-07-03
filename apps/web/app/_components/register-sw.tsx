"use client";

import { useEffect } from "react";

/**
 * Register the PWA service worker. Feature-flagged so CI / SSR
 * never register the SW (which would otherwise intercept fetch
 * during visual + a11y Playwright runs and produce flaky diffs).
 *
 * Drop <RegisterServiceWorker /> once near the top of the root
 * layout. The hook is a no-op when NEXT_PUBLIC_PWA_ENABLED is
 * not set to "true".
 */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (process.env.NEXT_PUBLIC_PWA_ENABLED !== "true") return;
    if (!("serviceWorker" in navigator)) return;

    const onLoad = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.warn("[PWA] Service worker registration failed:", err);
        });
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
