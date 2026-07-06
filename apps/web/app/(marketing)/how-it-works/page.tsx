import { Metadata } from "next";
import { PageShell, SectionHeading } from "@repo/ui";
import { TopNav } from "../../_components/top-nav";
import { SiteFooter } from "../../_components/site-footer";

export const metadata: Metadata = {
  title: "How It Works | Portugal Travel Concierge",
  description: "Learn how rumia.pt transforms your trip prompt into a validated, cinematic Portugal itinerary.",
  alternates: {
    canonical: "/how-it-works"
  }
};

const flow = [
  {
    title: "1. Prompt & Capture",
    description: "Tell us about your ideal Portugal trip in plain English. We handle the complexity of translating your vision into a structured travel framework."
  },
  {
    title: "2. Schema-Aligned Brief",
    description: "Your prompt is normalized into a structured brief. If any critical travel details are missing—like dates or travel pace—we'll ask focused follow-up questions."
  },
  {
    title: "3. Cinematic Route Preview",
    description: "Experience a rich, cinematic preview of your generated route. Explore daily pacing, region summaries, and core logistics before committing."
  },
  {
    title: "4. Unlock & Human Review",
    description: "Unlock the full itinerary with a single payment. Opt for an expert human review to get personalized local adjustments and insider recommendations."
  },
  {
    title: "5. Export & Travel",
    description: "Return to your account at any time to access your finalized route. Export to map providers or PDF and enjoy a seamless travel experience."
  }
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNav />
      <main
        id="main-content"
        className="flex-1 pt-header-height"
      >
      <PageShell bare>
        <SectionHeading
          eyebrow="The Journey"
          title="From idea to itinerary in five steps"
          description="A deliberate progression that takes the friction out of planning while maintaining high standards for local travel."
          h1={true}
        />
        {/* 5-step flow rendered as a 1-up / 2-up / 5-up grid so all
            steps sit on one row at desktop width. This avoids the
            awkward 3+2 left-aligned bottom row that the shared
            FeatureGrid (lg:grid-cols-3) produced for 5 items. */}
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
          {flow.map((step) => (
            <li key={step.title} className="flex flex-col gap-3">
              <h3 className="font-[family-name:var(--font-rota-display)] text-xl font-medium tracking-tight text-[var(--color-foreground)]">
                {step.title}
              </h3>
              <p className="text-base leading-relaxed text-[var(--color-muted-foreground)]">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </PageShell>
      </main>
      <SiteFooter />
    </div>
  );
}
