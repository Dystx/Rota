"use client";

import { useState, useTransition } from "react";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "@repo/ui";
import { signInAction } from "../_actions/sign-in";

interface SignInFormProps {
  next: string;
  initialSent: boolean;
  initialError?: string;
}

/**
 * SignInForm — the client island for the Better Auth password form. The
 * page itself is a server component (so it can read the
 * session cookie and redirect if already authed), but the form
 * needs to be a client component to:
 *   1. Show a loading state on the submit button
 *   2. Call the server action via useTransition (Next.js 16
 *      recommended pattern for non-blocking server actions)
 *   3. Show a toast on success
 *
 * The server action performs the Better Auth password sign-in and returns a
 * safe result; this form routes after the session cookie is set.
 *
 * PR-3: Migrated to <Field> + <Input> primitives for consistent
 * label / error / focus-ring treatment across the app.
 */
export function SignInForm({ next, initialSent, initialError }: SignInFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    const submittedEmail = String(formData.get("email") ?? "").trim();
    setSubmitError(null);
    startTransition(async () => {
      try {
        const result = await signInAction(formData);
        if (!result.ok) {
          setSubmitError(result.message);
          return;
        }

        toast.success(
          "Signed in",
          `Signed in as ${submittedEmail}.`
        );
        router.push(result.next || next);
      } catch (err) {
        // Keep unexpected transport/runtime failures generic as well. The
        // server action already maps auth/provider failures to a safe message;
        // this branch protects the UI from server internals.
        void err;
        const message = "We couldn’t sign you in right now. Try again in a moment.";
        setSubmitError(message);
      }
    });
  }

  return (
    <form action={handleSubmit} className="rumia-signin-form max-w-xl text-xl leading-relaxed text-primary">
      <input type="hidden" name="next" value={next} />

      <label htmlFor="email" className="sr-only">Email address</label>
      <div className="rumia-signin-sentence">
      <span className="rumia-signin-copy">Sign in with </span>
      <input
        id="email"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="rumia-signin-input inline min-w-48 border-b border-ochre-dark bg-transparent px-1 py-1 text-inherit outline-none placeholder:text-on-surface-variant focus-visible:ring-2 focus-visible:ring-ochre-light"
      />
      <span className="rumia-signin-copy"> and password </span>
      <span className="rumia-signin-password-field">
        <input
          id="password"
          name="password"
          aria-label="Password"
          type="password"
          required
          minLength={8}
          autoComplete="current-password"
          placeholder="your password"
          className="rumia-signin-input inline min-w-48 border-b border-ochre-dark bg-transparent px-1 py-1 text-inherit outline-none placeholder:text-on-surface-variant focus-visible:ring-2 focus-visible:ring-ochre-light"
        />
      </span>
      <span className="rumia-signin-copy"> and then </span>
      <button type="submit" disabled={pending} className="inline border-b border-ochre-dark bg-transparent px-1 py-1 font-medium text-ochre-dark hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light disabled:opacity-60">
        {pending ? "signing in…" : "sign in"}
      </button>
      <span>.</span>
      </div>

      {submitError ? (
        <div role="alert" aria-live="assertive" className="mt-6 rounded-xl border border-red-900/20 bg-red-50/70 px-4 py-3 text-sm leading-6 text-red-900">
          <strong className="font-medium">Sign-in failed.</strong> {submitError}
        </div>
      ) : null}

      {initialSent && !pending ? (
        <div
          role="status"
          aria-live="polite"
          className="mt-6 text-sm text-olive-dark"
        >
          <strong className="font-medium">Signed in.</strong> Redirecting to your account.
        </div>
      ) : null}

      {initialError ? (
        <div
          role="alert"
          className="mt-6 text-sm text-red-800"
        >
          <strong className="font-medium">Sign-in failed.</strong> We couldn’t sign you in. Check your email and password and try again.
        </div>
      ) : null}
    </form>
  );
}
