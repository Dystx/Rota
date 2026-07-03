import Link from "next/link";

/**
 * SiteFooter — global footer.
 *
 * Source: docs/prototype.html (<footer>, bottom of body).
 * Three-column flex: brand + copyright + 4 legal links.
 */
export function SiteFooter() {
  return (
    <footer className="bg-linen-dark w-full border-t border-olive-dark/5 py-12 px-container-padding-lg flex flex-col md:flex-row justify-between items-center gap-4 mt-section-gap">
      <Link
        href="/"
        className="font-headline-sm text-headline-sm italic text-primary"
      >
        Rumia
      </Link>
      <p className="font-label-ui text-label-ui text-olive-light text-center md:text-left">
        © 2024 Rumia. All rights reserved. Intentional Humanism in Travel.
      </p>
      <ul className="flex flex-wrap justify-center gap-6">
        <li>
          <a
            href="#"
            className="font-label-ui text-label-ui text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100"
          >
            Privacy Policy
          </a>
        </li>
        <li>
          <a
            href="#"
            className="font-label-ui text-label-ui text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100"
          >
            Terms of Service
          </a>
        </li>
        <li>
          <a
            href="#"
            className="font-label-ui text-label-ui text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100"
          >
            Sustainability
          </a>
        </li>
        <li>
          <a
            href="#"
            className="font-label-ui text-label-ui text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100"
          >
            Global Support
          </a>
        </li>
      </ul>
    </footer>
  );
}