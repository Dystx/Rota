import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/supabase/server";
import { getSpecialistProfileByUserId } from "@repo/db";
import { GuideOnboardingForm } from "./_components/guide-onboarding-form";

/**
 * Specialist onboarding page. The unified
 * `specialist_profiles` table (replaces the v2 split
 * between `reviewers` and `partners`; see migration
 * 202607022110_create_specialist_profiles.sql) holds
 * one row per human specialist with tier-3 + tier-4
 * flags. This page is the entry point for a new
 * specialist: it captures the profile, validates the
 * tier-4 license constraint, and writes a draft row
 * with `is_verified = false`. An admin flips that flag
 * after KYC + license check.
 *
 * The page is a server component that reads the
 * current user's existing profile (if any) and seeds
 * the form. The form itself is a client component
 * that posts to the server action defined alongside
 * (./actions.ts). RLS on `specialist_profiles` lets
 * the user read their own row; the server action
 * uses the user's session so the write is authorized
 * by RLS (not by service-role).
 */
export default async function GuideOnboardingPage() {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login?next=/guide/onboarding");
  }

  const existing = await getSpecialistProfileByUserId(userId);

  return (
    <main className="rota-page rota-page-pad">
      <header className="rota-stack-tight mb-6">
        <h1 className="font-headline text-headline-lg text-foreground">
          Specialist onboarding
        </h1>
        <p className="rota-muted max-w-2xl text-sm leading-relaxed">
          Tell us about your practice. Tier 3 (Full Remote Support)
          specialists join the on-call rota; Tier 4 (Licensed Guide)
          requires a Portugal RNAAT license number. Both tiers are
          gated on verification — the platform team reviews your
          profile within 48 hours.
        </p>
      </header>
      <GuideOnboardingForm
        initialProfile={existing}
        userId={userId}
      />
    </main>
  );
}
