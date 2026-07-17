import { permanentRedirect } from "next/navigation";

/** The specialist explanation now has one canonical public home. */
export default function HumanReviewPage(): never {
  permanentRedirect("/local-expertise");
}
