import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mediaPreferences = vi.hoisted(() => ({
  prefersReducedMotion: false,
  prefersReducedData: false,
  isLowPower: false
}));

vi.mock("../lib/media-preferences", () => ({
  useMediaPreferences: () => mediaPreferences
}));

import { CinematicMedia } from "./cinematic-media";

describe("CinematicMedia", () => {
  afterEach(() => {
    cleanup();
    mediaPreferences.prefersReducedMotion = false;
    mediaPreferences.prefersReducedData = false;
    mediaPreferences.isLowPower = false;
    vi.unstubAllGlobals();
  });

  it("renders an autoplaying, muted, inline video over a resilient poster", () => {
    render(
      <CinematicMedia
        src="/media/example-loop.mp4"
        poster="/media/example.webp"
        fallbackSrc="/media/example.jpg"
        alt="A Portugal field note"
        caption="A slower way through the day."
        credit="Photo · Rumia"
        width={1600}
        height={1174}
        priority
        testId="cinematic-media"
      />
    );

    const root = screen.getByTestId("cinematic-media");
    const video = root.querySelector("video");
    const source = root.querySelector("video source");

    expect(video).toBeTruthy();
    expect(video?.autoplay).toBe(true);
    expect(video?.muted).toBe(true);
    expect(video?.loop).toBe(true);
    expect(video?.playsInline).toBe(true);
    expect(video?.getAttribute("preload")).toBe("auto");
    expect(source?.getAttribute("src")).toBe("/media/example-loop.mp4");
    expect(source?.getAttribute("type")).toBe("video/mp4");
    expect(video?.getAttribute("aria-hidden")).toBe("true");
    expect(root.querySelector("picture source")?.getAttribute("srcset")).toBe("/media/example.webp");
    expect(screen.getByAltText("A Portugal field note").getAttribute("src")).toBe("/media/example.jpg");
    expect(screen.getByText("A slower way through the day.")).toBeTruthy();
    expect(screen.getByText("Photo · Rumia")).toBeTruthy();
  });

  it("keeps decorative media hidden from assistive technology", () => {
    render(
      <CinematicMedia
        src="/media/example-loop.mp4"
        poster="/media/example.webp"
        alt="Decorative coastline"
        width={1600}
        height={1174}
        decorative
        testId="decorative-cinematic-media"
      />
    );

    const root = screen.getByTestId("decorative-cinematic-media");
    expect(root.getAttribute("aria-hidden")).toBe("true");
    expect(root.querySelector("img")?.getAttribute("alt")).toBe("");
  });

  it("can remain poster-only without changing the image contract", () => {
    render(
      <CinematicMedia
        src="/media/example-loop.mp4"
        poster="/media/example.webp"
        alt="An informative field note"
        width={1600}
        height={1174}
        motionPolicy="poster-only"
        testId="poster-only-media"
      />
    );

    const root = screen.getByTestId("poster-only-media");
    expect(root.getAttribute("data-motion-policy")).toBe("poster-only");
    expect(root.querySelector("video")).toBeNull();
    expect(screen.getByAltText("An informative field note")).toBeTruthy();
  });

  it.each([
    ["reduced motion", "prefersReducedMotion"],
    ["reduced data", "prefersReducedData"],
    ["low power", "isLowPower"]
  ] as const)("removes autoplay for %s preferences", (_label, preference) => {
    mediaPreferences[preference] = true;

    render(
      <CinematicMedia
        src="/media/example-loop.mp4"
        poster="/media/example.webp"
        alt="A preference-safe field note"
        width={1600}
        height={1174}
        priority
        testId="preference-safe-media"
      />
    );

    const root = screen.getByTestId("preference-safe-media");
    expect(root.getAttribute("data-motion-enabled")).toBe("false");
    expect(root.querySelector("video")).toBeNull();
    mediaPreferences[preference] = false;
  });

  it("supports responsive sources and an explicit text-safe zone", () => {
    render(
      <CinematicMedia
        src="/media/example-loop.mp4"
        webmSrc="/media/example-loop.webm"
        mobileSrc="/media/example-loop-mobile.mp4"
        mobileWebmSrc="/media/example-loop-mobile.webm"
        poster="/media/example.webp"
        mobilePoster="/media/example-mobile.webp"
        alt="A responsive Portugal field note"
        width={1600}
        height={1174}
        priority
        loadStrategy="eager"
        textSafeZone={{ x: 0.08, y: 0.12, width: 0.44, height: 0.68 }}
        mobileTextSafeZone={{ x: 0.1, y: 0.52, width: 0.8, height: 0.4 }}
        testId="responsive-cinematic-media"
      />
    );

    const root = screen.getByTestId("responsive-cinematic-media");
    expect(root.getAttribute("data-text-safe-zone")).toBe("8% 12% 44% 68%");
    expect(root.getAttribute("data-mobile-text-safe-zone")).toBe("10% 52% 80% 40%");
    expect(root.querySelector('picture source[media="(max-width: 767px)"]')?.getAttribute("srcset")).toBe("/media/example-mobile.webp");
    expect(root.querySelector('video source[type="video/webm"]')?.getAttribute("src")).toBe("/media/example-loop-mobile.webm");
    expect(root.querySelectorAll('video source')[0]?.getAttribute("src")).toBe("/media/example-loop-mobile.webm");
    expect(root.querySelectorAll('video source')[1]?.getAttribute("src")).toBe("/media/example-loop-mobile.mp4");
    expect(root.querySelectorAll('video source')[2]?.getAttribute("src")).toBe("/media/example-loop.webm");
  });

  it("defers non-priority video until the media approaches the viewport", async () => {
    const observers: Array<{ callback: IntersectionObserverCallback }> = [];
    class FakeIntersectionObserver {
      readonly root = null;
      readonly rootMargin = "";
      readonly thresholds = [0];
      constructor(callback: IntersectionObserverCallback) {
        observers.push({ callback });
      }
      disconnect() {}
      observe() {}
      takeRecords() { return []; }
      unobserve() {}
    }
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);

    render(
      <CinematicMedia
        src="/media/example-loop.mp4"
        poster="/media/example.webp"
        alt="A near viewport field note"
        width={1600}
        height={1174}
        testId="near-viewport-media"
      />
    );

    const root = screen.getByTestId("near-viewport-media");
    expect(root.querySelector("video")).toBeNull();
    observers[0]?.callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    await waitFor(() => expect(root.querySelector("video")).toBeTruthy());
    vi.unstubAllGlobals();
  });

  it("pauses an eager loop when its surface is hidden", () => {
    const observers: Array<{ callback: IntersectionObserverCallback }> = [];
    class FakeIntersectionObserver {
      readonly root = null;
      readonly rootMargin = "";
      readonly thresholds = [0];
      constructor(callback: IntersectionObserverCallback) {
        observers.push({ callback });
      }
      disconnect() {}
      observe() {}
      takeRecords() { return []; }
      unobserve() {}
    }
    const pause = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
    const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);

    render(
      <CinematicMedia
        src="/media/example-loop.mp4"
        poster="/media/example.webp"
        alt="A visibility-aware field note"
        width={1600}
        height={1174}
        priority
        testId="visibility-aware-media"
      />
    );

    observers[0]?.callback([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver);
    expect(pause).toHaveBeenCalled();
    observers[0]?.callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    expect(play).toHaveBeenCalled();

    pause.mockRestore();
    play.mockRestore();
    vi.unstubAllGlobals();
  });
});
