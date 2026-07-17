import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getReviewedActivityById, REVIEWED_ACTIVITY_SEED } from "@/lib/content/activities";
import { CinematicMedia } from "@repo/ui";
import { CINEMATIC_MEDIA } from "@/content/cinematic-media-manifest";
import { RouteScene } from "@/app/_components/route-scene";
import { PublicRouteLayout } from "@/app/_components/public-route-layout";

import { ActivityDetailSaveAction } from "./_components/activity-detail-save-action";

export const metadata: Metadata = {
  title: "Activity judgement",
  description: "Rumia’s evidence-led judgement about a Portugal activity and when it is worth your time."
};

function timeLabel(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (hours === 0) return `${remainder} min`;
  if (remainder === 0) return `${hours} hr`;
  return `${hours} hr ${remainder} min`;
}

const ACTIVITY_MEDIA = {
  porto: {
    poster: "/media/unsplash/porto-cobblestone-street.webp",
    fallbackSrc: "/media/unsplash/porto-cobblestone-street.jpg",
    alt: "A quiet, steep cobblestone street in Porto with weathered façades and balconies.",
    caption: "Porto's old streets reward a slower walking pace.",
    credit: "Photo · Cláudio Luiz Castro / Unsplash",
    width: 2400,
    height: 3600,
    motionPolicy: "poster-only" as const
  },
  douro: {
    poster: "/media/unsplash/douro-terraces.webp",
    fallbackSrc: "/media/unsplash/douro-terraces.jpg",
    alt: "Terraced vineyards descending toward the Douro River in northern Portugal.",
    caption: "The Douro is a landscape to leave room around.",
    credit: "Photo · Bruno Ferreira / Unsplash",
    width: 2400,
    height: 1495,
    motionPolicy: "poster-only" as const
  },
  lisbon: {
    poster: "/media/unsplash/portugal-coast-golden-hour.webp",
    fallbackSrc: "/media/unsplash/portugal-coast-golden-hour.jpg",
    alt: "Atlantic seawall and surf at golden hour on the Portuguese coast.",
    caption: "The coast gives a Lisbon day a change of pace.",
    credit: "Photo · Jacek Ulinski / Unsplash",
    width: 2400,
    height: 1761,
    motionPolicy: "poster-only" as const
  },
  algarve: {
    poster: "/media/unsplash/portugal-coast-golden-hour.webp",
    fallbackSrc: "/media/unsplash/portugal-coast-golden-hour.jpg",
    alt: "Atlantic seawall and surf at golden hour on the Portuguese coast.",
    caption: "Choose the coast for the light, not just the landmark.",
    credit: "Photo · Jacek Ulinski / Unsplash",
    width: 2400,
    height: 1761,
    motionPolicy: "poster-only" as const
  },
  azores: {
    poster: "/media/unsplash/portugal-coast-golden-hour.webp",
    fallbackSrc: "/media/unsplash/portugal-coast-golden-hour.jpg",
    alt: "Atlantic seawall and surf at golden hour on the Portuguese coast.",
    caption: "Leave a weather window open for the Atlantic.",
    credit: "Photo · Jacek Ulinski / Unsplash",
    width: 2400,
    height: 1761,
    motionPolicy: "poster-only" as const
  }
} as const;

export default async function ActivityDetailPage({
  params
}: {
  params: Promise<{ activityId: string }>;
}) {
  const { activityId } = await params;
  const activity = getReviewedActivityById(REVIEWED_ACTIVITY_SEED, activityId);
  if (!activity) notFound();
  const alternative = activity.alternativeId
    ? getReviewedActivityById(REVIEWED_ACTIVITY_SEED, activity.alternativeId)
    : null;

  return (
    <PublicRouteLayout scene="cover" surfaceTone="midnight" surfaceTexture="none" footerMode="compact">
      <article
        data-testid="activity-detail-page"
        className="rumia-activity-detail mx-auto max-w-6xl px-4 py-8 pb-20 sm:px-6 sm:py-12 md:py-16"
      >
        <Link
          className="inline-flex min-h-11 items-center text-sm font-medium text-ochre-dark underline decoration-ochre-light underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light"
          href={`/explore?region=${activity.region}`}
        >
          Back to judged activities
        </Link>

        {(() => {
          const media = ACTIVITY_MEDIA[activity.region];
          return (
            <RouteScene
              tone="cover"
              bleed="contained"
              layout="overlay"
              focalLayer="media"
              data-testid="activity-detail-hero"
              className="!mx-0 !max-w-none mt-6 min-h-[clamp(34rem,70vh,46rem)] overflow-hidden rounded-[28px] border border-white/15 shadow-[0_28px_80px_rgba(7,17,19,0.3)] md:mt-8"
              media={(
                <CinematicMedia
                  src={CINEMATIC_MEDIA.portugalCover.videoSrc}
                  poster={media.poster}
                  fallbackSrc={media.fallbackSrc}
                  alt={media.alt}
                  caption={media.caption}
                  credit={media.credit}
                  width={media.width}
                  height={media.height}
                  sizes="(max-width: 768px) 100vw, 1200px"
                  priority
                  motionPolicy={media.motionPolicy}
                  textSafeZone={{ x: 0.06, y: 0.12, width: 0.86, height: 0.78 }}
                  mobileTextSafeZone={{ x: 0.06, y: 0.2, width: 0.88, height: 0.72 }}
                  testId="activity-detail-media"
                  className="relative h-full min-h-[clamp(34rem,70vh,46rem)] w-full bg-midnight/10"
                  posterClassName="object-center brightness-[0.56] saturate-[0.9]"
                  videoClassName="object-center brightness-[0.56] saturate-[0.9]"
                  overlayClassName="bg-gradient-to-t from-midnight/90 via-midnight/25 to-midnight/10"
                />
              )}
              foreground={(
                <header className="flex min-h-[clamp(34rem,70vh,46rem)] items-end px-5 pb-28 pt-10 text-linen-dark sm:px-8 md:px-12 md:pb-32">
                  <div className="max-w-4xl">
                    <p className="font-mono-micro text-mono-micro uppercase tracking-[0.22em] text-ochre-light">
                      Portugal / {activity.region} / activity judgement
                    </p>
                    <h1 className="mt-4 max-w-4xl font-display text-4xl leading-[0.98] text-linen-dark sm:text-5xl md:text-7xl">
                      {activity.title}
                    </h1>
                    <div
                      data-testid="activity-detail-judgement"
                      className="mt-7 max-w-3xl border-t border-ochre-light/50 pt-5"
                    >
                      <p className="font-mono-micro text-mono-micro uppercase tracking-[0.22em] text-ochre-light">
                        Rumia verdict
                      </p>
                      <p className="mt-3 max-w-3xl font-display text-xl leading-tight text-linen-dark sm:text-2xl md:text-3xl">
                        {activity.verdict}
                      </p>
                      <dl className="mt-5 grid gap-4 border-t border-white/20 pt-4 text-base leading-7 text-linen-dark sm:grid-cols-2">
                        <div>
                          <dt className="font-mono-micro text-mono-micro uppercase tracking-[0.16em] text-ochre-light">Time to allow</dt>
                          <dd className="mt-1">{timeLabel(activity.durationMinutes)}</dd>
                        </div>
                        <div>
                          <dt className="font-mono-micro text-mono-micro uppercase tracking-[0.16em] text-ochre-light">Leave room for</dt>
                          <dd className="mt-1">{activity.avoidWhen ?? "The unplanned parts of the day."}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </header>
              )}
              actions={(
                <div className="rumia-activity-detail-save-bar sticky bottom-0 z-20 w-full bg-midnight/90 px-5 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-md sm:px-8 md:static md:bg-transparent md:px-12 md:pb-8 md:pt-3">
                  <div data-testid="activity-detail-primary-action">
                    <ActivityDetailSaveAction
                      activityId={activity.id}
                      activityTitle={activity.title}
                      moods={activity.bestFor}
                      region={activity.region}
                    />
                  </div>
                </div>
              )}
            />
          );
        })()}

        <div className="mt-10 grid gap-10 md:grid-cols-[minmax(0,1fr)_18rem] md:gap-16">
          <div className="rumia-detail-decision border-t border-[var(--color-border)] pt-5">
            <p className="font-mono-micro text-mono-micro uppercase tracking-[0.22em] text-ochre-dark">
              The decision
            </p>
            <p className="mt-3 text-base leading-7 text-on-surface-variant">
              Choose this when the time, pace, and trade-off match the day you
              actually have.
            </p>
            <Link
              className="mt-6 inline-flex min-h-11 items-center border-b border-ochre-dark px-1 py-2 text-sm font-medium text-ochre-dark transition-colors duration-base hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light"
              href={`/explore?region=${activity.region}`}
            >
              Compare with other activities
            </Link>
          </div>
        </div>

      <dl
        data-testid="activity-detail-fact-rail"
        className="rumia-dossier mt-12 grid gap-x-8 gap-y-7 border-y border-[var(--color-border)] py-7 text-base leading-7 text-on-surface-variant sm:grid-cols-2 lg:grid-cols-4"
      >
        <div>
          <dt className="font-mono-micro text-mono-micro uppercase tracking-[0.16em] text-primary">Best for</dt>
          <dd className="mt-2 leading-6">{activity.bestFor.join(" · ")}</dd>
        </div>
        <div>
          <dt className="font-mono-micro text-mono-micro uppercase tracking-[0.16em] text-primary">Time to allow</dt>
          <dd className="mt-2 leading-6">{timeLabel(activity.durationMinutes)}</dd>
        </div>
        <div>
          <dt className="font-mono-micro text-mono-micro uppercase tracking-[0.16em] text-primary">Go when</dt>
          <dd className="mt-2 leading-6">{activity.bestTime}</dd>
        </div>
        <div>
          <dt className="font-mono-micro text-mono-micro uppercase tracking-[0.16em] text-primary">Planning</dt>
          <dd className="mt-2 leading-6">
            {activity.bookingNeed === "essential"
              ? "Plan ahead"
              : activity.bookingNeed === "consider"
                ? "Check ahead"
                : "No advance booking needed"}
          </dd>
        </div>
      </dl>

      <section className="mt-10 grid gap-8 md:grid-cols-2">
        <div className="border-l-2 border-ochre-dark/60 pl-5">
          <p className="font-mono-micro text-mono-micro uppercase tracking-[0.2em] text-ochre-dark">
            Leave room for
          </p>
          <p className="mt-3 text-base leading-7 text-on-surface-variant">
            {activity.avoidWhen ?? "The unplanned parts of the day."}
          </p>
        </div>
        <div className="border-l-2 border-olive-light/50 pl-5">
          <p className="font-mono-micro text-mono-micro uppercase tracking-[0.2em] text-ochre-dark">
            Pair it with
          </p>
          <p className="mt-3 text-base leading-7 text-on-surface-variant">
            {activity.pairWith.join(" · ")}
          </p>
        </div>
      </section>

      <footer className="mt-12 border-t border-[var(--color-border)] pt-6">
        <p className="max-w-2xl text-base leading-relaxed text-on-surface-variant">
          This is Rumia&apos;s editorial judgement. The source below supports
          the underlying place information; it is not a booking relationship or
          a paid placement.
        </p>
        <a
          className="mt-4 inline-flex min-h-11 items-center border-b border-ochre-dark px-1 py-2 text-sm font-medium text-ochre-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light"
          href={activity.evidenceUrl}
          target="_blank"
          rel="noreferrer"
        >
          Read the editorial evidence
        </a>
      </footer>

      {alternative ? (
        <section
          aria-labelledby="activity-detail-next-heading"
          className="rumia-detail-next mt-14 grid gap-6 border-t border-[var(--color-border)] pt-8 md:grid-cols-[minmax(0,1fr)_18rem] md:items-end md:gap-12"
        >
          <div>
            <p className="font-mono-micro text-mono-micro uppercase tracking-[0.2em] text-ochre-dark">
              Continue the judgement
            </p>
            <h2 id="activity-detail-next-heading" className="mt-3 max-w-2xl font-display text-3xl leading-tight text-primary md:text-4xl">
              If this is not the shape of your day, compare it with {alternative.title}.
            </h2>
          </div>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-medium text-linen-dark transition-transform duration-base hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
            href={`/activities/${alternative.id}`}
          >
            Read the alternative
          </Link>
        </section>
      ) : null}
      </article>
    </PublicRouteLayout>
  );
}
