"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { clsx } from "clsx";
import { SignOutButton } from "@/components/sign-out-button";

type ProfileMenuProps = {
  initials: string;
  viewerName: string;
  mode: "guest" | "member";
};

export function ProfileMenu({
  initials,
  viewerName,
  mode,
}: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        className={clsx(
          "dashboard-profile-trigger",
          open && "dashboard-profile-trigger-open",
        )}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span className="dashboard-profile-avatar">{initials}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {open ? (
        <div className="dashboard-profile-menu" role="menu">
          <div className="dashboard-profile-menu-header">
            <p className="dashboard-profile-menu-name">{viewerName}</p>
            <p className="dashboard-profile-menu-meta">
              {mode === "guest" ? "Guest session" : "GitHub session"}
            </p>
          </div>
          {mode === "member" ? (
            <SignOutButton
              className="dashboard-profile-menu-item"
              icon={<LogOut className="h-4 w-4" />}
            >
              Sign out
            </SignOutButton>
          ) : (
            <div className="dashboard-profile-menu-muted">
              Guest mode does not need sign-out.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
