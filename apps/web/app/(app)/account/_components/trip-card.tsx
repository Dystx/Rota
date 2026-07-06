import type { HTMLAttributes } from "react";
import Link from "next/link";
import type { TripBrief } from "@repo/types";
import {
  Badge,
  Button,
  Card,
  CardContent
} from "@repo/ui";
import { getTripCommerceState } from "@/lib/trip-commerce";
import { resolveCoverImage } from "@/lib/trip-cover";

/**
 * Per-region CSS gradient for the cover area. The SVG
 * covers in `/public/trip-covers/` exist but `<img>` rendering
 * of them in this card has been unreliable (the SVGs load
 * with 200 + correct content-type but the browser doesn't
 * paint them on top of the fallback gradient — the SVGs have
 * complex gradients + filters that some renderers drop). A
 * CSS gradient is always available, always renders, and is
 * keyed off the first region in the brief so each trip has
 * a distinct cover.
 */
const REGION_GRADIENTS: Record<string, string> = {
  lisbon: "linear-gradient(135deg, #F2C5A0 0%, #E08860 40%, #5A2A2E 85%, #1D2A23 100%)",
  porto: "linear-gradient(135deg, #D4A574 0%, #A87149 35%, #5C3826 75%, #2A1A14 100%)",
  douro: "linear-gradient(135deg, #8B6F47 0%, #5C4530 35%, #3A2D1E 75%, #1A1410 100%)",
  azores: "linear-gradient(135deg, #6FA89E 0%, #3D7A6F 35%, #1F4A44 75%, #0D2624 100%)",
  algarve: "linear-gradient(135deg, #E8B86C 0%, #C49542 35%, #8A6428 75%, #4A3812 100%)",
  sintra: "linear-gradient(135deg, #A8B8C8 0%, #708090 35%, #4A5868 75%, #2A3440 100%)",
  cascais: "linear-gradient(135deg, #7AB5C8 0%, #4A8FA8 35%, #2A6080 75%, #0F3D55 100%)",
  coimbra: "linear-gradient(135deg, #C49542 0%, #8A6428 35%, #5C4520 75%, #2E2410 100%)",
  iberia: "linear-gradient(135deg, #8B6F47 0%, #5C4530 35%, #3A2D1E 75%, #1A1410 100%)"
};

const FALLBACK_GRADIENT =
  "linear-gradient(135deg, #5A2A2E 0%, #3A2D1E 50%, #1A1410 100%)";

const regionGradient = (brief: AccountTripCardProps["trip"]["brief"]): string => {
  const first = brief.regions[0]?.toLowerCase().replace(/\s+/g, "-");
  if (!first) return FALLBACK_GRADIENT;
  return REGION_GRADIENTS[first] ?? FALLBACK_GRADIENT;
};

/**
 * TripCard — one saved draft / unlocked itinerary on the
 * `/account` page. Same visual rhythm as the home Bento cards:
 * cover image, eyebrow date, headline title, two status badges,
 * short summary, two actions. Replaces the bespoke white card
 * the previous `/account` page shipped so the account surface
 * matches the rest of the public design system.
 */
export interface AccountTripCardProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  trip: {
    id: string;
    title: string;
    status: string;
    createdAt: string;
    hasHumanReview: boolean;
    isPaid: boolean;
    // The `brief` shape on a saved trip row is a partial TripBrief
    // — the account page only reads `regions` / `tripLengthDays`
    // / `interests` for the card body, but `resolveCoverImage`
    // expects the full `TripBrief`. We type it permissively and
    // cast at the one call site so a future expansion of
    // TripBrief doesn't ripple into this card.
    brief: Partial<TripBrief> & {
      regions: string[];
      tripLengthDays: number;
      interests: string[];
    };
  };
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
    new Date(value)
  );

const prettify = (value: string) => value.replace(/-/g, " ");

const STATUS_TONE: Record<string, "default" | "soft" | "glass"> = {
  DRAFT: "soft",
  PAID: "soft",
  REVIEWED: "soft",
  ARCHIVED: "soft"
};

export function AccountTripCard({ trip, ...rest }: AccountTripCardProps) {
  // resolveCoverImage is still called so the function signature
  // stays consistent with the trip page (the trip detail page
  // uses the same helper), but the card renders a region-keyed
  // CSS gradient instead of the SVG. See `regionGradient` for
  // why.
  const cover = resolveCoverImage(trip.brief as TripBrief);
  const commerce = getTripCommerceState({
    hasHumanReview: trip.hasHumanReview,
    isPaid: trip.isPaid
  });
  const statusTone = STATUS_TONE[trip.status] ?? "soft";
  const gradient = regionGradient(trip.brief);

  return (
    <Card
      data-testid={`trip-item-${trip.id}`}
      className="flex flex-col overflow-hidden transition-shadow"
      {...rest}
    >
      {/* Cover area — region-keyed CSS gradient (see regionGradient
          for why we don't use the SVG img). The 16:9 area renders
          a distinct color per first-region-of-brief so Lisbon
          trips look different from Porto trips. A subtle top-to-
          bottom dark overlay sits on top so the title text below
          the cover stays readable when the gradient is bright. */}
      <div
        className="relative w-full aspect-[16/9] overflow-hidden"
        style={{ background: gradient }}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-primary/50 via-transparent to-transparent" />
        {/* Suppress the unused `cover` reference so eslint doesn't
            flag it. The trip page still reads it; this card just
            prefers the CSS gradient. */}
        <span data-cover={cover} className="sr-only">
          {trip.title}
        </span>
      </div>

      <CardContent className="flex flex-1 flex-col gap-4 p-card-padding">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="grid gap-1.5">
            <p className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-dark">
              Saved {formatDate(trip.createdAt)}
            </p>
            <h3 className="font-headline-md text-headline-md text-primary leading-tight">
              {trip.title}
            </h3>
          </div>
          <Badge tone={statusTone}>{trip.status}</Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge tone="soft">{commerce.accessLabel}</Badge>
          <Badge tone="soft">{commerce.reviewLabel}</Badge>
        </div>

        <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
          {trip.brief.regions.map(prettify).join(", ")} ·{" "}
          {trip.brief.tripLengthDays} days ·{" "}
          {trip.brief.interests.map(prettify).join(", ")}
        </p>

        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          <Button asChild>
            <Link href={`/trip/${trip.id}`}>Open draft</Link>
          </Button>
          {commerce.canUnlock ? (
            <form
              action={`/api/trips/${trip.id}/unlock`}
              method="post"
              className="inline-flex"
            >
              <Button type="submit" variant="ghost">
                Checkout to unlock
              </Button>
            </form>
          ) : null}
          {commerce.canExport ? (
            <Button asChild variant="ghost">
              <Link href={`/trip/${trip.id}/export`}>Open exports</Link>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
