import * as React from "react";
import type { Metadata } from "next";
import { CinematicMedia } from "@repo/ui";

import { REVIEWED_ACTIVITY_SEED } from "@/lib/content/activities";
import { CINEMATIC_MEDIA } from "@/content/cinematic-media-manifest";

import { PortugalAtlas } from "./portugal-atlas";
import { PublicRouteLayout } from "../../_components/public-route-layout";

export const metadata: Metadata = {
  title: "What to do in Portugal",
  description:
    "Browse Rumia’s reviewed Portugal activity collections by the kind of day you want to have.",
  alternates: { canonical: "/portugal" }
};

export default function PortugalPage() {
  return (
    <PublicRouteLayout scene="atlas" surfaceTone="midnight" surfaceTexture="none" footerMode="full">
      <div className="rumia-portugal-page mx-auto max-w-7xl px-6 py-10 md:px-10 md:py-20">
      <header
        data-testid="portugal-atlas-intro"
        className="rumia-portugal-hero relative overflow-hidden rounded-[32px] px-6 py-14 shadow-overlay md:px-12 md:py-20"
      >
        <div className="relative z-10 grid gap-12 md:grid-cols-[minmax(0,1fr)_18rem] md:items-end md:gap-16">
          <div>
            <p className="font-mono-micro text-mono-micro uppercase tracking-[0.22em] text-ochre-light">
              Portugal / reviewed activity atlas
            </p>
            <h1 className="mt-5 max-w-4xl font-display text-5xl leading-[0.98] tracking-[-0.025em] text-linen md:text-8xl">
              What deserves your time in Portugal?
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-linen/75 md:text-xl">
              Start with a part of the country and the kind of time you have.
              Rumia will show the activity decisions worth considering,
              including when to choose something else.
            </p>
          </div>
          <div className="border-l border-ochre-light/35 pl-5 md:mb-1">
            <p className="font-mono-micro text-mono-micro uppercase tracking-[0.2em] text-ochre-light">
              5 regions, one activity-first lens
            </p>
            <p className="mt-3 text-base leading-7 text-linen/70">
              Browse by the time, weather, and energy a day can hold—not by a
              generic route template.
            </p>
            <p className="mt-8 font-mono-micro text-mono-micro uppercase tracking-[0.16em] text-linen/45">
              A field guide for the time you have
            </p>
          </div>
        </div>
        <div className="relative z-10 mt-12 flex items-center gap-3 border-t border-linen/15 pt-4 font-mono-micro text-mono-micro uppercase tracking-[0.18em] text-linen/45">
          <span className="h-px w-10 bg-ochre-light/70" aria-hidden />
          <span>Portugal / 01—05 / activity by activity</span>
        </div>
      </header>

      <div className="rumia-portugal-proof mt-8 grid gap-6 rounded-[22px] border border-midnight/10 px-6 py-6 text-base text-on-surface-variant shadow-flat sm:grid-cols-3 md:px-8">
        <p><span className="font-mono-micro text-mono-micro uppercase tracking-[0.16em] text-primary">Coverage</span><span className="mt-2 block">Portugal-wide collections</span></p>
        <p><span className="font-mono-micro text-mono-micro uppercase tracking-[0.16em] text-primary">Standard</span><span className="mt-2 block">Judgement before inventory</span></p>
        <p><span className="font-mono-micro text-mono-micro uppercase tracking-[0.16em] text-primary">Promise</span><span className="mt-2 block">A better use of the time you have</span></p>
      </div>
      <section aria-label="Portugal field note" className="rumia-portugal-field-note mt-14">
        <div className="mb-5 flex items-end justify-between gap-5 px-1">
          <div>
            <p className="font-mono-micro text-mono-micro uppercase tracking-[0.2em] text-ochre-dark">Field note / 01</p>
            <p className="mt-2 max-w-xl font-display text-3xl leading-tight text-primary md:text-4xl">Let the landscape set the pace.</p>
          </div>
          <p className="hidden max-w-[15rem] text-right text-base leading-7 text-on-surface-variant md:block">A small pause before the atlas begins: one place, one atmosphere, no pressure to fill every hour.</p>
        </div>
        <CinematicMedia
          src={CINEMATIC_MEDIA.douroField.videoSrc}
          poster={CINEMATIC_MEDIA.douroField.posterSrc}
          fallbackSrc={CINEMATIC_MEDIA.douroField.fallbackSrc}
          alt={CINEMATIC_MEDIA.douroField.alt}
          caption={CINEMATIC_MEDIA.douroField.caption}
          credit={CINEMATIC_MEDIA.douroField.attribution}
          width={CINEMATIC_MEDIA.douroField.width}
          height={CINEMATIC_MEDIA.douroField.height}
          sizes="(min-width: 1024px) 1152px, 100vw"
          // Keep the field note poster-first without preloading the large JPEG
          // fallback on every route that prefetches the Portugal chapter.
          priority={false}
          loadStrategy={CINEMATIC_MEDIA.douroField.loadStrategy}
          pauseWhenHidden={CINEMATIC_MEDIA.douroField.pauseWhenHidden}
          textSafeZone={CINEMATIC_MEDIA.douroField.textSafeZone}
          mobileTextSafeZone={CINEMATIC_MEDIA.douroField.mobileTextSafeZone}
          // Portugal's atlas is poster-first; the homepage owns the only
          // autoplay cover loop in the public discovery pair.
          motionPolicy="poster-only"
          className="relative aspect-[4/3] min-h-[22rem] w-full rounded-[28px] shadow-overlay md:aspect-[16/6] md:min-h-[26rem]"
          posterClassName="object-center brightness-[0.8] saturate-[0.88]"
          videoClassName="object-center brightness-[0.8] saturate-[0.88]"
          overlayClassName="bg-gradient-to-t from-midnight/55 via-midnight/10 to-transparent"
          testId="portugal-field-note"
        />
      </section>
      <div className="mt-16">
        <PortugalAtlas activities={REVIEWED_ACTIVITY_SEED} />
      </div>
      </div>
    </PublicRouteLayout>
  );
}
