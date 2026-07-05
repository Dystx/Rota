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
  const cover = resolveCoverImage(trip.brief as TripBrief);
  const commerce = getTripCommerceState({
    hasHumanReview: trip.hasHumanReview,
    isPaid: trip.isPaid
  });
  const statusTone = STATUS_TONE[trip.status] ?? "soft";

  return (
    <Card
      data-testid={`trip-item-${trip.id}`}
      className="flex flex-col overflow-hidden transition-shadow"
      {...rest}
    >
      {/* Cover image — uses the same `resolveCoverImage` helper as
          the trip hero, so the draft card and the trip page share
          one source of visual identity. If no cover resolves, the
          16:9 area renders the olive-dark placeholder so the card
          has visual weight even before the user has set a cover. */}
      <div
        className="relative w-full aspect-[16/9] bg-gradient-to-br from-primary via-olive-dark to-primary overflow-hidden"
        aria-hidden="true"
      >
        {cover ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={cover}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/50 via-transparent to-transparent" />
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
