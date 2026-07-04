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
import {
  getSpecialistCapabilities,
  isPersistenceConfigError,
  listSpecialists,
  type SpecialistCapabilities,
  type SpecialistProfile
} from "@repo/db";
import { getAdminPageAuthContext, isAdminPageAuthContext } from "@/lib/auth/admin";
import { FlipVerificationForm } from "./_components/flip-verification-form";

const DEMO_SPECIALISTS: ReadonlyArray<{
  fullName: string;
  tier3OnCall: boolean;
  tier4LicensedGuide: boolean;
  license: string | null;
  isVerified: boolean;
  hourlyRate: number;
  bio: string | null;
  photoUrl: string | null;
  caps: SpecialistCapabilities;
}> = [
  {
    fullName: "Inês Almeida",
    tier3OnCall: true,
    tier4LicensedGuide: false,
    license: null,
    isVerified: true,
    hourlyRate: 60,
    bio: "Porto-based local food guide with a soft spot for slow Saturdays.",
    photoUrl: null,
    caps: {
      skills: ["Local food", "Old streets", "Family-friendly pacing"],
      languages: ["pt", "en"]
    }
  },
  {
    fullName: "Tomás Costa",
    tier3OnCall: false,
    tier4LicensedGuide: true,
    license: "RNAAT-1029",
    isVerified: true,
    hourlyRate: 95,
    bio: "Licensed for Sintra, Cascais, and the Lisbon coast.",
    photoUrl: "https://example.com/portraits/tomas.jpg",
    caps: {
      skills: ["Sintra Expert", "Coastal itineraries"],
      languages: ["pt", "en", "es"]
    }
  },
  {
    fullName: "Beatriz Silva",
    tier3OnCall: true,
    tier4LicensedGuide: false,
    license: null,
    isVerified: false,
    hourlyRate: 50,
    bio: null,
    photoUrl: null,
    caps: { skills: [], languages: ["pt"] }
  }
];

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
      profiles = await listSpecialists(100, { client: auth.client });
      // One query per specialist for capabilities. For an
      // admin queue capped at 100 rows this is bounded
      // and parallel; the alternative (a single query
      // with `in(specialist_ids)` + group-by-client) is
      // more efficient but adds DB complexity. PR-11d
      // (the matchmaking preview) is the right time to
      // add a batched read helper.
      const caps = await Promise.all(
        profiles.map(async (p) => {
          const c = await getSpecialistCapabilities(p.id, { client: auth.client });
          return [p.id, c] as const;
        })
      );
      capsById = new Map(caps);
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

  const data = profiles.length > 0
    ? profiles
    : DEMO_SPECIALISTS.map((d, i) => ({
        id: `demo-${i}`,
        userId: `demo-${i}`,
        fullName: d.fullName,
        regionsCovered: [] as string[],
        tier3OnCall: d.tier3OnCall,
        tier4LicensedGuide: d.tier4LicensedGuide,
        rnaatLicenseNumber: d.license,
        isVerified: d.isVerified,
        hourlyRate: d.hourlyRate,
        bio: d.bio,
        photoUrl: d.photoUrl,
        createdAt: "2026-07-01T00:00:00Z"
      } satisfies SpecialistProfile));

  // Seed the capabilities map for the demo data so the
  // "Capabilities" column reflects realistic counts when
  // the Supabase env isn't configured.
  if (profiles.length === 0) {
    DEMO_SPECIALISTS.forEach((d, i) => {
      capsById.set(`demo-${i}`, d.caps);
    });
  }

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
