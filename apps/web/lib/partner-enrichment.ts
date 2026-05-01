import type { Partner } from "@repo/types";

function normalizeCoverageValue(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function partnerStatusRank(status: string) {
  if (status === "Active") return 0;
  if (status === "Candidate") return 1;
  if (status === "Research") return 2;
  return 3;
}

export function selectRelevantPartners(partners: Partner[], routeRegions: string[], country?: string, limit = 3) {
  const normalizedRouteRegions = new Set(
    [...routeRegions, country ?? ""]
      .map((value) => normalizeCoverageValue(value))
      .filter(Boolean)
  );

  return partners
    .filter((partner) => {
      if (!partner.link.trim()) {
        return false;
      }

      return partner.coverageRegions.some((region) => {
        const normalizedRegion = normalizeCoverageValue(region);

        return normalizedRegion === "portugal" || normalizedRouteRegions.has(normalizedRegion);
      });
    })
    .sort((left, right) => partnerStatusRank(left.status) - partnerStatusRank(right.status) || left.name.localeCompare(right.name))
    .slice(0, limit);
}

export function buildPartnerClickHref({
  partnerId,
  source,
  target,
  tripId
}: {
  partnerId: string;
  source: string;
  target: string;
  tripId: string;
}) {
  const params = new URLSearchParams({
    partnerId,
    source,
    target,
    tripId
  });

  return `/api/partner-clicks?${params.toString()}`;
}
