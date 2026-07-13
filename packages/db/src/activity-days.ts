import "server-only";

import { and, asc, desc, eq } from "drizzle-orm";

import { withActor, type DatabaseActor, type ActorDb } from "./actor";
import { savedActivityDays, savedActivitySelections } from "./schema";

export type SavedActivitySelectionInput = {
  note?: string | null;
  placeId: string;
  position: number;
};

export type SavedActivityDayInput = {
  dayDate?: string | null;
  destinationSlug: string;
  selections?: readonly SavedActivitySelectionInput[];
  title: string;
};

export type SavedActivitySelection = {
  note: string | null;
  placeId: string;
  position: number;
};

export type SavedActivityDay = {
  createdAt: string;
  dayDate: string | null;
  destinationSlug: string;
  id: string;
  ownerUserId: string;
  selections: SavedActivitySelection[];
  title: string;
  updatedAt: string;
};

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function normalizeDayDate(value: string | null | undefined): Date | null {
  if (value === undefined || value === null || value.trim() === "") {
    return null;
  }

  const date = new Date(value.length === 10 ? `${value}T00:00:00.000Z` : value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Saved activity day date is invalid.");
  }

  return date;
}

function normalizeInput(input: SavedActivityDayInput): {
  dayDate: Date | null;
  destinationSlug: string;
  selections: SavedActivitySelectionInput[];
  title: string;
} {
  const destinationSlug = input.destinationSlug.trim();
  const title = input.title.trim();
  if (!destinationSlug || !title) {
    throw new Error("Saved activity day destination and title are required.");
  }

  const selections = [...(input.selections ?? [])].map((selection) => ({
    note: selection.note?.trim() || null,
    placeId: selection.placeId.trim(),
    position: selection.position
  }));
  const positions = new Set<number>();
  const places = new Set<string>();

  for (const selection of selections) {
    if (!isUuid(selection.placeId)) {
      throw new Error("Saved activity selection place IDs must be UUIDs.");
    }
    if (!Number.isInteger(selection.position) || selection.position < 0) {
      throw new Error("Saved activity selection positions must be non-negative integers.");
    }
    if (positions.has(selection.position) || places.has(selection.placeId)) {
      throw new Error("Saved activity selections must have unique positions and places.");
    }
    positions.add(selection.position);
    places.add(selection.placeId);
  }

  return {
    dayDate: normalizeDayDate(input.dayDate),
    destinationSlug,
    selections,
    title
  };
}

function toDayDate(value: Date | null): string | null {
  return value ? value.toISOString().slice(0, 10) : null;
}

type SavedActivityDayRow = {
  createdAt: Date;
  dayDate: Date | null;
  destinationSlug: string;
  id: string;
  ownerUserId: string;
  title: string;
  updatedAt: Date;
};

async function hydrateDay(db: ActorDb["db"], row: SavedActivityDayRow): Promise<SavedActivityDay> {
  const selections = await db
    .select({
      note: savedActivitySelections.note,
      placeId: savedActivitySelections.placeId,
      position: savedActivitySelections.position
    })
    .from(savedActivitySelections)
    .where(eq(savedActivitySelections.savedActivityDayId, row.id))
    .orderBy(asc(savedActivitySelections.position));

  return {
    createdAt: row.createdAt.toISOString(),
    dayDate: toDayDate(row.dayDate),
    destinationSlug: row.destinationSlug,
    id: row.id,
    ownerUserId: row.ownerUserId,
    selections: selections.map((selection) => ({
      note: selection.note,
      placeId: String(selection.placeId),
      position: selection.position
    })),
    title: row.title,
    updatedAt: row.updatedAt.toISOString()
  };
}

async function selectDay(db: ActorDb["db"], dayId: string): Promise<SavedActivityDay | null> {
  const [row] = await db
    .select({
      createdAt: savedActivityDays.createdAt,
      dayDate: savedActivityDays.dayDate,
      destinationSlug: savedActivityDays.destinationSlug,
      id: savedActivityDays.id,
      ownerUserId: savedActivityDays.ownerUserId,
      title: savedActivityDays.title,
      updatedAt: savedActivityDays.updatedAt
    })
    .from(savedActivityDays)
    .where(eq(savedActivityDays.id, dayId))
    .limit(1);

  return row ? hydrateDay(db, row) : null;
}

export async function createPostgresSavedActivityDay(
  input: SavedActivityDayInput,
  actor: DatabaseActor
): Promise<SavedActivityDay> {
  const normalized = normalizeInput(input);

  return withActor(actor, async ({ db }) => {
    const [row] = await db
      .insert(savedActivityDays)
      .values({
        dayDate: normalized.dayDate,
        destinationSlug: normalized.destinationSlug,
        ownerUserId: actor.userId,
        title: normalized.title
      })
      .returning({
        createdAt: savedActivityDays.createdAt,
        dayDate: savedActivityDays.dayDate,
        destinationSlug: savedActivityDays.destinationSlug,
        id: savedActivityDays.id,
        ownerUserId: savedActivityDays.ownerUserId,
        title: savedActivityDays.title,
        updatedAt: savedActivityDays.updatedAt
      });

    if (!row) {
      throw new Error("Failed to create saved activity day.");
    }

    if (normalized.selections.length > 0) {
      await db.insert(savedActivitySelections).values(
        normalized.selections.map((selection) => ({
          note: selection.note,
          placeId: selection.placeId,
          position: selection.position,
          savedActivityDayId: row.id
        }))
      );
    }

    return hydrateDay(db, row);
  });
}

export async function getPostgresSavedActivityDay(dayId: string, actor: DatabaseActor): Promise<SavedActivityDay | null> {
  if (!isUuid(dayId)) {
    return null;
  }

  return withActor(actor, ({ db }) => selectDay(db, dayId));
}

export async function listPostgresSavedActivityDays(limit: number, actor: DatabaseActor): Promise<SavedActivityDay[]> {
  const safeLimit = Math.max(1, Math.min(100, Math.trunc(limit)));

  return withActor(actor, async ({ db }) => {
    const rows = await db
      .select({
        createdAt: savedActivityDays.createdAt,
        dayDate: savedActivityDays.dayDate,
        destinationSlug: savedActivityDays.destinationSlug,
        id: savedActivityDays.id,
        ownerUserId: savedActivityDays.ownerUserId,
        title: savedActivityDays.title,
        updatedAt: savedActivityDays.updatedAt
      })
      .from(savedActivityDays)
      .orderBy(desc(savedActivityDays.createdAt))
      .limit(safeLimit);

    return Promise.all(rows.map((row) => hydrateDay(db, row)));
  });
}

export async function updatePostgresSavedActivityDay(
  dayId: string,
  patch: Partial<SavedActivityDayInput>,
  actor: DatabaseActor
): Promise<SavedActivityDay | null> {
  if (!isUuid(dayId)) {
    return null;
  }

  const normalized = normalizeInput({
    destinationSlug: patch.destinationSlug ?? "saved-day",
    selections: patch.selections,
    title: patch.title ?? "Saved activity day",
    dayDate: patch.dayDate
  });

  return withActor(actor, async ({ db }) => {
    const existing = await selectDay(db, dayId);
    if (!existing) {
      return null;
    }

    const updates: Partial<typeof savedActivityDays.$inferInsert> = {};
    if (patch.destinationSlug !== undefined) updates.destinationSlug = normalized.destinationSlug;
    if (patch.title !== undefined) updates.title = normalized.title;
    if (patch.dayDate !== undefined) updates.dayDate = normalized.dayDate;
    updates.updatedAt = new Date();

    await db.update(savedActivityDays).set(updates).where(eq(savedActivityDays.id, dayId));

    if (patch.selections !== undefined) {
      await db.delete(savedActivitySelections).where(eq(savedActivitySelections.savedActivityDayId, dayId));
      if (normalized.selections.length > 0) {
        await db.insert(savedActivitySelections).values(
          normalized.selections.map((selection) => ({
            note: selection.note,
            placeId: selection.placeId,
            position: selection.position,
            savedActivityDayId: dayId
          }))
        );
      }
    }

    return selectDay(db, dayId);
  });
}

export async function deletePostgresSavedActivityDay(dayId: string, actor: DatabaseActor): Promise<boolean> {
  if (!isUuid(dayId)) {
    return false;
  }

  return withActor(actor, async ({ db }) => {
    const deleted = await db
      .delete(savedActivityDays)
      .where(eq(savedActivityDays.id, dayId))
      .returning({ id: savedActivityDays.id });
    return deleted.length > 0;
  });
}
