import { notFound } from "next/navigation";
import { getOrgBySlug } from "@repo/db";
import { isFeatureEnabled } from "@repo/config";
import { OrgBrandingApplier } from "@/app/_components/org-branding";
import { BetaUnavailable } from "@/app/_components/beta-unavailable";

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
    notFound();
  }

  return (
    <>
      <OrgBrandingApplier branding={org.branding} />
      <main className="rota-page rota-page-pad">
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
              className="h-10 w-10 rounded-full bg-var-[--org-primary,var(--color-ochre)]"
              aria-hidden="true"
              data-testid="b2b-logo-placeholder"
            />
          )}
          <h1 className="font-headline text-headline-lg text-foreground">
            {org.name}
          </h1>
        </header>
        <section className="rota-stack-tight max-w-2xl">
          <p className="text-sm leading-relaxed text-foreground">
            This is a white-label landing page for
            <strong className="font-medium"> {org.name}</strong>.
            The branding from the partner's
            <code className="rounded bg-surface-container px-1 py-0.5 text-xs"> organizations.branding</code>
            field is applied to this page via CSS
            custom properties.
          </p>
          <dl className="mt-4 grid gap-2 text-sm">
            <div className="grid grid-cols-[8rem_1fr] gap-2 border-b border-[var(--color-border)] py-2">
              <dt className="text-[var(--color-muted-foreground)]">Slug</dt>
              <dd className="font-mono text-xs">{org.slug}</dd>
            </div>
            <div className="grid grid-cols-[8rem_1fr] gap-2 border-b border-[var(--color-border)] py-2">
              <dt className="text-[var(--color-muted-foreground)]">Logo URL</dt>
              <dd className="font-mono text-xs">
                {org.branding.logoUrl ?? "—"}
              </dd>
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
      </main>
    </>
  );
}
