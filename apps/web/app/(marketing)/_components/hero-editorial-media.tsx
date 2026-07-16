import * as React from "react";
import { CinematicMedia } from "@repo/ui";
import { CINEMATIC_MEDIA } from "@/content/cinematic-media-manifest";

/**
 * A local poster-backed loop behind the activity question. It is decorative,
 * so the phrase composer remains the only meaningful first-viewport task.
 */
export function HeroEditorialMedia() {
  return (
    <CinematicMedia
      src={CINEMATIC_MEDIA.portugalCover.videoSrc}
      poster={CINEMATIC_MEDIA.portugalCover.posterSrc}
      fallbackSrc={CINEMATIC_MEDIA.portugalCover.fallbackSrc}
      alt=""
      width={CINEMATIC_MEDIA.portugalCover.width}
      height={CINEMATIC_MEDIA.portugalCover.height}
      priority
      loadStrategy={CINEMATIC_MEDIA.portugalCover.loadStrategy}
      pauseWhenHidden={CINEMATIC_MEDIA.portugalCover.pauseWhenHidden}
      textSafeZone={CINEMATIC_MEDIA.portugalCover.textSafeZone}
      decorative
      motionPolicy={CINEMATIC_MEDIA.portugalCover.motionPolicy}
      testId="hero-editorial-media"
      className="absolute inset-0 z-0 h-full w-full"
      posterClassName="object-center opacity-75 mix-blend-screen md:object-[center_58%] md:opacity-70"
      videoClassName="object-center opacity-75 mix-blend-screen md:object-[center_58%] md:opacity-70"
    />
  );
}
