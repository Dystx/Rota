// Rumia service worker — Phase 5 PWA scaffold.
//
// Strategy:
//  - HTML routes: network-first, fall back to the offline shell
//    when the network is unreachable. This keeps users on the
//    live site when online and serves a clean "you're offline"
//    page when not.
//  - /_next/static/* (hashed bundles): cache-first. The filenames
//    hash per build, so anything in the cache is safe to reuse.
//  - /icon-* and /manifest.webmanifest: cache-first.
//  - Everything else (API, Supabase, MapLibre tiles): bypass the
//    SW entirely. Realtime / writes / maps must always hit the
//    network.
//
// The SW is registered client-side from `register-sw.ts` only when
// `NEXT_PUBLIC_PWA_ENABLED=true`. Local dev, CI, and SSR all skip
// registration so the SW never intercepts fetch during tests.

const CACHE_VERSION = "rumia-v1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const HTML_FALLBACK = "/offline";

self.addEventListener("install", (event) => {
  // Pre-cache the offline fallback page so the very first
  // navigation while offline has something to show.
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.add(HTML_FALLBACK)).catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Clean up any old cache versions from a prior deploy.
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith("rumia-") && key !== STATIC_CACHE)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Hashed Next.js bundles + manifest + icons: cache-first.
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname === "/manifest.webmanifest" ||
    url.pathname.startsWith("/icon-")
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // HTML navigations: network-first, offline-shell fallback.
  if (request.mode === "navigate" || request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }

  // Everything else: let the browser handle it normally.
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone()).catch(() => undefined);
    }
    return response;
  } catch {
    return new Response("", { status: 504, statusText: "Offline" });
  }
}

async function networkFirstWithOfflineFallback(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    const fallback = await caches.match(HTML_FALLBACK);
    if (fallback) return fallback;
    return new Response("Offline", { status: 503, statusText: "Offline" });
  }
}
