"use client";

import { useState, useTransition } from "react";
import { submitSpecialistProfile, type ProfileInput } from "../actions";
import {
  uploadSpecialistPortrait,
  type PortraitUploadResult
} from "../portrait-upload";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@repo/ui";
import { RegionPicker } from "./region-picker";
import { SkillsInput } from "./skills-input";
import { LanguagesPicker } from "./languages-picker";

/** Profile shape read from the server component. The
 *  server reads via `getSpecialistProfileByUserId`;
 *  `null` for new specialists. */
export type SpecialistProfile = {
  id: string;
  fullName: string;
  regionsCovered: readonly string[];
  tier3OnCall: boolean;
  tier4LicensedGuide: boolean;
  rnaatLicenseNumber: string | null;
  isVerified: boolean;
  hourlyRate: number;
  bio: string | null;
  photoUrl: string | null;
};

/** Capabilities seeded by the page (server component)
 *  via `loadSpecialistCapabilities`. `null` for new
 *  specialists. */
export type InitialCapabilities = {
  skills: readonly string[];
  languages: readonly string[];
};

type Props = {
  userId: string;
  initialProfile: SpecialistProfile | null;
  initialCapabilities: InitialCapabilities;
};

export function GuideOnboardingForm({
  userId,
  initialProfile,
  initialCapabilities
}: Props) {
  const [fullName, setFullName] = useState(initialProfile?.fullName ?? "");
  // The form stores synthetic region UUIDs (see
  // `packages/types/src/region-ids.ts`). The RegionPicker
  // presents slugs to the user and emits UUIDs on change,
  // so this state can pass through unchanged to the action.
  const [selectedRegionIds, setSelectedRegionIds] = useState<string[]>(
    () => [...(initialProfile?.regionsCovered ?? [])]
  );
  const [tier3OnCall, setTier3OnCall] = useState(
    initialProfile?.tier3OnCall ?? false
  );
  const [tier4LicensedGuide, setTier4LicensedGuide] = useState(
    initialProfile?.tier4LicensedGuide ?? false
  );
  const [rnaatLicenseNumber, setRnaatLicenseNumber] = useState(
    initialProfile?.rnaatLicenseNumber ?? ""
  );
  const [hourlyRate, setHourlyRate] = useState(
    initialProfile?.hourlyRate ?? 0
  );
  const [bio, setBio] = useState(initialProfile?.bio ?? "");
  const [photoPath, setPhotoPath] = useState(initialProfile?.photoUrl ?? "");
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [photoUploadState, setPhotoUploadState] = useState<
    "idle" | "uploading" | "unavailable" | "error"
  >("idle");
  const [photoUploadMessage, setPhotoUploadMessage] = useState<string | null>(null);
  const [skills, setSkills] = useState<string[]>(
    () => [...initialCapabilities.skills]
  );
  const [languages, setLanguages] = useState<string[]>(
    () => [...initialCapabilities.languages]
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const input: ProfileInput = {
      fullName,
      regionsCovered: selectedRegionIds,
      tier3OnCall,
      tier4LicensedGuide,
      rnaatLicenseNumber: rnaatLicenseNumber.length > 0 ? rnaatLicenseNumber : null,
      hourlyRate,
      bio: bio.length > 0 ? bio : null,
      photoPath: photoPath.length > 0 ? photoPath : "",
      skills,
      languages
    };

    startTransition(async () => {
      const result = await submitSpecialistProfile(input);
      if (result.kind === "ok") {
        setSuccess("Profile saved. Verification review takes ~48h.");
      } else {
        setError(result.message);
      }
    });
  }

  function onPortraitChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoUploadState("uploading");
    setPhotoUploadMessage(null);
    const formData = new FormData();
    formData.set("portrait", file);

    startTransition(async () => {
      const result: PortraitUploadResult = await uploadSpecialistPortrait(formData);
      if (result.kind === "ok") {
        setPhotoPath(result.path);
        setPhotoPreviewUrl(result.signedUrl);
        setPhotoUploadState("idle");
        setPhotoUploadMessage("Portrait uploaded. Save your profile to keep it.");
      } else {
        setPhotoUploadState(result.kind === "unavailable" ? "unavailable" : "error");
        setPhotoUploadMessage(result.message);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4" data-testid="guide-onboarding-form">
      <input type="hidden" name="userId" value={userId} />
      <Card className="bg-white/70">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-foreground">Full name</span>
            <input
              type="text"
              required
              maxLength={255}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="rounded-lg border border-[var(--color-border)] bg-white/80 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light"
              data-testid="guide-onboarding-full-name"
            />
          </label>
          <RegionPicker
            value={selectedRegionIds}
            onChange={setSelectedRegionIds}
            disabled={isPending}
          />
          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-foreground">
              Hourly rate (EUR)
            </span>
            <input
              type="number"
              min={0}
              max={9999.99}
              step={0.5}
              value={hourlyRate}
              onChange={(e) => setHourlyRate(Number(e.target.value))}
              className="rounded-lg border border-[var(--color-border)] bg-white/80 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light"
              data-testid="guide-onboarding-hourly-rate"
            />
            <span className="text-xs text-[var(--color-muted-foreground)]">
              Tier 3 specialists are billed via subscription; the
              rate here is informational. Tier 4 dispatch uses this
              rate.
            </span>
          </label>
        </CardContent>
      </Card>

      <Card className="bg-white/70">
        <CardHeader>
          <CardTitle>About you</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <SkillsInput
            value={skills}
            onChange={setSkills}
            disabled={isPending}
          />
          <LanguagesPicker
            value={languages}
            onChange={setLanguages}
            disabled={isPending}
          />
          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-foreground">
              Short bio
            </span>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={2000}
              rows={4}
              placeholder="A few sentences about your background, specialties, and how you work with travelers."
              className="rounded-lg border border-[var(--color-border)] bg-white/80 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light"
              data-testid="guide-onboarding-bio"
            />
            <span className="text-xs text-[var(--color-muted-foreground)]">
              Shown on your public profile. 2000 character ceiling.
            </span>
          </label>
          <div className="grid gap-2" data-testid="guide-onboarding-photo-upload">
            <span className="text-sm font-medium text-foreground">Portrait</span>
            <div className="flex flex-wrap items-center gap-3">
              {photoPreviewUrl ? (
                <img
                  src={photoPreviewUrl}
                  alt="Portrait preview"
                  className="h-16 w-16 rounded-full object-cover ring-2 ring-ochre-light/60"
                  data-testid="guide-onboarding-photo-preview"
                />
              ) : photoPath ? (
                <span className="grid h-16 w-16 place-items-center rounded-full bg-ochre-light/20 text-center text-[10px] font-medium text-ochre-dark">
                  Portrait saved
                </span>
              ) : null}
              <label className="inline-flex cursor-pointer items-center rounded-lg border border-[var(--color-border)] bg-white/80 px-3 py-2 text-sm font-medium text-foreground transition hover:border-ochre-dark focus-within:ring-2 focus-within:ring-ochre-light">
                <span>{photoUploadState === "uploading" ? "Uploading…" : "Choose portrait"}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={onPortraitChange}
                  disabled={isPending}
                  className="sr-only"
                  data-testid="guide-onboarding-photo-file"
                />
              </label>
            </div>
            <span className="text-xs text-[var(--color-muted-foreground)]">
              JPEG, PNG, or WebP · up to 5 MB. Stored privately in your Rumia profile.
            </span>
            {photoUploadMessage ? (
              <span
                className={`text-xs ${photoUploadState === "error" ? "text-error" : "text-ochre-dark"}`}
                role={photoUploadState === "error" ? "alert" : "status"}
                data-testid="guide-onboarding-photo-status"
              >
                {photoUploadMessage}
              </span>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/70">
        <CardHeader>
          <CardTitle>Tier participation</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={tier3OnCall}
              onChange={(e) => setTier3OnCall(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-accent)]"
              data-testid="guide-onboarding-tier3"
            />
            <span className="grid gap-1">
              <span className="text-sm font-medium text-foreground">
                Tier 3 — Full Remote Support on-call
              </span>
              <span className="text-xs text-[var(--color-muted-foreground)]">
                Join the on-call rota. Drives the MRT &lt; 5m SLA for
                active trips.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={tier4LicensedGuide}
              onChange={(e) => setTier4LicensedGuide(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-accent)]"
              data-testid="guide-onboarding-tier4"
            />
            <span className="grid gap-1">
              <span className="text-sm font-medium text-foreground">
                Tier 4 — Licensed physical guide
              </span>
              <span className="text-xs text-[var(--color-muted-foreground)]">
                Requires a Portugal RNAAT license number. Dispatched
                for in-person guide services.
              </span>
            </span>
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-foreground">
              RNAAT license number
            </span>
            <input
              type="text"
              maxLength={100}
              value={rnaatLicenseNumber}
              onChange={(e) => setRnaatLicenseNumber(e.target.value)}
              disabled={!tier4LicensedGuide}
              className="rounded-lg border border-[var(--color-border)] bg-white/80 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light disabled:opacity-50"
              data-testid="guide-onboarding-rnaat"
            />
            <span className="text-xs text-[var(--color-muted-foreground)]">
              {tier4LicensedGuide
                ? "Required for Tier 4 dispatch. Verified by the platform team within 48h."
                : "Disabled — enable Tier 4 to enter your license number."}
            </span>
          </label>
        </CardContent>
      </Card>

      {initialProfile?.isVerified ? (
        <p className="text-sm text-ochre-dark" data-testid="guide-onboarding-verified">
          ✓ Verified by the platform team
        </p>
      ) : initialProfile ? (
        <p className="text-sm text-[var(--color-muted-foreground)]" data-testid="guide-onboarding-pending">
          Pending verification (typically ~48h)
        </p>
      ) : null}

      {error ? (
        <p
          className="text-sm text-error"
          role="alert"
          data-testid="guide-onboarding-error"
        >
          {error}
        </p>
      ) : null}
      {success ? (
        <p
          className="text-sm text-ochre-dark"
          role="status"
          data-testid="guide-onboarding-success"
        >
          {success}
        </p>
      ) : null}

      <div>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-primary text-on-primary"
          data-testid="guide-onboarding-submit"
        >
          {isPending ? "Saving…" : "Save profile"}
        </Button>
      </div>
    </form>
  );
}
