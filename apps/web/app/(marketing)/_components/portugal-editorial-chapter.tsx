import * as React from "react";
import { EditorialMedia } from "@repo/ui";

/** A single full-bleed editorial pause between the explanation and choices. */
export function PortugalEditorialChapter() {
  return (
    <section
      aria-label="A Portugal field note"
      className="rumia-home-editorial-chapter w-full"
    >
      <EditorialMedia
        src="/media/unsplash/douro-terraces-editorial.webp"
        fallbackSrc="/media/unsplash/douro-terraces.jpg"
        alt="Terraced vineyards descending toward the Douro River in northern Portugal."
        caption="A day can be generous without being empty. Leave room around the Douro."
        credit="Photo · Bruno Ferreira / Unsplash"
        width={2400}
        height={1495}
        priority
        sizes="100vw"
        testId="portugal-editorial-chapter"
        className="relative aspect-[4/3] min-h-[22rem] w-full md:aspect-[16/6] md:min-h-[26rem]"
        imageClassName="object-center brightness-[0.82] saturate-[0.9]"
        overlayClassName="bg-gradient-to-t from-midnight/45 via-midnight/5 to-transparent"
      />
    </section>
  );
}
