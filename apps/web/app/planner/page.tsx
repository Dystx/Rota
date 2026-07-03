import { Metadata } from "next";
import { TopNav } from "../_components/top-nav";
import { PlannerClient } from "./planner-client";

export const metadata: Metadata = {
  title: "Plan a Portugal trip | AI Intent Engine",
  description: "Tell us about your ideal Portugal trip in plain English. We extract dates, regions, pace, and budget before crafting your itinerary.",
  alternates: {
    canonical: "/planner"
  }
};

export default function PlannerPage() {
  return (
    <>
      <TopNav />
      <PlannerClient />
    </>
  );
}