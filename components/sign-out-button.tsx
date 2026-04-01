"use client";

import { signOut } from "next-auth/react";
import type { ReactNode } from "react";
import { clsx } from "clsx";

type SignOutButtonProps = {
  children?: ReactNode;
  className?: string;
  icon?: ReactNode;
};

export function SignOutButton({
  children = "Sign out",
  className,
  icon,
}: SignOutButtonProps) {
  return (
    <button
      className={clsx("secondary-cta justify-center", className)}
      onClick={() => signOut({ callbackUrl: "/" })}
      type="button"
    >
      {icon}
      {children}
    </button>
  );
}
