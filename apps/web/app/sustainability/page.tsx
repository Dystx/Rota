import { Metadata } from "next";
import { LegalPage } from "../_components/legal-page";

export const metadata: Metadata = {
  title: "Sustainability",
  description: "How Rumia thinks about sustainable travel in Portugal.",
  alternates: { canonical: "/sustainability" }
};

export default function SustainabilityPage() {
  return (
    <LegalPage
      scene="cover"
      kicker="Our promise"
      title="Sustainability"
      intro="How Rumia thinks about place, people, and pace without making claims a recommendation cannot support."
      asideTitle="Context over checklists."
      asideText="The guide can help you choose a calmer, more locally grounded day, while leaving the final decision with you."
      asideHref="/portugal"
      asideLinkLabel="Explore Portugal"
    >
      <div className="grid gap-5">
        <p>
          Rumia can surface locally grounded activities and calmer ways to
          spend time in Portugal. We prefer context that helps people make
          thoughtful choices rather than encouraging a checklist of stops.
        </p>
        <p>
          We do not claim that a recommendation is automatically sustainable.
          Conditions, operators, transport, and local impact change; travellers
          should check current information and choose the pace and route that
          fit their circumstances.
        </p>
      </div>
    </LegalPage>
  );
}
