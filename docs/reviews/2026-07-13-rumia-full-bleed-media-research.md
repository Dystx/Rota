# Rumia full-bleed media research and design direction

**Date:** 2026-07-13
**Status:** Evidence and planning input for the canonical frontend plan
**Scope:** Portugal-wide, activity-first Rumia; no booking, accommodation search,
travel-agency flow, or chatbot surface.

## Decision in one sentence

Rumia needs stronger photographic sense of place, but it should use full-bleed
media as a small number of editorial anchors—home cover, activity detail,
chapter breaks, and a chosen-day preview—not as a blanket background or a
permanent video layer behind the product.

## What the research says

### Awwwards fullscreen work

[Awwwards' fullscreen collection](https://www.awwwards.com/websites/fullscreen/?from=gyagbbb3&mobile=1&page=79)
describes the value of a viewport-filling image as impact and fluid composition.
That is useful for Rumia's cover and chapter openings, but it is a visual
composition principle, not a reason to turn every route into a fullscreen
canvas.

[Awwwards' fullscreen-video review](https://www.awwwards.com/20-websites-with-fullscreen-video.html)
explicitly treats video as situational: it is powerful for some image-led
brands, but should be chosen carefully rather than used by default. Rumia's
product has a practical decision job, so a still image is the baseline and
motion is an earned enhancement.

[When to Travel](https://www.awwwards.com/sites/when-to-travel%20) is a useful
interaction reference because time is represented as a visual index through a
timeline and horizontal transitions. Rumia should borrow the idea that a
morning/afternoon/evening choice can change the visual chapter, not copy its
horizontal navigation or turn the guide into a cinematic microsite.

### Travel-editorial comparators

[Off Map Guides](https://www.offmapguides.com/) is the closest brand reference:
human-curated, mood-led guides presented with the confidence of a magazine.
Its lesson for Rumia is image plus judgement plus a clear mood/context—not a
large neutral listing grid.

[Atlas Obscura](https://www.atlasobscura.com/) demonstrates a broader editorial
system: place-of-the-day, stories, editor picks, and destination collections.
Media works as evidence and discovery rhythm around an editorial voice, rather
than as decoration behind every card.

[Here & Away](https://abduzeedo.com/here-away-web-design-treats-travel-editorial)
is a secondary design case study showing destination photography used as a
navigation surface with magazine-like pacing. Rumia can use the controlled
chapter-transition idea, but must retain explicit controls, readable text, and
the activity decision as the primary interaction.

### Performance and accessibility guardrails

[Awwwards' mobile-performance guidance](https://www.awwwards.org/brainfood-mobile-performance-vol3.pdf)
and [web.dev's responsive-image guidance](https://web.dev/learn/design/responsive-images?hl=en)
both support serving an image at the size the viewport needs, using `srcset`
and `sizes`, and avoiding oversized hero files. [web.dev's video-performance
guidance](https://web.dev/learn/performance/video-performance) notes that a
video poster is important, autoplay begins downloading immediately, and
below-fold video should be deferred. [MDN's video reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video)
requires deliberate `poster`, `muted`, `playsinline`, and caption/transcript
decisions; [MDN's reduced-motion guidance](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion)
requires a non-motion equivalent for users who request less motion.

## Comparison with the current Rumia artifact

The current local artifact has a coherent midnight/sage/linen system, contour
graphics, editorial typography, and an activity-first flow. It is visually
controlled, but much of its sense of place is still carried by abstract contour
art and small Rumia-owned SVG illustrations. The hero figure is a narrow,
secondary image anchor; activity detail and selected-day surfaces have little
atmospheric evidence of the actual place. That is why the site can read as
well-designed yet still feel like a travel instrument without enough travel.

The correction is not to remove the current system. It is to give each important
public chapter one authored, place-specific media moment while leaving the
decision surfaces calm and legible.

## Cinematic atlas correction — 2026-07-13

The next step is not “more effects.” It is **cinematic pacing through contrast
and chapter composition**:

- A dark, spacious opening chapter gives the Portugal question a memorable
  entrance before the proof rail.
- A translucent proof rail creates a quiet pause between the promise and the
  landscape image.
- The image is treated as a field note with a caption, credit, focal crop, and
  a framed edge—not as a wallpaper background.
- The collection section becomes a distinct midnight chapter. The first
  collection is a larger editorial lead, while the remaining regions form a
  structured two-column index with numbered markers, mood labels, counts, and
  explicit activity links.
- Motion remains progressive enhancement: hover lift and short transitions may
  clarify interaction, but no autoplay, scroll hijack, or motion-dependent
  content is introduced.

This direction is informed by the following references, translated rather
than copied:

- [Awwwards / Noomo brand and website case](https://www.awwwards.com/new-focus-new-brand-new-website.html)
  describes balancing immersive interaction with user-friendly navigation and
  performance, and using a coherent visual identity rather than effects in
  isolation.
- [VisitPortugal](https://www.visitportugal.com/en) demonstrates a useful
  Portugal-wide information taxonomy: regions and experience lenses are
  explicit and discoverable. Rumia adopts the taxonomy principle while
  replacing the directory grid with editorial judgement.
- [Atlas Obscura](https://www.atlasobscura.com/) uses Place of the Day, Editor's
  Picks, destination collections, stories, and community signals to create
  editorial rhythm. Rumia adopts the idea of a lead story plus structured
  collections, but keeps the activity decision and verdict primary.
- [Atlas Obscura's product redesign notes](https://www.atlasobscura.com/product-blog)
  explicitly connect curation, hubs, redesign, performance, and accessibility;
  this supports treating the chapter as a content system rather than a visual
  one-off.

The implementation now applies this correction to `/portugal`: the page uses
layered sage depth, a midnight opening and collection chapter, a framed Douro
field note, a featured first collection, and structured cards for the remaining
regions. The public page remains Portugal-wide and activity-first.

## Recommended media hierarchy

| Surface | First media treatment | Why | Explicit non-goal |
| --- | --- | --- | --- |
| Home cover | One 60–75vh full-bleed Portugal image; optional 6–10s ambient loop only after the still version is accepted | Establishes atmosphere before the activity brief | No map/video dependency, no carousel, no autoplay with sound |
| Explore | One editorial chapter image between decision groups or a selected-filter media band | Adds place rhythm without hiding verdict cards | No image behind every result card |
| Activity detail | 55–65vh hero image with focal point, caption, verdict, and gradient safe zone | Makes a recommendation feel situated and memorable | No generic landmark stock and no booking CTA |
| Workspace | Compact chosen-day route/atmosphere strip or per-stop thumbnails after save | Reinforces the day the traveller is shaping | Empty state stays fast and illustrated; no autoplay |
| Portugal editorial pages | Region/season chapter breaks with image plus field-note caption | Gives Portugal-wide coverage a readable narrative rhythm | No destination-browser takeover |
| Planner | Optional still poster in the brief header | Preserves context while the form remains primary | No cinematic hero competing with inputs |
| Sign-in, support, feedback, console | Existing quiet surface, optionally one still proof crop | Keeps trust and operations fast | No full-bleed video or marketing treatment |

## Art direction

- Prefer commissioned, photographed, or otherwise explicitly licensed Rumia
  assets that show an activity's atmosphere: the light on a walk, the texture
  of a market, the pause before a viewpoint, or the practical conditions of a
  place. Use illustrations for abstract context and empty states, not as the
  only representation of every real activity.
- Compose for text. Store a focal point and a text-safe zone with every asset;
  use a controlled dark/light scrim rather than lowering the image until it is
  beige noise.
- Pair every public image with a short caption or field note when it carries
  editorial meaning. Decorative media is `aria-hidden`; informative media has
  useful alt text and, where appropriate, a visible source/credit line.
- Keep the existing midnight/sage/linen/ochre surfaces. Full-bleed media is a
  foreground chapter layer, not a fifth color system.
- Avoid stock-photo mosaics, generic drone footage, AI-generated depictions of
  real Portuguese places, ornamental cursor effects, scrolljacking, and a
  copied Awwwards/london-3d composition.

## Asset contract

Extend the existing manifest rather than introducing an untracked media folder.
Each entry should record:

```text
id, route/activity/chapter refs, type (image|video|poster),
src variants, width/height, byte size, alt, caption, source,
licence, licence URL, attribution, owner, reviewedAt, expiresAt,
focalPoint, textSafeZone, dominantColor, motionPolicy,
mobileSrc, posterSrc, durationMs, transcript/captions (if video)
```

The manifest is a release gate: an asset cannot ship as a factual place image
without a provenance/licence record and an editorial review date.

## Delivery and runtime rules

1. Use responsive AVIF/WebP image variants with `srcset`/`sizes`; reserve the
   aspect ratio to avoid layout shift. Preload only the first above-the-fold
   hero when it is the actual LCP candidate; lazy-load chapter media below it.
2. Video is `muted`, `playsInline`, looped, and poster-first. Use WebM with an
   MP4 fallback, defer loading until the element is near the viewport, and
   provide a still-image fallback. The initial mobile video budget is a
   proposed product target of roughly 1–2 MB, to be validated against the
   existing performance gate rather than treated as a universal browser rule.
3. Disable autoplay/pan/parallax under `prefers-reduced-motion`, a reduced-data
   or saver signal where available, and low-power/mobile heuristics. Never make
   motion required to understand a place, verdict, route, or action.
4. Keep text and actions in the DOM above the media layer; preserve keyboard
   focus, contrast, captions/transcripts for non-decorative video, and a visible
   map/data attribution path where any map imagery is involved.
5. Do not load public media in operator/console routes. Keep failure states
   useful when an image, poster, or video is missing or blocked.

## Phased implementation plan

### Phase A — media foundation and art direction

- Select three to five Portugal visual stories covering different activities,
  regions, weather, and traveller moods.
- Replace the narrow placeholder-like hero crop with one authored cover image
  and a deliberate mobile crop; keep the existing phrase composer unchanged.
- Add `EditorialMedia`/`HeroMedia` primitives around the existing asset manifest
  with focal points, captions, fallback color, and reduced-motion behavior.
- Complete licence/provenance records and capture a desktop/mobile artifact.

### Phase B — first full-bleed image implementation

- Add the home cover and activity-detail hero image.
- Add one chapter-break image to the Portugal/explore editorial flow.
- Verify that result cards, verdicts, save actions, and the chosen-day tray remain
  the first-class interface at all sizes.
- Run the existing visual, a11y, performance, motion, and viewport gates before
  considering motion.

### Phase C — selective ambient motion

- Add one 6–10 second silent loop to either the home cover or one signature
  activity, never both in the first motion experiment.
- Keep the poster as the default until the video is near the viewport; disable
  playback for reduced motion/data and provide a user-visible still fallback.
- Compare LCP, bytes, interaction readiness, completion of the activity brief,
  and qualitative trust against the still-image baseline.

### Phase D — editorial media system

- Extend media to three to five initial activity details, route/chosen-day
  previews, and Portugal region/season chapter breaks.
- Add caption/credit treatment, crop/focal-point tooling, and an editor review
  checklist.
- Keep utility, sign-in, feedback, and console routes quiet and fast.

### Phase E — optional interaction, only if comprehension improves

- Allow a user-triggered “see the place” reveal or a restrained chapter pan.
- If time-of-day changes, use a short crossfade or camera/media stop as a
  consequence of that choice; do not force a tour.
- Keep MapLibre/3D work in its existing gated, list-first spatial plan. Media
  does not authorize Phase 2 camera storytelling or Phase 3 3D enablement.

## Acceptance gate for the media pass

- Home, explore, and activity detail each have one intentional place-specific
  media anchor; no route is a generic beige wall and no utility route gains a
  decorative video.
- The phrase brief, activity verdict, save action, and chosen-day action remain
  visible without waiting for media to load.
- Mobile receives a deliberate crop and no horizontal overflow; desktop uses a
  text-safe focal composition.
- Every asset has provenance, licence, alt/caption policy, dimensions, and a
  fallback. Videos have poster, muted/inline behavior, and a reduced-motion
  still path.
- Current performance/a11y/motion/viewport gates do not regress; measure the
  still baseline before and after any video.
- No media is described as AI-generated, and no media surface changes Rumia's
  activity-first product boundary.
