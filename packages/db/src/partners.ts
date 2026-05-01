import { CreatePartnerSchema, PartnerSchema, type CreatePartnerInput, type Partner, type UpdatePartnerInput } from "@repo/types";
import { createAdminClient } from "./index";

type RawPartnerRow = {
  id: string;
  name: string;
  type: string;
  coverage_regions: string[];
  status: string;
  notes: string;
  link: string;
  is_affiliate: boolean;
};

function slugifyPartnerId(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `partner-${Date.now()}`;
}

function parsePartnerRow(row: RawPartnerRow): Partner {
  return PartnerSchema.parse({
    coverageRegions: row.coverage_regions,
    id: row.id,
    isAffiliate: row.is_affiliate,
    link: row.link,
    name: row.name,
    notes: row.notes,
    status: row.status,
    type: row.type
  });
}

export async function listPartners(limit = 100): Promise<Partner[]> {
  const { data, error } = await createAdminClient()
    .from("partners")
    .select("id,name,type,coverage_regions,status,notes,link,is_affiliate")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return ((data as RawPartnerRow[] | null) ?? []).map((row) => parsePartnerRow(row));
}

export async function getPartnerById(id: string): Promise<Partner | null> {
  const { data, error } = await createAdminClient()
    .from("partners")
    .select("id,name,type,coverage_regions,status,notes,link,is_affiliate")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return parsePartnerRow(data as RawPartnerRow);
}

export async function createPartner(input: CreatePartnerInput): Promise<Partner> {
  const partner = CreatePartnerSchema.parse(input);
  const nextId = partner.id?.trim() || slugifyPartnerId(partner.name);

  const { data, error } = await createAdminClient()
    .from("partners")
    .insert({
      coverage_regions: partner.coverageRegions,
      id: nextId,
      is_affiliate: partner.isAffiliate,
      link: partner.link,
      name: partner.name,
      notes: partner.notes,
      status: partner.status,
      type: partner.type
    })
    .select("id,name,type,coverage_regions,status,notes,link,is_affiliate")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create partner.");
  }

  return parsePartnerRow(data as RawPartnerRow);
}

export async function updatePartner(id: string, patch: UpdatePartnerInput): Promise<Partner | null> {
  const nextPatch = CreatePartnerSchema.partial().parse(patch);
  const updates: Record<string, string | string[] | boolean> = {};

  if (nextPatch.name !== undefined) updates.name = nextPatch.name;
  if (nextPatch.type !== undefined) updates.type = nextPatch.type;
  if (nextPatch.coverageRegions !== undefined) updates.coverage_regions = nextPatch.coverageRegions;
  if (nextPatch.status !== undefined) updates.status = nextPatch.status;
  if (nextPatch.notes !== undefined) updates.notes = nextPatch.notes;
  if (nextPatch.link !== undefined) updates.link = nextPatch.link;
  if (nextPatch.isAffiliate !== undefined) updates.is_affiliate = nextPatch.isAffiliate;

  const { data, error } = await createAdminClient()
    .from("partners")
    .update(updates)
    .eq("id", id)
    .select("id,name,type,coverage_regions,status,notes,link,is_affiliate")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return parsePartnerRow(data as RawPartnerRow);
}
