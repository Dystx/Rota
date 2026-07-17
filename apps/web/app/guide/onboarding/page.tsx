import * as React from "react";
import { redirect } from "next/navigation";
import { loadCurrentAuthorizedActorOutcome } from "@/lib/auth/authorization";
import { isSessionProviderFailure, loadSessionOutcome } from "@/lib/auth/session-outcome";
import { getSpecialistProfileByUserId, isPersistenceConfigError, isSchemaDriftError } from "@repo/db";
import { isFeatureEnabled } from "@repo/config";
import { GuideOnboardingForm } from "./_components/guide-onboarding-form";
import { loadSpecialistCapabilities } from "./actions";
import { BetaUnavailablePanel } from "../../_components/beta-unavailable";
import { RouteRecovery } from "../../_components/route-recovery";

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
  const sessionOutcome = await loadSessionOutcome();
  if (sessionOutcome.kind === "unavailable") {
    return <RouteRecovery kind="unavailable" />;
  }
  if (sessionOutcome.kind !== "ready") {
    redirect("/sign-in?next=/guide/onboarding");
  }

  const userId = sessionOutcome.session.user.id;
  const actorOutcome = await loadCurrentAuthorizedActorOutcome(sessionOutcome);
  if (actorOutcome.kind === "unavailable") {
    return <RouteRecovery kind="unavailable" />;
  }
  if (actorOutcome.kind !== "ready" || actorOutcome.actor.userId !== userId) {
    redirect("/sign-in?next=/guide/onboarding");
  }

  if (!isFeatureEnabled("guideBeta")) {
    return (
      <BetaUnavailablePanel
        title="Specialist onboarding is in private beta"
        description="This onboarding flow opens to approved specialists as verification capacity becomes available."
      />
    );
  }

  const actor = actorOutcome.actor;

  let existing;
  let initialCapabilities: { skills: readonly string[]; languages: readonly string[] };
  try {
    existing = await getSpecialistProfileByUserId(userId, { actor });
    // Capabilities (skills + languages) live in a separate table. Only load
    // them when the specialist row exists; a new candidate starts empty.
    initialCapabilities = existing
      ? await loadSpecialistCapabilities(sessionOutcome)
      : { skills: [], languages: [] };
  } catch (error) {
    const unavailable = isPersistenceConfigError(error) || isSchemaDriftError(error) || isSessionProviderFailure(error);
    return <RouteRecovery kind={unavailable ? "unavailable" : "error"} />;
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-container-padding-sm py-16 md:px-container-padding-md">
      <header className="rota-stack-tight mb-6">
        <h1 className="font-headline text-headline-lg text-foreground">
          Specialist onboarding
        </h1>
        <p className="text-on-surface-variant max-w-2xl text-base leading-7">
          Tell us about your practice. Tier 3 (Full Remote Support)
          specialists join the on-call rota; Tier 4 (Licensed Guide)
          requires a Portugal RNAAT license number. Both tiers are
          gated on verification — the platform team reviews your
          profile within 48 hours.
        </p>
      </header>
      <GuideOnboardingForm
        initialProfile={existing}
        initialCapabilities={initialCapabilities}
        userId={userId}
      />
    </div>
  );
}
