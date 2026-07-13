import "server-only";

import {
  CreatePartnerSchema,
  CreateRegionSchema,
  CreateReviewerSchema,
  PartnerSchema,
  RegionSchema,
  ReviewerSchema,
  type CreatePartnerInput,
  type CreateRegionInput,
  type CreateReviewerInput,
  type Partner,
  type Region,
  type Reviewer,
  type UpdatePartnerInput,
  type UpdateRegionInput,
  type UpdateReviewerInput
} from "@repo/types";
import { and, desc, eq, or } from "drizzle-orm";

import { withActor, type DatabaseActor } from "./actor";
import { getDatabase } from "./connection";
import { partners, regions, reviewers } from "./schema";

type CatalogDb = ReturnType<typeof getDatabase> | Parameters<Parameters<ReturnType<typeof getDatabase>["transaction"]>[0]>[0];

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function slugify(value: string, fallback: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `${fallback}-${Date.now()}`;
}

function parseRegion(row: typeof regions.$inferSelect): Region {
  return RegionSchema.parse({
    id: row.id,
    name: row.name,
    countrySlug: row.countrySlug,
    bestFor: row.bestFor,
    seasonality: row.seasonality,
    launchStatus: row.launchStatus,
    description: row.description
  });
}

function parsePartner(row: typeof partners.$inferSelect): Partner {
  return PartnerSchema.parse({
    id: row.id,
    name: row.name,
    type: row.type,
    coverageRegions: row.coverageRegions,
    status: row.status,
    notes: row.notes,
    link: row.link,
    isAffiliate: row.isAffiliate
  });
}

function parseReviewer(row: typeof reviewers.$inferSelect): Reviewer {
  return ReviewerSchema.parse({
    id: row.id,
    name: row.name,
    country: row.country,
    regions: row.regions,
    languages: row.languages,
    specialties: row.specialties,
    status: row.status,
    rating: row.rating,
    bio: row.bio,
    responsePromise: row.responsePromise
  });
}

export async function listPostgresRegions(limit = 100, actor: DatabaseActor): Promise<Region[]> {
  const safeLimit = Math.max(1, Math.min(100, Math.trunc(limit)));
  return withActor(actor, async ({ db }) => {
    const rows = await db.select().from(regions).orderBy(desc(regions.createdAt)).limit(safeLimit);
    return rows.map(parseRegion);
  });
}

export async function getPostgresRegionById(id: string, actor: DatabaseActor): Promise<Region | null> {
  return withActor(actor, async ({ db }) => {
    const [row] = await db.select().from(regions).where(eq(regions.id, id)).limit(1);
    return row ? parseRegion(row) : null;
  });
}

export async function createPostgresRegion(input: CreateRegionInput, actor: DatabaseActor): Promise<Region> {
  const region = CreateRegionSchema.parse(input);
  const id = region.id?.trim() || slugify(region.name, "region");
  return withActor(actor, async ({ db }) => {
    const [row] = await db.insert(regions).values({ ...region, id }).returning();
    if (!row) throw new Error("Failed to create region.");
    return parseRegion(row);
  });
}

export async function updatePostgresRegion(id: string, patch: UpdateRegionInput, actor: DatabaseActor): Promise<Region | null> {
  const next = CreateRegionSchema.partial().parse(patch);
  return withActor(actor, async ({ db }) => {
    const updates: Partial<typeof regions.$inferInsert> = {};
    if (next.name !== undefined) updates.name = next.name;
    if (next.countrySlug !== undefined) updates.countrySlug = next.countrySlug;
    if (next.bestFor !== undefined) updates.bestFor = next.bestFor;
    if (next.seasonality !== undefined) updates.seasonality = next.seasonality;
    if (next.launchStatus !== undefined) updates.launchStatus = next.launchStatus;
    if (next.description !== undefined) updates.description = next.description;
    const [row] = await db.update(regions).set(updates).where(eq(regions.id, id)).returning();
    return row ? parseRegion(row) : null;
  });
}

export async function listPostgresPartners(limit = 100, actor?: DatabaseActor): Promise<Partner[]> {
  const safeLimit = Math.max(1, Math.min(100, Math.trunc(limit)));
  const read = async (db: CatalogDb) => {
    const rows = await db.select().from(partners).orderBy(desc(partners.createdAt)).limit(safeLimit);
    return rows.map(parsePartner);
  };
  if (!actor) return read(getDatabase());
  return withActor(actor, ({ db }) => read(db));
}

export async function getPostgresPartnerById(id: string, actor?: DatabaseActor): Promise<Partner | null> {
  const read = async (db: CatalogDb) => {
    const [row] = await db.select().from(partners).where(eq(partners.id, id)).limit(1);
    return row ? parsePartner(row) : null;
  };
  if (!actor) return read(getDatabase());
  return withActor(actor, ({ db }) => read(db));
}

export async function createPostgresPartner(input: CreatePartnerInput, actor: DatabaseActor): Promise<Partner> {
  const partner = CreatePartnerSchema.parse(input);
  const id = partner.id?.trim() || slugify(partner.name, "partner");
  return withActor(actor, async ({ db }) => {
    const [row] = await db.insert(partners).values({ ...partner, id }).returning();
    if (!row) throw new Error("Failed to create partner.");
    return parsePartner(row);
  });
}

export async function updatePostgresPartner(id: string, patch: UpdatePartnerInput, actor: DatabaseActor): Promise<Partner | null> {
  const next = CreatePartnerSchema.partial().parse(patch);
  return withActor(actor, async ({ db }) => {
    const updates: Partial<typeof partners.$inferInsert> = {};
    if (next.name !== undefined) updates.name = next.name;
    if (next.type !== undefined) updates.type = next.type;
    if (next.coverageRegions !== undefined) updates.coverageRegions = next.coverageRegions;
    if (next.status !== undefined) updates.status = next.status;
    if (next.notes !== undefined) updates.notes = next.notes;
    if (next.link !== undefined) updates.link = next.link;
    if (next.isAffiliate !== undefined) updates.isAffiliate = next.isAffiliate;
    const [row] = await db.update(partners).set(updates).where(eq(partners.id, id)).returning();
    return row ? parsePartner(row) : null;
  });
}

function canManageReviewers(actor: DatabaseActor): boolean {
  return actor.roles.includes("admin") || actor.capabilities.includes("operations:manage");
}

export async function listPostgresReviewers(limit = 100, actor: DatabaseActor): Promise<Reviewer[]> {
  if (!canManageReviewers(actor)) return [];
  const safeLimit = Math.max(1, Math.min(100, Math.trunc(limit)));
  return withActor(actor, async ({ db }) => {
    const rows = await db.select().from(reviewers).orderBy(desc(reviewers.createdAt)).limit(safeLimit);
    return rows.map(parseReviewer);
  });
}

export async function getPostgresReviewerById(id: string, actor: DatabaseActor): Promise<Reviewer | null> {
  return withActor(actor, async ({ db }) => {
    const conditions = [eq(reviewers.id, id)];
    if (uuidPattern.test(id)) conditions.push(eq(reviewers.userId, id));
    const [row] = await db.select().from(reviewers).where(or(...conditions)).limit(1);
    return row ? parseReviewer(row) : null;
  });
}

export async function createPostgresReviewer(input: CreateReviewerInput, actor: DatabaseActor): Promise<Reviewer> {
  if (!canManageReviewers(actor)) throw new Error("Reviewer management requires admin access.");
  const reviewer = CreateReviewerSchema.parse(input);
  const id = reviewer.id?.trim() || slugify(reviewer.name, "reviewer");
  return withActor(actor, async ({ db }) => {
    const [row] = await db.insert(reviewers).values({ ...reviewer, id }).returning();
    if (!row) throw new Error("Failed to create reviewer.");
    return parseReviewer(row);
  });
}

export async function updatePostgresReviewer(id: string, patch: UpdateReviewerInput, actor: DatabaseActor): Promise<Reviewer | null> {
  if (!canManageReviewers(actor)) throw new Error("Reviewer management requires admin access.");
  const next = CreateReviewerSchema.partial().parse(patch);
  return withActor(actor, async ({ db }) => {
    const updates: Partial<typeof reviewers.$inferInsert> = {};
    if (next.name !== undefined) updates.name = next.name;
    if (next.country !== undefined) updates.country = next.country;
    if (next.regions !== undefined) updates.regions = next.regions;
    if (next.languages !== undefined) updates.languages = next.languages;
    if (next.specialties !== undefined) updates.specialties = next.specialties;
    if (next.status !== undefined) updates.status = next.status;
    if (next.rating !== undefined) updates.rating = next.rating;
    if (next.bio !== undefined) updates.bio = next.bio;
    if (next.responsePromise !== undefined) updates.responsePromise = next.responsePromise;
    const [row] = await db.update(reviewers).set(updates).where(eq(reviewers.id, id)).returning();
    return row ? parseReviewer(row) : null;
  });
}
