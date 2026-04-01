"use client";

import { LayoutGrid, List, Plus, RefreshCcw, Search } from "lucide-react";
import { clsx } from "clsx";
import { FeedReaderLogo } from "@/components/feed-reader-logo";
import { ProfileMenu } from "@/components/dashboard/profile-menu";
import type { ViewName } from "@/lib/dashboard";

type DashboardTopbarProps = {
  activeView: ViewName;
  initials: string;
  logoHref: string;
  mode: "guest" | "member";
  onAddFeed: () => void;
  onSearchChange: (value: string) => void;
  onViewChange: (view: ViewName) => void;
  searchQuery: string;
  showManageAction: boolean;
  viewerName: string;
};

export function DashboardTopbar({
  activeView,
  initials,
  logoHref,
  mode,
  onAddFeed,
  onSearchChange,
  onViewChange,
  searchQuery,
  showManageAction,
  viewerName,
}: DashboardTopbarProps) {
  return (
    <header className="dashboard-topbar app-border flex flex-wrap items-center justify-between gap-4 border-b px-4 py-3 lg:px-6">
      <div className="flex items-center gap-4">
        <FeedReaderLogo href={logoHref} />
        <nav className="flex items-center gap-1">
          {[
            ["feed", "Feed"],
            ["digest", "Digest"],
            ["discover", "Discover"],
          ].map(([id, label]) => (
            <button
              key={id}
              className={clsx(
                "dashboard-nav-tab",
                activeView === id && "dashboard-nav-tab-active",
              )}
              onClick={() => onViewChange(id as ViewName)}
              type="button"
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="dashboard-search-field">
          <Search className="h-4 w-4" />
          <span className="screen-reader-only">Search articles</span>
          <input
            className="app-input app-text-primary w-full border-0 bg-transparent outline-none"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search articles..."
            value={searchQuery}
          />
        </label>
        <button
          aria-label={showManageAction ? "Add feed" : "Open feed manager"}
          className="dashboard-icon-button"
          onClick={onAddFeed}
          type="button"
        >
          <Plus className="h-4 w-4" />
        </button>
        <div className="dashboard-inline-toolbar">
          <button
            aria-pressed
            className="feed-toolbar-button is-active"
            type="button"
          >
            <List className="h-4 w-4" />
          </button>
          <button className="feed-toolbar-button" type="button">
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
        <button className="toolbar-pill" type="button">
          Newest
        </button>
        <button className="toolbar-pill" type="button">
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </button>
        <ProfileMenu initials={initials} mode={mode} viewerName={viewerName} />
      </div>
    </header>
  );
}
