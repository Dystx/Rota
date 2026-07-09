import { redirect } from "next/navigation";

/**
 * /b2b — the B2B partner gateway index.
 *
 * The B2B surface is a white-label landing per partner org:
 * `/b2b/<orgSlug>`. The index exists so the `/b2b` URL resolves;
 * visitors land on the rumia demo org (`rumia`) which is the
 * default partner for unauthenticated visitors.
 */
export default function B2bIndex(): never {
  redirect("/b2b/rumia");
}
