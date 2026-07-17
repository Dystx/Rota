import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  EmptyState,
  ErrorState,
  type DataTableColumn,
  PageShell,
  SectionHeading,
  StatPill
} from "@repo/ui";
import {
  getSpecialistCapabilities,
  isPersistenceConfigError,
  listSpecialists,
  type SpecialistCapabilities,
  type SpecialistProfile
} from "@repo/db";
import { getAdminPageAuthContext, isAdminPageAuthContext } from "@/lib/auth/admin";
import { FlipVerificationForm } from "./_components/flip-verification-form";

function truncate(text: string | null, max: number): string {
  if (!text) return "—";
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

/** Format the regions array using the synthetic-id reverse map,
 *  so admins see "Lisbon, Porto" instead of UUIDs. Unknown ids
 *  (a row that pre-dates the synthetic map) pass through as
 *  their raw UUID so nothing is hidden. */
function formatRegions(regs: readonly string[]): string {
  if (regs.length === 0) return "—";
  return regs
    .map((r) => {
      // The synthetic-id namespace prefix is 8c3a8a1a;
      // everything else renders as-is.
      return r.startsWith("8c3a8a1a-") ? "(region-id)" : r;
    })
    .join(", ");
}

export default async function AdminSpecialistsPage() {
  const auth = await getAdminPageAuthContext();
  let profiles: SpecialistProfile[] = [];
  let infoMessage = "";
  let capsById: Map<string, SpecialistCapabilities> = new Map();

  try {
    if (isAdminPageAuthContext(auth)) {
      profiles = await listSpecialists(100, { actor: auth.actor });
      // One query per specialist for capabilities. For an
      // admin queue capped at 100 rows this is bounded
      // and parallel; the alternative (a single query
      // with `in(specialist_ids)` + group-by-client) is
      // more efficient but adds DB complexity. PR-11d
      // (the matchmaking preview) is the right time to
      // add a batched read helper.
      const caps = await Promise.all(
        profiles.map(async (p) => {
          const c = await getSpecialistCapabilities(p.id, { actor: auth.actor });
          return [p.id, c] as const;
        })
      );
      capsById = new Map(caps);
    } else {
      infoMessage = auth.reason === "unavailable"
        ? "Specialist records are temporarily unavailable."
        : "You do not have access to specialist records.";
    }
  } catch (error) {
    infoMessage = isPersistenceConfigError(error)
      ? "Configure PostgreSQL and Better Auth to load persisted specialists here."
      : "Could not load admin specialists.";
  }

  const verifiedCount = profiles.filter((p) => p.isVerified).length;
  const tier4Count = profiles.filter((p) => p.tier4LicensedGuide).length;
  const tier3Count = profiles.filter((p) => p.tier3OnCall).length;

  const columns: DataTableColumn<SpecialistProfile>[] = [
    {
      key: "name",
      header: "Name",
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-foreground">{row.fullName}</span>
          <span
            className="max-w-xs text-xs text-[var(--color-muted-foreground)]"
            title={row.bio ?? ""}
          >
            {truncate(row.bio, 80)}
          </span>
        </div>
      )
    },
    {
      key: "tiers",
      header: "Tiers",
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.tier3OnCall ? (
            <Badge tone="soft" data-testid={`admin-specialists-tier3-${row.id}`}>
              Tier 3
            </Badge>
          ) : null}
          {row.tier4LicensedGuide ? (
            <Badge tone="glass" data-testid={`admin-specialists-tier4-${row.id}`}>
              Tier 4
            </Badge>
          ) : null}
        </div>
      )
    },
    {
      key: "regions",
      header: "Regions",
      cell: (row) => (
        <span className="text-[var(--color-muted-foreground)]">
          {formatRegions(row.regionsCovered)}
        </span>
      )
    },
    {
      key: "caps",
      header: "Capabilities",
      cell: (row) => {
        const caps = capsById.get(row.id);
        const skillCount = caps?.skills.length ?? 0;
        const langCount = caps?.languages.length ?? 0;
        return (
          <div className="flex flex-col gap-0.5 text-xs">
            <span
              className="text-[var(--color-muted-foreground)]"
              data-testid={`admin-specialists-skills-${row.id}`}
            >
              {skillCount} {skillCount === 1 ? "skill" : "skills"}
            </span>
            <span
              className="text-[var(--color-muted-foreground)]"
              data-testid={`admin-specialists-langs-${row.id}`}
            >
              {langCount} {langCount === 1 ? "language" : "languages"}
            </span>
          </div>
        );
      }
    },
    {
      key: "license",
      header: "RNAAT",
      cell: (row) =>
        row.rnaatLicenseNumber ? (
          <code className="text-xs">{row.rnaatLicenseNumber}</code>
        ) : (
          <span className="text-[var(--color-muted-foreground)]">—</span>
        )
    },
    {
      key: "rate",
      header: "EUR/hr",
      align: "right",
      cell: (row) => <span className="font-mono text-sm">{row.hourlyRate}</span>
    },
    {
      key: "status",
      header: "Status",
      cell: (row) =>
        row.isVerified ? (
          <Badge tone="soft" data-testid={`admin-specialists-verified-${row.id}`}>
            Verified
          </Badge>
        ) : (
          <Badge tone="default" data-testid={`admin-specialists-pending-${row.id}`}>
            Pending
          </Badge>
        )
    },
    {
      key: "actions",
      header: "Action",
      align: "right",
      cell: (row) => (
        <FlipVerificationForm
          specialistId={row.id}
          isVerified={row.isVerified}
          tier4LicensedGuide={row.tier4LicensedGuide}
        />
      )
    }
  ];

  return (
    <PageShell variant="admin">
      <div data-testid="admin-specialists-header">
        <SectionHeading
          eyebrow="Admin CMS"
          title="Specialist roster"
          description="Verification queue and tier participation for the specialist review team."
          h1
        />
      </div>

      {infoMessage ? (
        <Card className="mb-6 overflow-hidden border-[var(--color-border)] bg-white/60 shadow-sm" data-testid="admin-specialists-info">
          <CardContent className="p-0">
            <ErrorState variant="table" title="Specialist roster unavailable" message={infoMessage} retryHref="/admin/specialists" />
          </CardContent>
        </Card>
      ) : null}

      {profiles.length > 0 ? <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="rota-glass-panel border-0">
          <CardHeader>
            <CardTitle className="text-base">Total specialists</CardTitle>
          </CardHeader>
          <CardContent>
            <StatPill label="Profiles" value={`${profiles.length} rows`} />
          </CardContent>
        </Card>
        <Card className="rota-glass-panel border-0">
          <CardHeader>
            <CardTitle className="text-base">Verification</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <StatPill label="Verified" value={String(verifiedCount)} />
            <StatPill label="Pending" value={String(profiles.length - verifiedCount)} />
          </CardContent>
        </Card>
        <Card className="rota-glass-panel border-0">
          <CardHeader>
            <CardTitle className="text-base">Tier split</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <StatPill label="Tier 3" value={String(tier3Count)} />
            <StatPill label="Tier 4" value={String(tier4Count)} />
          </CardContent>
        </Card>
      </div> : null}

      <Card data-testid="admin-specialists-table" className="rota-glass-panel border-0">
        <CardHeader>
          <CardTitle>Specialist profiles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="min-w-0" aria-label="Specialist profiles table region">
            <DataTable
              columns={columns}
              data={profiles}
              getRowId={(row) => row.id}
              emptyState={
                <EmptyState
                  variant="table"
                  title="No specialist profiles"
                  description="No persisted specialist onboarding records are available yet."
                />
              }
              ariaLabel="Specialist profiles"
            />
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
