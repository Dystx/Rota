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
 *
 * No encryption at rest yet. The data is the same data the
 * traveler already sees when online, and the cache is cleared by
 * the browser on user demand (Settings → Storage). Phase 5 follow-
 * up is to add at-rest encryption (Web Crypto AES-GCM with a
 * device-derived key) before storing any PII.
 */

const DB_NAME = "rumia-offline";
const DB_VERSION = 2;
const STORE_TRIPS = "trips";
// Added in DB v2 to back the behavioral-profiler persistence
// path (PR-9). The events store is keyed by trip id (so a
// single trip's behavioral history can be flushed + restored
// atomically) and holds a list of `BehaviorEvent`-shaped
// records.
const STORE_BEHAVIOR = "behavior_events";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB is not available in this environment"));
  }
  if (dbPromise) return dbPromise;
  const promise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_TRIPS)) {
        db.createObjectStore(STORE_TRIPS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_BEHAVIOR)) {
        // The behavior events store is keyed by trip id.
        // Each row holds a `BehaviorEvent[]` so a single
        // `put` replaces the whole trip's behavioral
        // history (cheaper than accumulating per-event
        // writes).
        db.createObjectStore(STORE_BEHAVIOR, { keyPath: "tripId" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  // Clear the cached promise on failure so the next call retries
  // (a permanently broken db should not poison every subsequent
  // cacheTrip / getCachedTrip call until a hard reload).
  promise.catch(() => {
    dbPromise = null;
  });
  dbPromise = promise;
  return promise;
}

export interface CachedTrip<T = unknown> {
  id: string;
  payload: T;
  cachedAt: number;
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
): Promise<CachedTrip<T> | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_TRIPS, "readonly");
    const request = tx.objectStore(STORE_TRIPS).get(id);
    request.onsuccess = () => resolve((request.result as CachedTrip<T> | undefined) ?? null);
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
    const tx = db.transaction(STORE_TRIPS, "readwrite");
    tx.objectStore(STORE_TRIPS).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// =============================================================================
// Behavioral profiler persistence (PR-9)
// =============================================================================
//
// The in-memory ring buffer in `behavioral-profiler.ts` is
// lost on page reload. To survive a refresh, we flush the
// buffer to IndexedDB on `pagehide` and restore on
// `pageshow`. The IndexedDB store is keyed by trip id, so
// a single trip's behavioral history is one row.
//
// The flow is:
//   1. Client component (see `apps/web/app/_components/
//      behavior-persistence.tsx`) registers `pagehide` and
//      `pageshow` listeners.
//   2. On `pagehide`: drain the ring buffer, write to IDB.
//   3. On `pageshow`: read from IDB, push events back into
//      the ring buffer (so the live UI sees them).
//   4. A future PR adds the Supabase flush (the
//      `user_behavior_events` table added in
//      `202607031800_create_user_behavior_events.sql`).

/** A subset of `BehaviorEvent` that we persist in IDB.
 *  The full type lives in `behavioral-profiler.ts`; we
 *  duplicate the minimum fields here to keep `offline-
 *  cache.ts` free of a cross-module import. */
export interface CachedBehaviorEvent {
  type: "skip" | "extend" | "replace" | "pin" | "mute";
  tripId: string;
  targetId: string;
  metadata?: Record<string, string | number | boolean>;
  timestamp: number;
}

export interface CachedBehaviorEvents {
  cachedAt: number;
  events: readonly CachedBehaviorEvent[];
  tripId: string;
}

export async function cacheBehaviorEvents(
  tripId: string,
  events: readonly CachedBehaviorEvent[]
): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_BEHAVIOR, "readwrite");
    tx.objectStore(STORE_BEHAVIOR).put({
      tripId,
      events: [...events],
      cachedAt: Date.now()
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadCachedBehaviorEvents(
  tripId: string
): Promise<CachedBehaviorEvents | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_BEHAVIOR, "readonly");
    const request = tx.objectStore(STORE_BEHAVIOR).get(tripId);
    request.onsuccess = () =>
      resolve((request.result as CachedBehaviorEvents | undefined) ?? null);
    request.onerror = () => reject(request.error);
  });
}

export async function clearCachedBehaviorEvents(): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_BEHAVIOR, "readwrite");
    tx.objectStore(STORE_BEHAVIOR).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
