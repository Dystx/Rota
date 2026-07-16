import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  submitSpecialistProfile: vi.fn(),
  uploadSpecialistPortrait: vi.fn()
}));

vi.mock("../actions", () => ({
  submitSpecialistProfile: mocks.submitSpecialistProfile
}));
vi.mock("../portrait-upload", () => ({
  uploadSpecialistPortrait: mocks.uploadSpecialistPortrait
}));
vi.mock("./languages-picker", () => ({
  LanguagesPicker: () => null
}));
vi.mock("./region-picker", () => ({
  RegionPicker: () => null
}));
vi.mock("./skills-input", () => ({
  SkillsInput: () => null
}));

import { GuideOnboardingForm } from "./guide-onboarding-form";

afterEach(() => cleanup());

describe("GuideOnboardingForm recovery", () => {
  test("renders only the fixed retryable message from an unavailable action", async () => {
    mocks.submitSpecialistProfile.mockResolvedValue({
      kind: "unavailable",
      message: "This service is temporarily unavailable. Please try again shortly.",
      retryable: true,
      status: 503
    });

    render(
      <GuideOnboardingForm
        initialCapabilities={{ skills: [], languages: [] }}
        initialProfile={null}
        userId="11111111-1111-4111-8111-111111111111"
      />
    );

    fireEvent.change(screen.getByTestId("guide-onboarding-full-name"), {
      target: { value: "Ana Silva" }
    });
    fireEvent.click(screen.getByTestId("guide-onboarding-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("guide-onboarding-error")).toHaveTextContent(
        "This service is temporarily unavailable. Please try again shortly."
      );
    });
    expect(screen.queryByText(/DATABASE_URL|ECONN|SQL|stack/i)).not.toBeInTheDocument();
  });
});
