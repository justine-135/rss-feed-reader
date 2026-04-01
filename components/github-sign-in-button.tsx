"use client";

import { clsx } from "clsx";
import { signIn } from "next-auth/react";

type GithubSignInButtonProps = {
  className?: string;
  callbackUrl?: string;
  disabled?: boolean;
};

export function GithubSignInButton({
  callbackUrl = "/dashboard",
  className,
  disabled = false,
}: GithubSignInButtonProps) {
  return (
    <button
      className={clsx(
        "secondary-cta",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      disabled={disabled}
      onClick={() => {
        if (!disabled) {
          signIn("github", { callbackUrl });
        }
      }}
      type="button"
    >
      Continue with GitHub
    </button>
  );
}
