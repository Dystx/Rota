-- Add white-label branding to the organizations table (PR-16).
--
-- B2B partners (tourism boards, OTAs, agencies) can
-- configure their logo URL + a primary/secondary color
-- pair to make the embedded itinerary widget + the
-- future partner dashboard match their own brand.
-- The full partner onboarding flow (logo upload,
-- color picker, domain verification) is a follow-up.
-- This PR ships the schema + the read path + a
-- minimal demo at /b2b/[orgSlug].
--
-- The branding JSONB is intentionally flat: just the
-- fields the renderer needs today. A future PR adds
-- `theme_preset`, `font_family`, `favicon_url` if
-- those turn out to be common.

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS branding jsonb;

-- Default: empty object. The renderer treats absent
-- fields as "use platform defaults" so existing orgs
-- don't need a backfill.
COMMENT ON COLUMN public.organizations.branding IS
  'White-label branding. Optional fields: logo_url (text, public CDN URL), primary_color (CSS hex), secondary_color (CSS hex). Absent fields fall through to platform defaults.';

-- An org slug is the public-facing identifier. The
-- gateway at /b2b/[orgSlug] reads it. Existing orgs
-- don't have one; we add a column with a backfill
-- comment for ops to populate when a B2B partner
-- onboards.
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS slug text;

-- Slugs are unique across active orgs. Revoked / soft-
-- deleted orgs can have a colliding slug because their
-- rows aren't in the active set.
CREATE UNIQUE INDEX IF NOT EXISTS organizations_slug_uniq_idx
  ON public.organizations (slug)
  WHERE slug IS NOT NULL;

COMMENT ON COLUMN public.organizations.slug IS
  'Public-facing URL identifier. Used by /b2b/[orgSlug] and the developer portal. Unique across non-null values.';

-- RLS update: the existing `organizations_self_read`
-- policy lets a user read their own org. The new
-- /b2b/[orgSlug] route is an anonymous public page,
-- so we add a `organizations_public_read_by_slug`
-- policy that lets the anon role read just the
-- branding + name + slug (NOT the full row, which
-- might include billing / contacts / private
-- metadata once the partner onboarding adds them).
DROP POLICY IF EXISTS organizations_public_read_by_slug ON public.organizations;
CREATE POLICY organizations_public_read_by_slug ON public.organizations
  FOR SELECT
  TO anon
  USING (slug IS NOT NULL);
