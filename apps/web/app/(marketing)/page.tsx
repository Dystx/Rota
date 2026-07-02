import { Metadata } from "next";
import { PageShell } from "@repo/ui";
import { HomeClient } from "./home-client";

export const metadata: Metadata = {
  title: "No AI chat. Just a calmer, better Portugal route.",
  description: "Experience Portugal with a curated AI travel planning system. No generic chatbots, just structured routes and local quality.",
  alternates: {
    canonical: "/"
  }
};

export default function LandingPage() {
  return (
    <PageShell>
      <HomeClient />
    </PageShell>
  );
}
