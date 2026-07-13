import * as React from "react";

export interface ActivityMapAttributionLink {
  readonly label: string;
  readonly href: string;
}

export interface ActivityMapAttributionConfig {
  /** Provider-required links for the active basemap. */
  readonly links: readonly ActivityMapAttributionLink[];
  /** Product note that remains true for every activity-map provider. */
  readonly note?: string;
}

/**
 * Development-candidate attribution. Production providers must pass their
 * own reviewed links instead of inheriting this default.
 */
export const DEFAULT_ACTIVITY_MAP_ATTRIBUTION: ActivityMapAttributionConfig = {
  links: [
    { label: "© OpenStreetMap contributors", href: "https://www.openstreetmap.org/copyright" },
    { label: "CARTO", href: "https://carto.com/attributions" }
  ],
  note: "Activity locations are reviewed public-area approximations where labelled."
};

export function ActivityMapAttribution({
  config = DEFAULT_ACTIVITY_MAP_ATTRIBUTION
}: {
  config?: ActivityMapAttributionConfig;
}) {
  return (
    <p data-map-attribution="true" className="text-xs leading-relaxed text-on-surface-variant">
      Basemap attribution:{" "}
      {config.links.map((link, index) => (
        <React.Fragment key={`${link.href}-${link.label}`}>
          {index > 0 ? " · " : null}
          <a className="underline underline-offset-2" href={link.href} target="_blank" rel="noreferrer">
            {link.label}
          </a>
        </React.Fragment>
      ))}
      {config.note ? ` ${config.note}` : null}
    </p>
  );
}
