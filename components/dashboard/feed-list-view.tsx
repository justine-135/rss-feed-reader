"use client";

import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";
import { Bookmark, Sparkles } from "lucide-react";
import { clsx } from "clsx";
import type { DemoCategory, DemoItem } from "@/lib/demo-data";
import { defaultColor } from "@/lib/dashboard";

type FeedListViewProps = {
  categories: DemoCategory[];
  items: DemoItem[];
  readIds: string[];
  savedIds: string[];
  newItemsCount: number;
  onMarkAsRead: (id: string) => void;
  onToggleSaved: (id: string) => void;
};

export function FeedListView({
  categories,
  items,
  readIds,
  savedIds,
  newItemsCount,
  onMarkAsRead,
  onToggleSaved,
}: FeedListViewProps) {
  return (
    <>
      <div className="feed-banner app-border app-text-accent border-b px-5 py-3 text-sm font-medium lg:px-7">
        {newItemsCount} new items since your last visit
      </div>
      <div className="app-divide-border">
        {items.length === 0 ? (
          <div className="app-text-secondary px-7 py-14">
            No articles match this view yet.
          </div>
        ) : (
          items.map((item) => {
            const category = categories.find(
              (value) => value.slug === item.categorySlug,
            );
            const isRead = readIds.includes(item.id);
            const isSaved = savedIds.includes(item.id);

            return (
              <article
                key={item.id}
                className={clsx(
                  "dashboard-hover-surface group px-5 py-5 transition lg:px-7",
                  isRead && "opacity-70",
                )}
              >
                <div className="app-text-tertiary mb-2 flex items-center gap-3 text-sm">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: isRead
                        ? "var(--color-border)"
                        : "var(--color-unread-indicator)",
                    }}
                  />
                  <span>{item.feedTitle}</span>
                  <span>•</span>
                  <span>
                    {formatDistanceToNowStrict(new Date(item.publishedAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-6">
                  <div className="min-w-0 flex-1">
                    <Link
                      className="feed-item-link block"
                      href={item.url}
                      onClick={() => onMarkAsRead(item.id)}
                      target="_blank"
                    >
                      <h2 className="feed-item-title tracking-tight-app app-text-primary mb-2 font-semibold transition">
                        {item.title}
                      </h2>
                      <p className="app-text-secondary max-w-3xl text-base leading-7">
                        {item.excerpt}
                      </p>
                    </Link>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <span
                        className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                        style={{
                          backgroundColor: `${category?.color ?? defaultColor}18`,
                          color: category?.color ?? defaultColor,
                        }}
                      >
                        {item.categoryName}
                      </span>
                      {item.newSinceVisit ? (
                        <span className="app-bg-accent-subtle app-text-accent inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold">
                          <Sparkles className="h-3 w-3" />
                          New
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <button
                    aria-pressed={isSaved}
                    className={clsx(
                      "dashboard-save-button",
                      isSaved
                        ? "app-border app-bg-accent-subtle app-text-accent"
                        : "app-border app-text-tertiary",
                    )}
                    onClick={() => onToggleSaved(item.id)}
                    type="button"
                  >
                    <Bookmark
                      className="h-4 w-4"
                      fill={isSaved ? "currentColor" : "none"}
                    />
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </>
  );
}
