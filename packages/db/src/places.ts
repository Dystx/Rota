import { CreatePlaceSchema, PlaceSchema, type CreatePlaceInput, type Place, type UpdatePlaceInput } from "@repo/types";
import { desc, eq } from "drizzle-orm";
import { resolveLegacyDataClient, type DataClientOptions } from "./clients";
import { withActor, type DatabaseActor } from "./actor";
import { placeAdjustmentLogs, places as placesTable } from "./schema";

type RawPlaceRow = {
  id: string;
  name: string;
  region: string;
  category: string;
  quality: number | null;
  source_confidence: string;
};

function slugifyPlaceId(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `place-${Date.now()}`;
}

function parsePlaceRow(row: RawPlaceRow): Place {
  return PlaceSchema.parse({
    category: row.category,
    id: row.id,
    name: row.name,
    quality: row.quality,
    region: row.region,
    sourceConfidence: row.source_confidence
  });
}

export async function listPlaces(limit = 100, options?: DataClientOptions): Promise<Place[]> {
  if (options?.actor) {
    return withActor(options.actor, async ({ db }) => {
      const rows = await db
        .select({
          category: placesTable.category,
          id: placesTable.slug,
          name: placesTable.name,
          quality: placesTable.qualityScore,
          region: placesTable.regionSlug,
          sourceConfidence: placesTable.sourceConfidence
        })
        .from(placesTable)
        .orderBy(desc(placesTable.createdAt))
        .limit(limit);

      return rows.map((row) => parsePlaceRow({ ...row, source_confidence: row.sourceConfidence }));
    });
  }

  const { data, error } = await resolveLegacyDataClient(options)
    .from("places")
    .select("id,name,region,category,quality,source_confidence")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return ((data as RawPlaceRow[] | null) ?? []).map((row) => parsePlaceRow(row));
}

export async function getPlaceById(id: string, options?: DataClientOptions): Promise<Place | null> {
  if (options?.actor) {
    return withActor(options.actor, async ({ db }) => {
      const [row] = await db
        .select({
          category: placesTable.category,
          id: placesTable.slug,
          name: placesTable.name,
          quality: placesTable.qualityScore,
          region: placesTable.regionSlug,
          sourceConfidence: placesTable.sourceConfidence
        })
        .from(placesTable)
        .where(eq(placesTable.slug, id))
        .limit(1);

      return row ? parsePlaceRow({ ...row, source_confidence: row.sourceConfidence }) : null;
    });
  }

  const { data, error } = await resolveLegacyDataClient(options)
    .from("places")
    .select("id,name,region,category,quality,source_confidence")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return parsePlaceRow(data as RawPlaceRow);
}

export async function createPlace(input: CreatePlaceInput, options?: DataClientOptions): Promise<Place> {
  const place = CreatePlaceSchema.parse(input);
  const nextId = place.id?.trim() || slugifyPlaceId(place.name);

  if (options?.actor) {
    return withActor(options.actor, async ({ db }) => {
      const [row] = await db
        .insert(placesTable)
        .values({
          category: place.category,
          name: place.name,
          qualityScore: place.quality === undefined || place.quality === null ? null : Math.round(place.quality),
          regionSlug: place.region,
          slug: nextId,
          sourceConfidence: place.sourceConfidence
        })
        .returning({
          category: placesTable.category,
          id: placesTable.slug,
          name: placesTable.name,
          quality: placesTable.qualityScore,
          region: placesTable.regionSlug,
          sourceConfidence: placesTable.sourceConfidence
        });

      if (!row) {
        throw new Error("Failed to create place.");
      }

      return parsePlaceRow({ ...row, source_confidence: row.sourceConfidence });
    });
  }

  const { data, error } = await resolveLegacyDataClient(options)
    .from("places")
    .insert({
      category: place.category,
      id: nextId,
      name: place.name,
      quality: place.quality ?? null,
      region: place.region,
      source_confidence: place.sourceConfidence
    })
    .select("id,name,region,category,quality,source_confidence")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create place.");
  }

  return parsePlaceRow(data as RawPlaceRow);
}

export async function updatePlace(id: string, patch: UpdatePlaceInput, options?: DataClientOptions): Promise<Place | null> {
  const nextPatch = CreatePlaceSchema.partial().parse(patch);

  if (options?.actor) {
    return withActor(options.actor, async ({ db }) => {
      const updates: Partial<typeof placesTable.$inferInsert> = {};
      if (nextPatch.name !== undefined) updates.name = nextPatch.name;
      if (nextPatch.region !== undefined) updates.regionSlug = nextPatch.region;
      if (nextPatch.category !== undefined) updates.category = nextPatch.category;
      if (nextPatch.quality !== undefined) updates.qualityScore = nextPatch.quality === null ? null : Math.round(nextPatch.quality);
      if (nextPatch.sourceConfidence !== undefined) updates.sourceConfidence = nextPatch.sourceConfidence;

      const [row] = await db
        .update(placesTable)
        .set(updates)
        .where(eq(placesTable.slug, id))
        .returning({
          category: placesTable.category,
          id: placesTable.slug,
          name: placesTable.name,
          quality: placesTable.qualityScore,
          region: placesTable.regionSlug,
          sourceConfidence: placesTable.sourceConfidence
        });

      return row ? parsePlaceRow({ ...row, source_confidence: row.sourceConfidence }) : null;
    });
  }

  const updates: Record<string, string | number | null> = {};

  if (nextPatch.name !== undefined) {
    updates.name = nextPatch.name;
  }

  if (nextPatch.region !== undefined) {
    updates.region = nextPatch.region;
  }

  if (nextPatch.category !== undefined) {
    updates.category = nextPatch.category;
  }

  if (nextPatch.quality !== undefined) {
    updates.quality = nextPatch.quality;
  }

  if (nextPatch.sourceConfidence !== undefined) {
    updates.source_confidence = nextPatch.sourceConfidence;
  }

  const { data, error } = await resolveLegacyDataClient(options)
    .from("places")
    .update(updates)
    .eq("id", id)
    .select("id,name,region,category,quality,source_confidence")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return parsePlaceRow(data as RawPlaceRow);
}

/** Floor for `places.quality`. The specialist feedback
 *  loop never drops a place below this — once a place
 *  hits the floor, it's flagged for editorial review
 *  rather than continuing to decay. */
export const MIN_PLACE_QUALITY = 0;
/** Maximum decrement per specialist action. Prevents
 *  a single bad-faith action from tanking a place. */
export const MAX_DECREMENT_PER_ACTION = 2;

/** Audit context for `decrementPlaceQuality`. When provided, the
 *  function writes a row to `app.place_adjustment_log` after the
 *  quality update. The log is append-only and used for:
 *    - "if N specialists flag the same place in M days" aggregations
 *      (future QStash-cron job in apps/workers)
 *    - audit trail for admin-side verification review
 *
 *  When `specialistId` / `tripId` / `reason` are undefined (the
 *  pre-PR-13 call shape), no log row is written — the function
 *  behaves exactly as before.
 */
export type SpecialistFeedbackContext = {
  /** Reason enum value. Maps to the CHECK constraint on
   *  `place_adjustment_log.reason`. */
  reason: "swap_for_hidden_gem" | "fix_logistics_bottleneck";
  /** Specialist profile id (not auth user id) — `specialist_profiles.id`.
   *  Optional to keep the pre-PR-13 call sites compiling; when
   *  undefined, the audit row is skipped. */
  specialistId?: string;
  /** Optional trip id — `trips.id uuid`. When the swap is on the
   *  global map (no trip context), this is null. */
  tripId?: bigint | number | null;
  /** RLS actor used to attribute the append-only audit row. */
  actor?: DatabaseActor;
};

/** Specialist feedback loop: decrement a place's
 *  `quality` field by `delta` (capped at
 *  `MAX_DECREMENT_PER_ACTION` per call, floored at
 *  `MIN_PLACE_QUALITY`). Returns the new quality, or
 *  null if the place doesn't exist.
 *
 * The loop is wired in two places:
 *   - The side-by-side review panel's
 *     `onSwapForHiddenGem` callback (PR-10) — when a
 *     specialist swaps a stop, decrement by 1.
 *   - The "Fix logistics bottleneck" action — decrement
 *     by 1.
 *
 * When the third argument is a `SpecialistFeedbackContext`
 * with `specialistId` set, an audit row is written to
 * `app.place_adjustment_log` after the quality update.
 * The audit row is written for every call (including no-op
 * floor cases) so the action is recorded even when the
 * quality doesn't change. Without `specialistId` the function
 * behaves exactly as before — the audit write is a pure
 * additive feature, gated on the caller opting in.
 *
 * A future PR adds the periodic aggregation job: if N
 *  specialists in M days all flag the same place, the
 *  platform automatically applies a larger decrement.
 *  That lives in `apps/workers` (QStash-cron). This PR
 *  ships the single-action API + the audit log. */
export async function decrementPlaceQuality(
  id: string,
  delta = 1,
  optionsOrFeedback?: DataClientOptions | SpecialistFeedbackContext
): Promise<{ newQuality: number; place: Place } | null> {
  // Backwards-compat: detect the two argument shapes.
  //   - (id, delta, options)            — pre-PR-13
  //   - (id, delta, feedback)           — PR-13+
  // The discriminant: a feedback context has `reason`; a DataClient
  // does not. This is narrower than a proper union discriminator
  // but safe because DataClientOptions is purely the legacy data
  // client options object, never shaped like a feedback context.
  const isFeedback =
    optionsOrFeedback !== undefined &&
    typeof optionsOrFeedback === "object" &&
    "reason" in optionsOrFeedback;
  const options = isFeedback ? undefined : (optionsOrFeedback as DataClientOptions | undefined);
  const feedback = isFeedback ? (optionsOrFeedback as SpecialistFeedbackContext) : undefined;

  const safeDelta = Math.max(0, Math.min(delta, MAX_DECREMENT_PER_ACTION));
  const current = await getPlaceById(id, options);
  if (!current) return null;
  const currentQuality = current.quality ?? 5;
  const newQuality = Math.max(MIN_PLACE_QUALITY, currentQuality - safeDelta);
  // The audit row is written even on a no-op floor (the action
  // happened; ops needs the record). We only skip when there's
  // no specialist id to attribute the row to.
  if (newQuality !== currentQuality) {
    const updated = await updatePlace(
      id,
      { ...current, quality: newQuality },
      options
    );
    if (!updated) return null;
    await maybeWriteAdjustmentLog(
      { delta: newQuality - currentQuality, feedback, placeId: id, options }
    );
    return { newQuality, place: updated };
  }
  await maybeWriteAdjustmentLog(
    { delta: 0, feedback, placeId: id, options }
  );
  return { newQuality, place: current };
}

/** Write a `place_adjustment_log` row when the feedback context has
 *  a specialist id. Silent no-op otherwise (the pre-PR-13 callers
 *  pass `undefined` feedback and get exactly the old behavior).
 *
 *  Errors are swallowed + logged: a failed audit write must not
 *  roll back the quality decrement (the user-facing action is
 *  more important than the audit; ops can backfill from the
 *  console.warn stream). */
async function maybeWriteAdjustmentLog(args: {
  delta: number;
  feedback?: SpecialistFeedbackContext;
  options?: DataClientOptions;
  placeId: string;
}): Promise<void> {
  if (!args.feedback?.specialistId) return;
  try {
    const actor = args.feedback.actor ?? args.options?.actor;
    if (!actor) return;
    await withActor(actor, async ({ db }) => {
      await db.insert(placeAdjustmentLogs).values({
        delta: args.delta,
        placeId: args.placeId,
        reason: args.feedback!.reason,
        specialistId: args.feedback!.specialistId!,
        tripId: args.feedback!.tripId == null ? null : String(args.feedback!.tripId)
      });
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(
      "[decrementPlaceQuality] place_adjustment_log insert threw:",
      err instanceof Error ? err.message : err
    );
  }
}

/** Thin wrapper for the side-by-side review panel's two
 *  feedback callbacks. Always passes a `SpecialistFeedbackContext`
 *  with the right `reason`, so every call writes an audit row.
 *  The caller supplies `specialistId` (the session's specialist
 *  profile id) and `tripId` (the trip under review, or null for
 *  the global map). */
export async function recordSpecialistSwap(args: {
  delta?: number;
  placeId: string;
  reason: SpecialistFeedbackContext["reason"];
  specialistId: string;
  tripId?: bigint | number | null;
  actor?: DatabaseActor;
}): Promise<{ newQuality: number; place: Place } | null> {
  return decrementPlaceQuality(args.placeId, args.delta ?? 1, {
    reason: args.reason,
    specialistId: args.specialistId,
    tripId: args.tripId ?? null,
    actor: args.actor
  });
}
