import { redirect } from "next/navigation";

/**
 * /guide — the operator onboarding index.
 *
 * The only public guide surface today is the specialist
 * onboarding flow at `/guide/onboarding`. Future guides
 * (e.g. `/guide/admin`, `/guide/concierge`) will land here.
 */
export default function GuideIndex(): never {
  redirect("/guide/onboarding");
}
