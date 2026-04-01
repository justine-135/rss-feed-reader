"use client";

import { formatDistanceToNowStrict } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import type { DemoCategory, DemoFeed } from "@/lib/demo-data";

type ManageFeedsViewProps = {
  categories: DemoCategory[];
  onEditFeed: (feed: DemoFeed, category: DemoCategory) => void;
  onRemoveFeed: (feed: DemoFeed) => void;
};

export function ManageFeedsView({
  categories,
  onEditFeed,
  onRemoveFeed,
}: ManageFeedsViewProps) {
  return (
    <div className="grid gap-4 p-5 lg:grid-cols-2 xl:grid-cols-3 lg:p-7">
      {categories.map((category) =>
        category.feeds.map((feed) => (
          <article
            key={feed.slug}
            className="dashboard-discover-card app-border app-surface border p-5"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span
                  className="feed-mini-badge-lg flex h-8 w-8 items-center justify-center rounded-md font-semibold text-white"
                  style={{ backgroundColor: category.color }}
                >
                  {feed.badge}
                </span>
                <div>
                  <h2 className="text-lg font-semibold">{feed.title}</h2>
                  <p className="app-text-secondary text-sm">{category.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  aria-label={`Edit ${feed.title}`}
                  className="dashboard-icon-button"
                  onClick={() => onEditFeed(feed, category)}
                  type="button"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  aria-label={`Delete ${feed.title}`}
                  className="dashboard-icon-button text-red-600"
                  onClick={() => onRemoveFeed(feed)}
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="app-text-secondary mb-4 text-sm leading-6">
              {feed.description}
            </p>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="app-text-tertiary">Feed URL</dt>
                <dd className="app-text-primary mt-1 break-all">
                  {feed.feedUrl}
                </dd>
              </div>
              <div>
                <dt className="app-text-tertiary">Site</dt>
                <dd className="app-text-primary mt-1 break-all">
                  {feed.siteUrl}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <dt className="app-text-tertiary">Health</dt>
                  <dd className="app-text-success mt-1 font-medium capitalize">
                    {feed.healthStatus}
                  </dd>
                </div>
                <div className="text-right">
                  <dt className="app-text-tertiary">Last checked</dt>
                  <dd className="app-text-primary mt-1">
                    {formatDistanceToNowStrict(new Date(feed.lastFetchedAt), {
                      addSuffix: true,
                    })}
                  </dd>
                </div>
              </div>
            </dl>
          </article>
        )),
      )}
    </div>
  );
}
