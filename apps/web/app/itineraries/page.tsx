import Link from "next/link";
import { TopNav } from "../_components/top-nav";
import { SiteFooter } from "../_components/site-footer";

/**
 * Itineraries page — saved list
 *
 * Source: docs/prototype.html (ItinerariesPage component).
 */
export default function ItinerariesPage() {
  return (
    <>
      <TopNav />
      <div className="pt-header-height min-h-screen flex flex-col font-body-md">
        <main className="flex-1 px-container-padding-sm max-w-7xl mx-auto w-full">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-8">Itineraries</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            <div className="bg-glass-light backdrop-blur-md rounded-xl border border-white/20 shadow-sm p-4">
              <h3 className="font-headline-sm text-primary mb-2">Kyoto Autumn Retreat</h3>
              <p className="text-sm text-on-surface-variant mb-4">7 Days</p>
              <Link href="/vault" className="text-ochre-dark font-label-ui hover:underline">
                View in Vault
              </Link>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}