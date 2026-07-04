import { SiteFooter } from "../../_components/site-footer";
import { PipelineBoard } from "../_components/pipeline-board";

const AMBIENT_PATTERN =
  "url(\"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNlOGZmZjAiLz48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSJyZ2JhKDQzLCA2MiwgNTIsIDAuMSkiLz48L3N2Zz4=\")";

export default function ConsolePipelinePage() {
  return (
    <>
      <div className="min-h-screen flex flex-col bg-background">
        <main id="main-content" className="flex-1 md:ml-64 p-container-padding-lg max-h-screen overflow-hidden flex flex-col">
          <header className="mb-section-gap flex flex-col gap-4 md:flex-row md:items-end md:justify-between shrink-0">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-primary">
                Operations Pipeline
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Manage active itineraries and client communications.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="relative">
                <span className="sr-only">Search pipeline</span>
                <span
                  aria-hidden
                  className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
                >
                  search
                </span>
                <input
                  type="search"
                  placeholder="Search threads…"
                  className="font-body-md text-body-md pl-10 pr-4 py-2 rounded-full bg-white/60 border border-white/40 backdrop-blur-md text-primary placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-ochre-light focus:border-ochre-light"
                />
              </label>
              <button
                type="button"
                aria-label="Filter pipeline"
                className="font-label-ui text-label-ui flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-white/40 backdrop-blur-md text-primary hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
              >
                <span className="material-symbols-outlined">tune</span>
                Filter
              </button>
            </div>
          </header>

          <div
            className="flex-1 flex gap-gutter overflow-x-auto pb-4 rounded-xl"
            style={{ backgroundImage: AMBIENT_PATTERN }}
            tabIndex={0}
            role="region"
            aria-label="Operations pipeline board"
          >
            <PipelineBoard />
          </div>
        </main>
        <SiteFooter />
      </div>
      <style>{`
        main ::-webkit-scrollbar { width: 6px; height: 6px; }
        main ::-webkit-scrollbar-thumb { background-color: rgba(60, 84, 71, 0.2); border-radius: 9999px; }
        main ::-webkit-scrollbar-track { background-color: transparent; }
      `}</style>
    </>
  );
}