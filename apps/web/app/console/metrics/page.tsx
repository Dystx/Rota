import { ConsoleNav } from "../_components/console-nav";
import { SiteFooter } from "../../_components/site-footer";

export default function ConsoleMetricsPage() {
  return (
    <>
      <ConsoleNav />
      <div className="min-h-screen flex flex-col bg-background">
        <main className="flex-1 md:ml-64 p-container-padding-lg">
          <h2 className="font-headline-lg text-headline-lg text-primary mb-4">
            Metrics Dashboard
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-glass-light p-4 rounded-xl border border-white/20">
              Metric 1
            </div>
            <div className="bg-glass-light p-4 rounded-xl border border-white/20">
              Metric 2
            </div>
            <div className="bg-glass-light p-4 rounded-xl border border-white/20">
              Metric 3
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}