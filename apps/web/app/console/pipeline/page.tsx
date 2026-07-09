import { SiteFooter } from "../../_components/site-footer";
import { PipelinePageClient } from "./_components/pipeline-page-client";

export default function ConsolePipelinePage() {
  return (
    <>
      <div className="md:ml-64 min-h-screen flex flex-col bg-background">
        <main
          id="main-content"
          className="flex-1 p-container-padding-lg overflow-hidden flex flex-col"
        >
          <PipelinePageClient />
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
