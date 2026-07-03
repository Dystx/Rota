"use client";

/**
 * IndexedDB-backed offline cache for trip data.
 *
 * Phase 5 of the roadmap: travelers retain full map interaction
 * speeds and can read their saved trips when navigating offline
 * or in low-connectivity areas. This is the storage layer; the
 * service worker (`public/sw.js`) handles the HTML shell and
 * Next.js bundle caching separately.
 *
 * Schema (v1):
 *  - trips: { id, payload, cachedAt } — full trip object
 *  - routes: { id, geojson, cachedAt } — itinerary route geometry
 *    (separate from trips so we can cache routes without the full
 *    itinerary payload)
 *
 * No encryption at rest yet. The data is the same data the
 * traveler already sees when online, and the cache is cleared by
 * the browser on user demand (Settings → Storage). Phase 5 follow-
 * up is to add at-rest encryption (Web Crypto AES-GCM with a
 * device-derived key) before storing any PII.
 */

const DB_NAME = "rumia-offline";
const DB_VERSION = 1;
const STORE_TRIPS = "trips";
const STORE_ROUTES = "routes";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB is not available in this environment"));
  }
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_TRIPS)) {
        db.createObjectStore(STORE_TRIPS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_ROUTES)) {
        db.createObjectStore(STORE_ROUTES, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

export async function cacheTrip(
  id: string,
  payload: unknown
): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_TRIPS, "readwrite");
    tx.objectStore(STORE_TRIPS).put({ id, payload, cachedAt: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCachedTrip<T = unknown>(
  id: string
): Promise<{ id: string; payload: T; cachedAt: number } | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_TRIPS, "readonly");
    const request = tx.objectStore(STORE_TRIPS).get(id);
    request.onsuccess = () => resolve((request.result as never) ?? null);
    request.onerror = () => reject(request.error);
  });
}

export async function listCachedTripIds(): Promise<string[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_TRIPS, "readonly");
    const request = tx.objectStore(STORE_TRIPS).getAllKeys();
    request.onsuccess = () => resolve(request.result as string[]);
    request.onerror = () => reject(request.error);
  });
}

export async function clearOfflineCache(): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([STORE_TRIPS, STORE_ROUTES], "readwrite");
    tx.objectStore(STORE_TRIPS).clear();
    tx.objectStore(STORE_ROUTES).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
