import { PipelinePageClient } from "./_components/pipeline-page-client";

export default function ConsolePipelinePage() {
  return (
    <>
      <div className="min-w-0 min-h-screen flex flex-col bg-background overflow-x-hidden">
        <div className="flex-1 min-w-0 p-container-padding-lg overflow-hidden flex flex-col">
          <PipelinePageClient />
        </div>
      </div>
      <style>{`
        .rumia-operator-main ::-webkit-scrollbar { width: 6px; height: 6px; }
        .rumia-operator-main ::-webkit-scrollbar-thumb { background-color: rgba(60, 84, 71, 0.2); border-radius: 9999px; }
        .rumia-operator-main ::-webkit-scrollbar-track { background-color: transparent; }
      `}</style>
    </>
  );
}
