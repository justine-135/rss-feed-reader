"use client";

import { clsx } from "clsx";
import type { DemoCategory } from "@/lib/demo-data";
import type { CollectionName } from "@/lib/dashboard";

type DashboardSidebarProps = {
  activeCategory: string;
  activeCollection: CollectionName;
  authReady: boolean;
  categories: DemoCategory[];
  countsByCategory: Record<string, number>;
  countsByFeed: Record<string, number>;
  mode: "guest" | "member";
  onCategoryChange: (categorySlug: string) => void;
  onCollectionChange: (collection: CollectionName) => void;
  onSelectFeed: (categorySlug: string) => void;
  savedCount: number;
  unreadTotalCount: number;
  unreadVisibleCount: number;
};

export function DashboardSidebar({
  activeCategory,
  activeCollection,
  authReady,
  categories,
  countsByCategory,
  countsByFeed,
  mode,
  onCategoryChange,
  onCollectionChange,
  onSelectFeed,
  savedCount,
  unreadTotalCount,
  unreadVisibleCount,
}: DashboardSidebarProps) {
  return (
    <aside className="dashboard-sidebar app-border border-r px-4 py-5">
      <div className="space-y-1">
        <button
          className={sidebarButton(activeCollection === "all")}
          onClick={() => onCollectionChange("all")}
          type="button"
        >
          <span>All Items</span>
          <span>{unreadTotalCount}</span>
        </button>
        <button
          className={sidebarButton(activeCollection === "saved")}
          onClick={() => onCollectionChange("saved")}
          type="button"
        >
          <span>Saved</span>
          <span>{savedCount}</span>
        </button>
      </div>

      <div className="app-border mt-6 border-t pt-6">
        <p className="dashboard-sidebar-label">Categories</p>
        <div className="space-y-1">
          <button
            className={categoryButton(activeCategory === "all")}
            onClick={() => onCategoryChange("all")}
            type="button"
          >
            <span>Everything</span>
            <span>{unreadVisibleCount}</span>
          </button>
          {categories.map((category) => (
            <div key={category.slug} className="space-y-1">
              <button
                className={categoryButton(activeCategory === category.slug)}
                onClick={() => onCategoryChange(category.slug)}
                type="button"
              >
                <span className="flex items-center gap-3">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  {category.name}
                </span>
                <span>{countsByCategory[category.slug] ?? 0}</span>
              </button>
              <div className="space-y-1 pl-4">
                {category.feeds.map((feed) => (
                  <button
                    key={feed.slug}
                    className="dashboard-feed-link"
                    onClick={() => onSelectFeed(category.slug)}
                    type="button"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="feed-mini-badge flex h-5 w-5 items-center justify-center rounded-md font-semibold text-white"
                        style={{ backgroundColor: category.color }}
                      >
                        {feed.badge}
                      </span>
                      {feed.shortTitle}
                    </span>
                    <span>{countsByFeed[feed.slug] ?? 0}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-health-box">
        <div className="app-text-success mb-1 flex items-center gap-2 font-medium">
          <span className="app-bg-success h-2 w-2 rounded-full" />
          All feeds healthy
        </div>
        <p>
          {mode === "guest"
            ? "Guest reading state and custom feeds are stored in this browser."
            : authReady
              ? "Your GitHub session is active. Phase 1 feed changes are stored locally until database syncing is added."
              : "Add GitHub credentials to enable member sign-in."}
        </p>
      </div>
    </aside>
  );
}

function sidebarButton(active: boolean) {
  return clsx(
    "dashboard-sidebar-link",
    active && "dashboard-sidebar-link-active",
  );
}

function categoryButton(active: boolean) {
  return clsx(
    "dashboard-category-link",
    active && "dashboard-category-link-active",
  );
}
