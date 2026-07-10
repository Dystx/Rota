"use client";

import { useState, useTransition } from "react";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "@repo/ui";

interface SignInFormProps {
  next: string;
  initialSent: boolean;
  initialError?: string;
}

/**
 * SignInForm — the client island for the magic-link form. The
 * page itself is a server component (so it can read the
 * session cookie and redirect if already authed), but the form
 * needs to be a client component to:
 *   1. Show a loading state on the submit button
 *   2. Call the server action via useTransition (Next.js 16
 *      recommended pattern for non-blocking server actions)
 *   3. Show a toast on success
 *
 * The server action does the actual Supabase signInWithOtp call
 * and redirects to ?sent=1 on success. The client just triggers
 * it and shows UI feedback.
 *
 * PR-3: Migrated to <Field> + <Input> primitives for consistent
 * label / error / focus-ring treatment across the app.
 */
export function SignInForm({ next, initialSent, initialError }: SignInFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState("");

  function handleSubmit(formData: FormData) {
    const submittedEmail = String(formData.get("email") ?? "").trim();
    startTransition(async () => {
      try {
        // The server action is imported dynamically because it carries
        // the "use server" boundary — Next.js will not bundle a static
        // import of a server action into the client. This is the
        // documented Next 16 pattern; the action module is not
        // runtime-selected.
        const { signInWithMagicLinkAction } = await import("../_actions/sign-in");
        await signInWithMagicLinkAction(formData);
        toast.success(
          "Check your inbox",
          `We sent a sign-in link to ${submittedEmail}. It expires in 10 minutes.`
        );
        // Push to the ?sent=1 URL so the page also shows the
        // server-rendered confirmation (works without JS too).
        router.push(`/sign-in?sent=1&next=${encodeURIComponent(next)}`);
      } catch (err) {
        // Server action throws redirect() on success and
        // error; Next.js handles the redirect internally. Only
        // a true error reaches here.
        toast.error(
          "Couldn\u2019t send the link",
          err instanceof Error ? err.message : "Try again in a moment."
        );
      }
    });
  }

  return (
    <form action={handleSubmit} className="max-w-xl text-xl leading-relaxed text-primary">
      <input type="hidden" name="next" value={next} />

      <label htmlFor="email" className="sr-only">Send my private sign-in link to</label>
      <span>Send my private sign-in link to </span>
      <input
        id="email"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="inline min-w-48 border-b border-ochre-dark bg-transparent px-1 py-1 text-inherit outline-none placeholder:text-on-surface-variant focus-visible:ring-2 focus-visible:ring-ochre-light"
      />
      <span>, then </span>
      <button type="submit" disabled={pending} className="inline border-b border-ochre-dark bg-transparent px-1 py-1 font-medium text-ochre-dark hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light disabled:opacity-60">
        {pending ? "sending link…" : "send link"}
      </button>
      <span>.</span>

      {initialSent && !pending ? (
        <div
          role="status"
          aria-live="polite"
          className="mt-6 text-sm text-olive-dark"
        >
          <strong className="font-medium">Check your inbox.</strong> We sent a sign-in link to your email. It expires in 10 minutes.
        </div>
      ) : null}

      {initialError ? (
        <div
          role="alert"
          className="mt-6 text-sm text-red-800"
        >
          <strong className="font-medium">Sign-in failed.</strong> {decodeURIComponent(initialError)}
        </div>
      ) : null}
    </form>
  );
}
