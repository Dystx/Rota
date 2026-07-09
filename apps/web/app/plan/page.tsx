import { permanentRedirect } from "next/navigation";

/**
 * /plan — the explicit landing for the home-hero CTA.
 * Redirects to /planner (the existing Intent Engine route).
 * Lives as its own route so future PRs can split planning from
 * the rest of the app without breaking the home CTA's href.
 */
export default function PlanPage(): never {
  permanentRedirect("/planner");
}
