/**
 * Organization lookups (PR-16).
 *
 * The `organizations` table holds B2B partner
 * records. The auth helper (`@repo/auth`) exposes
 * `auth_org_id()` for RLS; this module exposes the
 * read APIs the public + admin paths consume.
 *
 * Two operations:
 *   - `getOrgBySlug(slug, options?)` — public read for
 *      the /b2b/[orgSlug] demo + the developer portal.
 *   - `getOrgBranding(orgId, options?)` — typed
 *      branding payload (logo URL + colors).
 *
 * The full organization record (name, billing,
 * contacts) is intentionally not exposed here. The
 * public slug-based read returns only the fields a
 * public page needs (name, slug, branding).
 */

import type { DataClientOptions } from "./index";
import { resolveLegacyDataClient } from "./clients";
import { getPostgresOrgBranding, getPostgresOrgBySlug } from "./console-postgres";

export interface OrgBranding {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface PublicOrg {
  id: string;
  name: string;
  slug: string;
  branding: OrgBranding;
}

type RawOrgRow = {
  id: string;
  name: string;
  slug: string | null;
  branding: Record<string, unknown> | null;
};

function parseBranding(raw: Record<string, unknown> | null): OrgBranding {
  if (!raw) return {};
  const out: OrgBranding = {};
  if (typeof raw["logo_url"] === "string") {
    out.logoUrl = raw["logo_url"];
  }
  if (typeof raw["primary_color"] === "string") {
    out.primaryColor = raw["primary_color"];
  }
  if (typeof raw["secondary_color"] === "string") {
    out.secondaryColor = raw["secondary_color"];
  }
  return out;
}

function parseOrgRow(row: RawOrgRow): PublicOrg | null {
  if (!row.slug) return null;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    branding: parseBranding(row.branding)
  };
}

export async function getOrgBySlug(
  slug: string,
  options?: DataClientOptions
): Promise<PublicOrg | null> {
  if (options?.actor || !options?.client) return getPostgresOrgBySlug(slug);

  const { data, error } = await resolveLegacyDataClient(options)
    .from("organizations")
    .select("id,name,slug,branding")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) return null;
  return parseOrgRow(data as RawOrgRow);
}

export async function getOrgBranding(
  orgId: string,
  options?: DataClientOptions
): Promise<OrgBranding> {
  if (options?.actor || !options?.client) return getPostgresOrgBranding(orgId);

  const { data, error } = await resolveLegacyDataClient(options)
    .from("organizations")
    .select("branding")
    .eq("id", orgId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) return {};
  return parseBranding((data as { branding: Record<string, unknown> | null }).branding);
}
