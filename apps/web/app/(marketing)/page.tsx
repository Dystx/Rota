import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  PageShell,
  SectionHeading,
  StatPill
} from "@repo/ui";

const principles = [
  "No chatbot interface",
  "Portugal-first itinerary quality",
  "Structured route adjustments",
  "Optional human review trust layer"
];

const roadmapModules = [
  "Consumer trip brief and route view",
  "Reviewer workspace and itinerary polish",
  "Admin places and country controls"
];

export default function LandingPage() {
  return (
    <PageShell>
      <section className="grid gap-16 py-12 lg:py-24 lg:grid-cols-[1.3fr_0.9fr] lg:items-center">
        <div className="space-y-10">
          <Badge>Portugal-first route planning</Badge>
          <div className="space-y-6">
            <h1 className="rota-display max-w-4xl">
              No AI chat.<br />Just a calmer, better<br />Portugal route.
            </h1>
            <p className="rota-muted max-w-2xl text-[19px] leading-relaxed">
              This scaffold follows the roadmap and current Stitch direction:
              editorial storytelling, map-friendly planning, and structured trip
              control instead of open-ended conversation.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Button asChild>
              <Link href="/trip/new">Plan my Portugal trip</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/human-review">See human review layer</Link>
            </Button>
          </div>
        </div>

        <div className="relative lg:pl-10">
          <div className="absolute -inset-4 rounded-[40px] bg-gradient-to-tr from-[rgba(179,232,251,0.15)] to-transparent blur-2xl" />
          <Card className="rota-glass-panel relative z-10">
            <CardHeader className="pb-6 border-b border-[var(--color-border)]/40">
              <StatPill label="Trip brief" value="Step 01" />
              <CardTitle className="pt-4 text-[28px]">Current Stitch direction</CardTitle>
              <CardDescription className="text-base text-[var(--color-foreground)]/80">
                Noto Serif + Inter, airy spacing, calm contrast, map-first cards,
                and a premium local-host tone.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 pt-8 text-[15px] text-[var(--color-foreground)]/70">
              {principles.map((item) => (
                <div key={item} className="rota-list-row group">
                  <span className="rota-dot transition-transform group-hover:scale-125" />
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-8 pt-10 lg:grid-cols-3">
        {roadmapModules.map((item, index) => (
          <Card key={item} className="bg-white/40 hover:bg-white/70 transition-colors">
            <CardHeader className="pb-5">
              <StatPill label={`Surface 0${index + 1}`} value="MVP" />
              <CardTitle className="pt-5 text-2xl leading-tight">{item}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="rota-muted text-[15px]">
                Structured UI shell in place now so the roadmap can grow into
                generation, validation, payment, export, and review flows.
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-12 py-20 lg:grid-cols-[1fr_1.2fr] lg:items-start">
        <div className="space-y-6 lg:sticky lg:top-32">
          <SectionHeading
            eyebrow="How the product should feel"
            title="Quiet intelligence, not assistant theater"
            description="The implementation keeps the product centered on trip briefs, question cards, route pages, and review notes."
          />
        </div>
        <Card className="bg-white/60">
          <CardContent className="grid gap-10 pt-10 md:grid-cols-2">
            <div className="space-y-6">
              <p className="rota-kicker text-[13px] border-b border-[var(--color-border)] pb-3">Build first</p>
              <ul className="rota-stack-list text-[15px] text-[var(--color-foreground)]">
                <li>Landing page</li>
                <li>Portugal trip brief</li>
                <li>Structured follow-up questions</li>
                <li>Generated route and map</li>
              </ul>
            </div>
            <div className="space-y-6">
              <p className="rota-kicker text-[13px] border-b border-[var(--color-border)] pb-3">Do not build first</p>
              <ul className="rota-stack-list text-[15px] text-[var(--color-muted-foreground)]">
                <li>Generic AI chat</li>
                <li>Global destination sprawl</li>
                <li>Subscription billing</li>
                <li>Native app before workflow proof</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>
    </PageShell>
  );
}
