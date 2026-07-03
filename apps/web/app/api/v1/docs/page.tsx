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
  title: "Developer API — Rumia"
};

export default function DeveloperDocsPage() {
  return (
    <main className="rota-page rota-page-pad">
      <header className="rota-stack-tight mb-6">
        <h1 className="font-headline text-headline-lg text-foreground">
          Rumia API v1
        </h1>
        <p className="rota-muted max-w-2xl text-sm leading-relaxed">
          B2B partner API for the destination knowledge
          graph. Read-only. Authenticated via bearer
          token.
        </p>
      </header>

      <section className="rota-stack-tight mb-6">
        <h2 className="font-headline text-headline-sm text-foreground">
          Authentication
        </h2>
        <pre className="overflow-x-auto rounded-[14px] border border-[var(--color-border)] bg-surface-container p-4 text-xs leading-relaxed">
{`Authorization: Bearer rumia_live_<64 hex chars>`}
        </pre>
        <p className="rota-muted text-sm">
          Request an API key from your partner success
          manager. The raw key is shown once; the platform
          stores only its SHA-256 hash. Revocation is
          immediate.
        </p>
      </section>

      <section className="rota-stack-tight mb-6">
        <h2 className="font-headline text-headline-sm text-foreground">
          GET /api/v1/destinations
        </h2>
        <p className="text-sm text-foreground">
          Returns a paginated list of destinations.
        </p>
        <h3 className="mt-3 text-sm font-medium text-foreground">Query parameters</h3>
        <table className="mt-2 w-full border-collapse text-sm">
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

      <section className="rota-stack-tight">
        <h2 className="font-headline text-headline-sm text-foreground">
          Roadmap
        </h2>
        <p className="rota-muted text-sm">
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
    </main>
  );
}
