import { getOrgBySlug } from "@repo/db";
import { isFeatureEnabled } from "@repo/config";
import { OrgBrandingApplier } from "@/app/_components/org-branding";
import { BetaUnavailable } from "@/app/_components/beta-unavailable";
import { PublicRouteLayout } from "@/app/_components/public-route-layout";

/**
 * Public white-label landing page for a B2B partner.
 *
 * Given `/b2b/<orgSlug>`, reads the org's branding
 * (logo URL + primary/secondary colors) and applies
 * it to the page chrome via CSS custom properties.
 * The full partner onboarding flow (logo upload,
 * color picker, domain verification) is a follow-up.
 * This page is the read path that proves the data
 * model + the CSS plumbing work end-to-end.
 */
export default async function B2BLandingPage({
  params
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  if (!isFeatureEnabled("b2bBeta")) {
    return (
      <BetaUnavailable
        title="Partner workspaces are in private beta"
        description="This organization workspace is not publicly available yet."
      />
    );
  }

  const { orgSlug } = await params;
  const org = await getOrgBySlug(orgSlug);
  if (!org) {
    return (
      <BetaUnavailable
        title="That partner workspace is not available"
        description="This workspace may be invite-only or still being configured. Return to Rumia to explore Portugal planning."
        returnHref="/"
      />
    );
  }

  return (
    <PublicRouteLayout scene="utility" footerMode="none" surfaceTone="linen" surfaceTexture="none">
      <OrgBrandingApplier branding={org.branding} />
      <div className="mx-auto w-full max-w-5xl px-container-padding-sm py-16 md:px-container-padding-md">
        <header className="rota-stack-tight mb-6 flex items-center gap-4">
          {org.branding.logoUrl ? (
            <img
              src={org.branding.logoUrl}
              alt={`${org.name} logo`}
              className="h-10 w-auto"
              data-testid="b2b-logo"
            />
          ) : (
            <div
              className="h-10 w-10 rounded-full bg-[var(--org-primary,var(--color-ochre-dark))]"
              aria-hidden="true"
              data-testid="b2b-logo-placeholder"
            />
          )}
          <h1 className="font-headline text-headline-lg text-foreground">
            {org.name}
          </h1>
        </header>
        <section className="rota-stack-tight max-w-2xl">
          <p className="text-base leading-7 text-foreground">
            Welcome to the private travel workspace for
            <strong className="font-medium"> {org.name}</strong>. Your
            partner&rsquo;s Portugal planning experience is being prepared here.
          </p>
          <dl className="mt-4 grid gap-2 text-sm">
            <div className="grid grid-cols-[8rem_1fr] gap-2 border-b border-[var(--color-border)] py-2">
              <dt className="text-[var(--color-muted-foreground)]">Slug</dt>
              <dd className="font-mono text-xs">{org.slug}</dd>
            </div>
            <div className="grid grid-cols-[8rem_1fr] gap-2 border-b border-[var(--color-border)] py-2">
              <dt className="text-[var(--color-muted-foreground)]">Branding</dt>
              <dd className="font-mono text-xs">Partner workspace theme</dd>
            </div>
            <div className="grid grid-cols-[8rem_1fr] gap-2 border-b border-[var(--color-border)] py-2">
              <dt className="text-[var(--color-muted-foreground)]">Primary</dt>
              <dd className="font-mono text-xs">
                {org.branding.primaryColor ?? "—"}
              </dd>
            </div>
            <div className="grid grid-cols-[8rem_1fr] gap-2 border-b border-[var(--color-border)] py-2">
              <dt className="text-[var(--color-muted-foreground)]">Secondary</dt>
              <dd className="font-mono text-xs">
                {org.branding.secondaryColor ?? "—"}
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </PublicRouteLayout>
  );
}
