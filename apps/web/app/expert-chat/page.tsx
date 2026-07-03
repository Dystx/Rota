import { TopNav } from "../_components/top-nav";
import { SiteFooter } from "../_components/site-footer";

/**
 * Expert Chat page — Tier 2 chat surface
 *
 * Source: docs/prototype.html (ExpertChatPage component).
 * Maps to the Tier 2 async chat triage model from docs/spec-v4.md §2.
 */
export default function ExpertChatPage() {
  return (
    <>
      <TopNav />
      <div className="pt-header-height h-screen flex flex-col font-body-md">
        <main className="flex-1 flex overflow-hidden max-w-[1600px] mx-auto w-full">
          <section className="flex-1 flex flex-col bg-surface relative p-4">
            <div className="h-16 flex items-center border-b border-olive-light/10 mb-4">
              <h2 className="font-headline-sm text-primary">
                Chat with Ana (Kyoto Specialist)
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto bg-white/50 rounded-xl p-4 shadow-sm border border-olive-light/10">
              <p className="text-on-surface-variant">Chat messages go here...</p>
            </div>
          </section>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}