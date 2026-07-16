import Link from "next/link";
import { Metadata } from "next";
import * as React from "react";
import { listCommerceProducts } from "@repo/payments";
import { Button, CinematicMedia, SectionHeading } from "@repo/ui";
import { CINEMATIC_MEDIA } from "@/content/cinematic-media-manifest";
import { EditorialProofRail } from "../_components/editorial-proof-rail";
import { PublicRouteLayout } from "../../_components/public-route-layout";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Optional Portugal activity-day upgrades with clear delivery and limits.",
  alternates: {
    canonical: "/pricing"
  }
};

export default function PricingPage() {
  const products = listCommerceProducts();

  return (
      <PublicRouteLayout scene="utility" surfaceTone="linen" surfaceTexture="none" footerMode="compact">
        <div className="rumia-quiet-page rumia-pricing-page mx-auto grid max-w-6xl gap-20 px-6 py-16 lg:gap-32 lg:px-12 lg:py-24">
        <SectionHeading
          eyebrow="Optional, after your chosen day"
          title="Keep the decisions yours."
          description="Rumia is useful before you pay: compare judged activities, shape a day, and keep the list. Optional upgrades only appear when a saved day is ready for a fuller export or a specialist review."
          h1={true}
        />
        <section
          aria-labelledby="pricing-field-note-title"
          className="grid gap-5"
          data-testid="pricing-field-note"
        >
          <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_minmax(14rem,0.5fr)] md:items-end md:gap-10">
            <div>
              <p className="font-mono-micro text-mono-micro uppercase tracking-[0.2em] text-ochre-dark">
                Field note / optional access
              </p>
              <h2 id="pricing-field-note-title" className="mt-2 max-w-2xl font-display text-3xl leading-tight text-primary md:text-4xl">
                Pay for a clearer day, not a bigger promise.
              </h2>
            </div>
            <p className="max-w-sm text-base leading-7 text-primary/70 md:justify-self-end md:text-right">
              The Douro still sets the tone: leave room around the choices before adding anything paid.
            </p>
          </div>
          <CinematicMedia
            src={CINEMATIC_MEDIA.douroField.videoSrc}
            poster={CINEMATIC_MEDIA.douroField.posterSrc}
            fallbackSrc={CINEMATIC_MEDIA.douroField.fallbackSrc}
            alt={CINEMATIC_MEDIA.douroField.alt}
            caption="A considered day starts with enough room around it."
            credit={CINEMATIC_MEDIA.douroField.attribution}
            width={CINEMATIC_MEDIA.douroField.width}
            height={CINEMATIC_MEDIA.douroField.height}
            sizes="(min-width: 1024px) 1152px, 100vw"
            priority
            motionPolicy="poster-only"
            loadStrategy="eager"
            pauseWhenHidden
            textSafeZone={CINEMATIC_MEDIA.douroField.textSafeZone}
            mobileTextSafeZone={CINEMATIC_MEDIA.douroField.mobileTextSafeZone}
            className="relative aspect-[4/3] min-h-[18rem] w-full rounded-[28px] shadow-overlay md:aspect-[16/6] md:min-h-[22rem]"
            posterClassName="object-center brightness-[0.82] saturate-[0.9]"
            overlayClassName="bg-gradient-to-t from-midnight/65 via-midnight/10 to-transparent"
            testId="pricing-field-note-media"
          />
        </section>
        <EditorialProofRail
          items={[
            { label: "Free first", value: "Explore and shape a day before payment." },
            { label: "Optional upgrades", value: "Export or specialist review only after a saved day." },
            { label: "Independent", value: "No bookings, accommodation search, or on-trip support." }
          ]}
        />
        <div className="rumia-pricing-tiers divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
          <TierRow name="Free activity-day preview" status="included" price="€0" delivery="Reviewed activities, practical context, and a day you can keep changing." limitation="No booking, reservation, or specialist review is implied." href="/explore" action="Explore what to do" />
          {products.map((product) => (
            <TierRow
              key={product.sku}
              status="optional"
              name={product.sku === "full_itinerary_v1" ? "Chosen-day export" : "Optional local review"}
              price={`€${product.unitAmountCents / 100}`}
              delivery={product.sku === "full_itinerary_v1" ? "A fuller saved-day version and export access after payment." : "A Portugal specialist checks pace, pairings, and practical context after export unlock."}
              limitation={product.sku === "full_itinerary_v1" ? "No bookings or accommodation search." : "Only available after the chosen day is unlocked; no bookings or on-trip concierge."}
              href={product.sku === "local_polish_v1" ? "/local-expertise" : "/planner"}
              action={product.sku === "local_polish_v1" ? "Review the boundaries" : "Shape a chosen day"}
            />
          ))}
          <TierRow name="On-trip concierge" status="future" price="Waitlist" delivery="A future higher-touch program, not part of the current Rumia product." limitation="Not available to buy; no on-trip support is promised today." href="/support" action="Ask about future access" />
        </div>
        </div>
      </PublicRouteLayout>
  );
}

function TierRow({ name, status, price, delivery, limitation, href, action }: { name: string; status: "included" | "optional" | "future"; price: string; delivery: string; limitation: string; href: string; action: string }) {
  const statusLabel = status === "included" ? "Included" : status === "optional" ? "Optional" : "Future access";

  return (
    <section
      data-tier-state={status}
      aria-label={`${name} — ${statusLabel}`}
      className="rumia-tier-row grid gap-4 py-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
    >
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
            <p className="font-metadata text-metadata uppercase tracking-[0.16em] text-ochre-dark">
              {statusLabel}
            </p>
            <h2 className="font-display text-2xl text-primary">{name}</h2>
          </div>
          <strong className="text-lg text-primary">{price}</strong>
        </div>
        <p className="mt-2 text-base leading-7 text-on-surface-variant">{delivery}</p>
        <p className="mt-1 text-base leading-7 text-on-surface-variant">{limitation}</p>
      </div>
      <Button asChild variant="ghost">
        <Link href={href}>{action}</Link>
      </Button>
    </section>
  );
}
