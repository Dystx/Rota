import { SiteFooter } from "../../_components/site-footer";
import { KpiCard } from "../_components/kpi-card";
import { VolumeChart } from "../_components/volume-chart";

const WEEKLY_BARS = [
  { label: "Mon", height: "60%", fill: "bg-olive-light/20" },
  { label: "Tue", height: "80%", fill: "bg-olive-light/35" },
  { label: "Wed", height: "40%", fill: "bg-olive-light/15" },
  { label: "Thu", height: "90%", fill: "bg-olive-light/60", peak: true },
  { label: "Fri", height: "70%", fill: "bg-olive-light/45" },
  { label: "Sat", height: "50%", fill: "bg-olive-light/25" },
  { label: "Sun", height: "85%", fill: "bg-olive-light/55" },
] as const;

const REGIONS = [
  {
    name: "North America",
    active: "412 active trips",
    share: "54%",
    delta: "+2.1%",
    deltaTone: "text-olive-light",
  },
  {
    name: "Europe",
    active: "289 active trips",
    share: "32%",
    delta: "-0.8%",
    deltaTone: "text-on-error-container",
  },
  {
    name: "Asia Pacific",
    active: "104 active trips",
    share: "14%",
    delta: "+5.4%",
    deltaTone: "text-olive-light",
  },
] as const;

export default function ConsoleMetricsPage() {
  return (
    <>
      <div className="min-h-screen flex flex-col bg-background relative">
        <main id="main-content" className="flex-1 md:ml-64 p-container-padding-lg max-w-7xl mx-auto w-full flex flex-col gap-section-gap relative z-10">
          <header className="mb-4">
            <h1 className="font-headline-lg text-headline-lg text-primary">
              Global Metrics Dashboard
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Admin health overview and real-time performance indicators.
            </p>
          </header>

          <section
            aria-label="Key metrics"
            className="grid grid-cols-1 md:grid-cols-3 gap-gutter"
          >
            <KpiCard
              eyebrow="Gross Merchandise Value"
              icon="payments"
              value="$2.4M"
              trend={{ direction: "up", label: "+12.5% MTD", tone: "olive-light" }}
            />
            <KpiCard
              eyebrow="Conversion T1 → T2"
              icon="swap_calls"
              value="42.8%"
              trend={{
                direction: "down",
                label: "-2.1% MTD",
                tone: "on-error-container",
              }}
            />
            <KpiCard
              eyebrow="Specialist SLA Time"
              icon="timer"
              value="1h 14m"
              trend={{
                direction: "down",
                label: "-15m MTD (Improved)",
                tone: "olive-light",
              }}
            />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
            <div className="lg:col-span-2">
              <VolumeChart weekly={[...WEEKLY_BARS]} />
            </div>

            <section className="glass-card rounded-xl p-card-padding flex flex-col gap-2 min-w-0 overflow-hidden">
              <h3 className="font-headline-sm text-headline-sm text-primary mb-2">
                Regional Performance
              </h3>
              <ul className="flex flex-col gap-2">
                {REGIONS.map((region) => (
                  <li
                    key={region.name}
                    className="flex items-center justify-between gap-2 p-3 rounded-lg border border-transparent hover:border-outline/10 hover:bg-surface-variant/50 cursor-pointer focus-within:ring-2 focus-within:ring-ochre-light min-w-0"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-ui text-label-ui text-primary truncate">
                        {region.name}
                      </span>
                      <span className="font-mono-technical text-mono-technical text-on-surface-variant truncate">
                        {region.active}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-label-ui text-label-ui text-primary">
                        {region.share}
                      </span>
                      <span className={`font-mono-technical text-mono-technical ${region.deltaTone}`}>
                        {region.delta}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </section>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}