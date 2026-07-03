import Link from "next/link";
import { TopNav } from "../_components/top-nav";
import { SiteFooter } from "../_components/site-footer";

/**
 * Planner page — "AI Intent Engine" hero
 *
 * Source: docs/prototype.html (PlannerPage component).
 * Stage 7: added TopNav + SiteFooter for 100% parity with prototype's
 * site shell.
 */
export default function PlannerPage() {
  return (
    <>
      <TopNav />
      <div className="pt-header-height min-h-screen flex flex-col bg-primary text-linen-dark antialiased relative overflow-x-hidden">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center opacity-30 z-[-2]"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCzEwXnJYAipE08VL-hr3P3BYwSrlRjIyjL5sfDtwjoYxB-y51wLp6hsVIk22sgoW6QB09oiy8LenVzi9fTviHSQPR1PvB4UJcUD7zLlT2dC84BS2mwp7ZWu9hplWAo6uCdWwgcDmG3b1FKZ75W8jvqk3YzMBi1EbdIcFAWaXa-RzYOroGe3HPMGsu6CenzluL-SW3IKpNrNvPy9Zl_vljATmBkhPcvvMW-EPyyGy4T036LDJBwqzcFio_a0dcyQ8e12fjvVRPBzsyz')",
          }}
        />
        <header className="fixed top-0 w-full z-50 p-container-padding-lg flex justify-between items-center">
          <Link href="/" className="font-headline-sm text-headline-sm italic text-ochre-light">
            Rumia
          </Link>
          <Link
            href="/"
            className="text-linen-dark opacity-70 hover:opacity-100 transition-opacity"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </Link>
        </header>
        <main className="flex-1 flex items-center justify-center px-container-padding-sm md:px-[48px] z-10 py-header-height">
          <div className="max-w-4xl w-full text-center">
            <div className="bg-glass-dark backdrop-blur-xl border border-white/10 rounded-2xl p-container-padding-lg md:p-[64px] shadow-2xl relative">
              <h1 className="font-headline-lg text-headline-lg md:font-display md:text-display text-linen-dark leading-tight relative z-10 mb-8">
                AI Intent Engine
              </h1>
              <Link
                href="/logistics"
                className="bg-ochre-light text-primary font-label-ui text-label-ui px-8 py-4 rounded-lg shadow-sm hover:shadow-lg inline-flex items-center gap-2"
              >
                Synthesize Itinerary
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}