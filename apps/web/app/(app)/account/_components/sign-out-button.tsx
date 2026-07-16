"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, toast } from "@repo/ui";
import { signOutAction as defaultSignOutAction } from "../_actions/sign-out";

interface SignOutButtonProps {
  signOutAction?: () => Promise<void>;
  className?: string;
}

/**
 * SignOutButton — client-side wrapper around the sign-out
 * server action. The raw <form action={signOutAction}> is a
 * server-action submit; this wrapper gives us:
 *   1. A loading state on the button (Button.isLoading)
 *   2. A toast.info('Signing you out…') for instant feedback
 *      (the server action then redirects, so the toast is the
 *      user's only signal that the click landed)
 *
 * The className prop lets the account page keep its existing
 * layout ("md:self-end" alignment on the desktop profile
 * section).
 */
export function SignOutButton({ signOutAction, className }: SignOutButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      toast.info("Signing you out…");
      try {
        await (signOutAction ?? defaultSignOutAction)();
        router.push("/");
      } catch {
        toast.error("Couldn\u2019t sign out. Try again.");
      }
    });
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      isLoading={pending}
      className={className}
    >
      Sign out
    </Button>
  );
}
