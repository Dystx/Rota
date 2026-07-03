import Link from "next/link";
import { TopNav } from "../_components/top-nav";
import { SiteFooter } from "../_components/site-footer";

/**
 * Logistics page — "Will you rent a car?"
 *
 * Source: docs/prototype.html (LogisticsPage component).
 */
export default function LogisticsPage() {
  return (
    <>
      <TopNav />
      <div className="pt-header-height min-h-screen flex flex-col">
        <main className="flex-1 bg-background min-h-screen text-on-background relative overflow-hidden flex flex-col justify-center items-center p-container-padding-sm md:p-container-padding-lg">
          <div className="relative z-10 w-full max-w-2xl mx-auto">
            <div className="bg-glass-light rounded-xl p-8 md:p-12 shadow-2xl flex flex-col gap-8 border border-white/20">
              <header className="text-center">
                <h1 className="font-headline-lg text-headline-lg text-primary mb-2">
                  Will you rent a car?
                </h1>
              </header>
              <div className="flex justify-between items-center mt-4 pt-6 border-t border-olive-dark/10">
                <Link
                  href="/planner"
                  className="font-label-ui text-label-ui text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span> Back
                </Link>
                <Link
                  href="/checkout"
                  className="bg-olive-dark text-on-primary font-label-ui text-label-ui px-6 py-3 rounded-lg hover:bg-primary transition-colors flex items-center gap-2"
                >
                  Continue <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}