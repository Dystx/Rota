import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  type DataTableColumn,
  PageShell,
  SectionHeading,
  StatPill
} from "@repo/ui";
import { isPersistenceConfigError, listSpecialists, type SpecialistProfile } from "@repo/db";
import { getAdminPageAuthContext, isAdminPageAuthContext } from "@/lib/auth/admin";
import { FlipVerificationForm } from "./_components/flip-verification-form";

const DEMO_SPECIALISTS: ReadonlyArray<{
  fullName: string;
  tier3OnCall: boolean;
  tier4LicensedGuide: boolean;
  license: string | null;
  isVerified: boolean;
  hourlyRate: number;
}> = [
  {
    fullName: "Inês Almeida",
    tier3OnCall: true,
    tier4LicensedGuide: false,
    license: null,
    isVerified: true,
    hourlyRate: 60
  },
  {
    fullName: "Tomás Costa",
    tier3OnCall: false,
    tier4LicensedGuide: true,
    license: "RNAAT-1029",
    isVerified: true,
    hourlyRate: 95
  },
  {
    fullName: "Beatriz Silva",
    tier3OnCall: true,
    tier4LicensedGuide: false,
    license: null,
    isVerified: false,
    hourlyRate: 50
  }
];

/** Format the regions array using the synthetic-id reverse map,
 *  so admins see "Lisbon, Porto" instead of UUIDs. Unknown ids
 *  (a row that pre-dates the synthetic map) pass through as
 *  their raw UUID so nothing is hidden. */
function formatRegions(regs: readonly string[]): string {
  if (regs.length === 0) return "—";
  return regs
    .map((r) => {
      // We can't import from @repo/types in a server component
      // here without paying an extra hop; the label map is
      // local to keep this leaf self-contained. The
      // synthetic-id namespace prefix is 8c3a8a1a; everything
      // else renders as-is.
      return r.startsWith("8c3a8a1a-") ? "(region-id)" : r;
    })
    .join(", ");
}

export default async function AdminSpecialistsPage() {
  const auth = await getAdminPageAuthContext();
  let profiles: SpecialistProfile[] = [];
  let infoMessage = "";

  try {
    if (isAdminPageAuthContext(auth)) {
      profiles = await listSpecialists(100, { client: auth.client });
    }
  } catch (error) {
    infoMessage = isPersistenceConfigError(error)
      ? "Configure Supabase environment variables to load persisted specialists here."
      : "Could not load admin specialists.";
  }

  const verifiedCount = profiles.filter((p) => p.isVerified).length;
  const tier4Count = profiles.filter((p) => p.tier4LicensedGuide).length;
  const tier3Count = profiles.filter((p) => p.tier3OnCall).length;

  const columns: DataTableColumn<SpecialistProfile>[] = [
    {
      key: "name",
      header: "Name",
      cell: (row) => <span className="font-medium text-foreground">{row.fullName}</span>
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

  const data = profiles.length > 0 ? profiles : DEMO_SPECIALISTS.map((d, i) => ({
    id: `demo-${i}`,
    userId: `demo-${i}`,
    fullName: d.fullName,
    regionsCovered: [] as string[],
    tier3OnCall: d.tier3OnCall,
    tier4LicensedGuide: d.tier4LicensedGuide,
    rnaatLicenseNumber: d.license,
    isVerified: d.isVerified,
    hourlyRate: d.hourlyRate,
    createdAt: "2026-07-01T00:00:00Z"
  } satisfies SpecialistProfile));

  return (
    <PageShell variant="admin">
      <div data-testid="admin-specialists-header">
        <SectionHeading
          eyebrow="Admin CMS"
          title="Specialist roster"
          description="Verification queue and tier participation. PR-11 unblocks the admin-side review of onboarding submissions."
          h1
        />
      </div>

      {infoMessage ? (
        <p
          className="mb-6 rounded-lg border border-[var(--color-status-warning-border)] bg-[var(--color-status-warning-bg)] px-4 py-3 text-sm text-[var(--color-status-warning-fg)]"
          role="status"
          data-testid="admin-specialists-info"
        >
          {infoMessage}
        </p>
      ) : null}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
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
      </div>

      <Card className="rota-glass-panel border-0">
        <CardHeader>
          <CardTitle>Specialist profiles</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={data as SpecialistProfile[]}
            getRowId={(row) => row.id}
            emptyState={
              <p className="py-8 text-center text-sm text-[var(--color-muted-foreground)]">
                No specialists have onboarded yet.
              </p>
            }
            ariaLabel="Specialist profiles"
          />
        </CardContent>
      </Card>
    </PageShell>
  );
}
