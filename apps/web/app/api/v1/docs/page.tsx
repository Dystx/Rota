import * as React from "react";
import { isFeatureEnabled } from "@repo/config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DecisionStatePanel, OperatorShell } from "@repo/ui";
import { requirePageAccess, requirementForHttpRoute } from "@/lib/auth/page-access";
import { loadSessionOutcome } from "@/lib/auth/session-outcome";
import { RouteRecovery } from "@/app/_components/route-recovery";

/**
 * B2B developer portal docs (PR-15).
 *
 * The minimum-viable developer portal: a static
 * page that documents the v1 API contract. The full
 * portal (signup, key issuance, usage dashboard)
 * is a follow-up PR that wires the api_keys table
 * to a sign-up flow + a billing/usage view.
 *
 * This page is the "what does the v1 API look like
 * today?" reference. The next PR adds the
 * "request a key" form + a "my keys" dashboard.
 */

export const metadata = {
  title: "Developer API"
};

export default async function DeveloperDocsPage() {
  const headerList = await headers();
  const currentPath = headerList.get("x-pathname") ?? headerList.get("next-url") ?? "/api/v1/docs";
  const access = await requirePageAccess(requirementForHttpRoute(currentPath) ?? { anyRole: ["admin"], allCapabilities: ["developer_docs:read"] });

  if (access.kind === "unavailable") {
    return <RouteRecovery kind="unavailable" landmark="document" />;
  }
  if (access.kind === "unauthenticated") {
    redirect(`/sign-in?next=${encodeURIComponent(currentPath)}`);
  }
  if (access.kind === "forbidden") {
    return (
      <main id="main-content" data-scene="utility" data-surface-texture="none" className="min-h-screen bg-linen px-6 py-16">
        <DecisionStatePanel
          kind="error"
          tone="light"
          headingLevel={1}
          title="Developer documentation is restricted"
          description="This reference is only available to approved developer sessions."
        />
      </main>
    );
  }

  const sessionOutcome = await loadSessionOutcome();
  if (sessionOutcome.kind !== "ready") {
    return <RouteRecovery kind="unavailable" landmark="document" />;
  }
  const docsEnabled = isFeatureEnabled("apiDocs");

  return (
    <OperatorShell
      section="developer"
      currentPath={currentPath}
      capabilities={access.actor.capabilities}
      user={{
        name: sessionOutcome.session.user.name || sessionOutcome.session.user.email || "Developer",
        email: sessionOutcome.session.user.email ?? null,
        avatarUrl: sessionOutcome.session.user.image ?? null
      }}
      signOutAction="/api/auth/sign-out"
    >
      {!docsEnabled ? (
        <DecisionStatePanel
          kind="unavailable"
          tone="light"
          headingLevel={1}
          title="Developer API docs are paused"
          description="ENABLE_API_DOCS is disabled for this environment. No developer reference or key action is exposed."
        />
      ) : (
      <div id="developer-api-docs" data-testid="developer-api-docs" className="rumia-api-docs-page grid min-w-0 gap-8 text-on-surface">
      <header className="grid gap-4 border-l-2 border-ochre-dark/60 pl-5 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:items-end md:gap-12">
        <div>
        <p className="rumia-type-label text-ochre-on-light">Developer surface · v1</p>
        <h1 className="mt-3 rumia-type-display text-4xl text-primary md:text-6xl">
          Rumia API v1
        </h1>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-on-surface-variant md:text-lg">
          B2B partner API for the destination knowledge
          graph. The gateway is temporarily paused while
          its API-key ledger moves to private PostgreSQL.
        </p>
      </header>

      <nav aria-label="API documentation sections" className="sticky top-4 z-10 flex min-w-0 flex-wrap gap-2 rounded-xl border border-olive-light/15 bg-white/80 p-3 backdrop-blur-md md:gap-4">
        <a href="#authentication-heading" className="min-h-11 rounded-full border border-primary/20 px-4 py-2 text-sm text-primary hover:bg-primary/5">Authentication</a>
        <a href="#destinations-heading" className="min-h-11 rounded-full border border-primary/20 px-4 py-2 text-sm text-primary hover:bg-primary/5">Destinations</a>
        <a href="#roadmap-heading" className="min-h-11 rounded-full border border-primary/20 px-4 py-2 text-sm text-primary hover:bg-primary/5">Roadmap</a>
      </nav>

      <section className="grid gap-5 rounded-[var(--rumia-radius-dossier)] border border-[var(--rumia-border-subtle)] bg-white/65 p-5 shadow-[var(--rumia-shadow-dossier)] backdrop-blur-sm md:p-8" aria-labelledby="authentication-heading">
        <h2 id="authentication-heading" className="rumia-type-section text-2xl text-primary">
          Authentication
        </h2>
        <pre className="whitespace-pre-wrap break-words rounded-[14px] border border-[var(--color-border)] bg-surface-container p-4 text-xs leading-relaxed">
{`Authorization: Bearer rumia_live_<64 hex chars>`}
        </pre>
        <p className="text-on-surface-variant leading-loose text-sm">
          Request an API key from your partner success
          manager. The raw key is shown once; the platform
          stores only its SHA-256 hash. Revocation is
          immediate.
        </p>
      </section>

      <section className="grid gap-5 rounded-[var(--rumia-radius-dossier)] border border-[var(--rumia-border-subtle)] bg-white/65 p-5 shadow-[var(--rumia-shadow-dossier)] backdrop-blur-sm md:p-8" aria-labelledby="destinations-heading">
        <h2 id="destinations-heading" className="rumia-type-section text-2xl text-primary">
          GET /api/v1/destinations
        </h2>
        <p className="text-sm text-foreground">
          Returns a paginated list of destinations once the
          PostgreSQL API-key and rate-limit gates are enabled.
        </p>
        <h3 className="mt-3 text-sm font-medium text-foreground">Query parameters</h3>
        <div className="max-w-full overflow-x-auto rounded-lg border border-[var(--color-border)]">
        <table className="mt-2 min-w-[38rem] w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left">
              <th className="py-2 pr-4 font-medium text-foreground">Param</th>
              <th className="py-2 pr-4 font-medium text-foreground">Type</th>
              <th className="py-2 pr-4 font-medium text-foreground">Default</th>
              <th className="py-2 pr-4 font-medium text-foreground">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[var(--color-border)]">
              <td className="py-2 pr-4 font-mono text-xs">region</td>
              <td className="py-2 pr-4 text-xs">string</td>
              <td className="py-2 pr-4 text-xs">—</td>
              <td className="py-2 pr-4 text-xs">Filter by region slug (e.g. <code>lisbon</code>).</td>
            </tr>
            <tr className="border-b border-[var(--color-border)]">
              <td className="py-2 pr-4 font-mono text-xs">limit</td>
              <td className="py-2 pr-4 text-xs">int (1-100)</td>
              <td className="py-2 pr-4 text-xs">20</td>
              <td className="py-2 pr-4 text-xs">Page size.</td>
            </tr>
            <tr className="border-b border-[var(--color-border)]">
              <td className="py-2 pr-4 font-mono text-xs">offset</td>
              <td className="py-2 pr-4 text-xs">int (0-10000)</td>
              <td className="py-2 pr-4 text-xs">0</td>
              <td className="py-2 pr-4 text-xs">Page offset.</td>
            </tr>
          </tbody>
        </table>
        </div>

        <h3 className="mt-4 text-sm font-medium text-foreground">Response</h3>
        <pre className="overflow-x-auto rounded-[14px] border border-[var(--color-border)] bg-surface-container p-4 text-xs leading-relaxed">
{`{
  "destinations": [
    {
      "id": "uuid",
      "name": "Miradouro da Vitória",
      "region": "lisbon",
      "category": "tourism/viewpoint",
      "quality": 5,
      "source_confidence": 0.92
    }
  ],
  "page": { "limit": 20, "offset": 0 },
  "org_id": "uuid"
}`}
        </pre>

        <h3 className="mt-4 text-sm font-medium text-foreground">Status codes</h3>
        <ul className="ml-5 list-disc text-sm">
          <li><code>200</code> — ok</li>
          <li><code>400</code> — invalid query (limit out of range, etc.)</li>
          <li><code>401</code> — missing or invalid API key, or revoked</li>
          <li><code>500</code> — server error</li>
        </ul>
      </section>

      <section className="grid gap-5 rounded-[var(--rumia-radius-dossier)] border border-ochre-dark/25 bg-ochre-light/10 p-5 md:p-8" aria-labelledby="roadmap-heading">
        <h2 id="roadmap-heading" className="rumia-type-section text-2xl text-primary">
          Roadmap
        </h2>
        <p className="text-on-surface-variant leading-loose text-sm">
          v1 is read-only and unscoped per org. The
          following are planned for v2:
        </p>
        <ul className="ml-5 list-disc text-sm">
          <li>Org-scoped destinations (per B2B partner's curated subset)</li>
          <li>POST /api/v1/destinations (curated-subset write path)</li>
          <li>Rate limit headers + per-key quota dashboard</li>
          <li>Webhook subscriptions for trip-status changes</li>
        </ul>
      </section>
      </div>
      )}
    </OperatorShell>
  );
}
