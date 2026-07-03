import { Metadata } from "next";
import { TopNav } from "../../_components/top-nav";
import { SiteFooter } from "../../_components/site-footer";
import { DiscoveryGlobe } from "./discovery-globe";

export const metadata: Metadata = {
  title: "Explore the world | Rumia Discovery Hub",
  description:
    "An interactive 3D globe for exploring Rumia's travel destinations, live specialist presence, and ambient traveler signals — built on the Spatial Engine.",
  alternates: {
    canonical: "/explore"
  }
};

export default function ExplorePage() {
  return (
    <>
      <TopNav />
      <main className="pt-header-height min-h-screen bg-background text-on-background antialiased">
        <section className="mx-auto grid max-w-7xl gap-12 px-container-padding-sm md:px-[48px] py-section-gap">
          <header className="grid gap-4 text-center md:text-left">
            <p className="font-mono-micro text-mono-micro uppercase tracking-[0.2em] text-ochre-dark">
              Spatial Engine · Discovery Hub
            </p>
            <h1 className="font-display text-display-mobile md:text-display text-primary leading-tight">
              A living atlas for <span className="italic text-ochre-dark">intentional</span> travel.
            </h1>
            <p className="rota-muted text-lg max-w-2xl">
              Built on MapLibre GL JS + CARTO vector tiles. Portugal-first today, world-ready
              tomorrow — every layer, camera move, and live data stream is provider-agnostic.
            </p>
          </header>

          <DiscoveryGlobe />

          <section className="grid gap-8 md:grid-cols-3">
            <article className="rounded-2xl border border-olive-dark/10 bg-linen-dark/70 p-card-padding">
              <p className="font-mono-micro text-mono-micro uppercase tracking-[0.2em] text-ochre-dark mb-2">
                Globe Projection
              </p>
              <h2 className="font-headline-sm text-headline-sm md:font-headline-lg md:text-headline-lg text-primary leading-tight">
                MapLibre setProjection
              </h2>
              <p className="rota-muted text-sm mt-2">
                One call — <code className="font-mono-micro">map.setProjection(&#123; type: "globe" &#125;)</code> —
                turns the flat canvas into a smooth interactive orb with a soft fog halo.
              </p>
            </article>
            <article className="rounded-2xl border border-olive-dark/10 bg-linen-dark/70 p-card-padding">
              <p className="font-mono-micro text-mono-micro uppercase tracking-[0.2em] text-ochre-dark mb-2">
                Live Telemetry
              </p>
              <h2 className="font-headline-sm text-headline-sm md:font-headline-lg md:text-headline-lg text-primary leading-tight">
                Batched setData()
              </h2>
              <p className="rota-muted text-sm mt-2">
                Updates coalesce per animation frame via
                <code className="font-mono-micro"> requestAnimationFrame</code>-equivalent batching, so
                hundreds of pins shift without GPU thrash.
              </p>
            </article>
            <article className="rounded-2xl border border-olive-dark/10 bg-linen-dark/70 p-card-padding">
              <p className="font-mono-micro text-mono-micro uppercase tracking-[0.2em] text-ochre-dark mb-2">
                Layer Registry
              </p>
              <h2 className="font-headline-sm text-headline-sm md:font-headline-lg md:text-headline-lg text-primary leading-tight">
                Provider-agnostic
              </h2>
              <p className="rota-muted text-sm mt-2">
                Today: MapLibre. Tomorrow: deck.gl, CesiumJS, or a custom WebGL adapter — every layer
                speaks the same SpatialLayer contract.
              </p>
            </article>
          </section>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}