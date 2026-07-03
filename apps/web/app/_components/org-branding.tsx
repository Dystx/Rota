"use client";

import { useEffect } from "react";
import type { OrgBranding } from "@repo/db";

/**
 * Applies a B2B partner's white-label branding to the
 * current page by writing CSS custom properties on
 * `document.documentElement`. The CSS in
 * `apps/web/app/globals.css` reads `--org-primary` and
 * `--org-secondary` to override the platform defaults
 * for the route's primary/secondary surfaces.
 *
 * Renders nothing. Mount once per /b2b/[orgSlug] page
 * (or per partner-embedded itinerary widget).
 */
export function OrgBrandingApplier({ branding }: { branding: OrgBranding }) {
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const previous = {
      logoUrl: root.style.getPropertyValue("--org-logo-url"),
      primary: root.style.getPropertyValue("--org-primary"),
      secondary: root.style.getPropertyValue("--org-secondary")
    };

    if (branding.logoUrl) {
      root.style.setProperty("--org-logo-url", branding.logoUrl);
    } else {
      root.style.removeProperty("--org-logo-url");
    }
    if (branding.primaryColor) {
      root.style.setProperty("--org-primary", branding.primaryColor);
    } else {
      root.style.removeProperty("--org-primary");
    }
    if (branding.secondaryColor) {
      root.style.setProperty("--org-secondary", branding.secondaryColor);
    } else {
      root.style.removeProperty("--org-secondary");
    }

    return () => {
      // Restore the previous values on unmount so a
      // navigation from /b2b/[orgSlug] back to a
      // non-branded page doesn't leave the variables
      // set.
      for (const [key, value] of Object.entries(previous)) {
        if (value) {
          root.style.setProperty(`--org-${kebab(key)}`, value);
        } else {
          root.style.removeProperty(`--org-${kebab(key)}`);
        }
      }
    };
  }, [branding.logoUrl, branding.primaryColor, branding.secondaryColor]);

  return null;
}

function kebab(camel: string): string {
  return camel.replace(/[A-Z]/gu, (m) => `-${m.toLowerCase()}`);
}
