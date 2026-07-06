import { Metadata } from "next";
import { PageShell, SectionHeading, FeatureGrid, FeatureGridItem } from "@repo/ui";
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
        <FeatureGrid>
          {flow.map((step) => (
            <FeatureGridItem key={step.title} title={step.title}>
              {step.description}
            </FeatureGridItem>
          ))}
        </FeatureGrid>
      </PageShell>
      </main>
      <SiteFooter />
    </div>
  );
}
