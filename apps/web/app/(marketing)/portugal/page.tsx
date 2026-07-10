import { Metadata } from "next";
import { getPublishedPortugalRegions } from "@/lib/content/portugal-regions";
import { PortugalAtlas } from "./portugal-atlas";

export const metadata: Metadata = {
  title: "Curated Portugal Regions & Experiences | Portugal Travel Concierge",
  description: "Explore Porto, Lisbon, Douro Valley, and more with our curated Portugal-first place base and expert local guidance.",
  alternates: {
    canonical: "/portugal"
  }
};

export default function PortugalPage() {
  return <div className="mx-auto max-w-6xl px-6 py-16"><h1 className="font-display text-5xl text-primary">Portugal, with room to travel well.</h1><p className="mt-4 max-w-2xl text-on-surface-variant">Build a route that respects distance, season, and the way you want to move.</p><div className="mt-12"><PortugalAtlas regions={getPublishedPortugalRegions()} /></div></div>;
}
