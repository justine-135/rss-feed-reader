"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import {
  Bookmark,
  LayoutGrid,
  List,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { clsx } from "clsx";
import { FeedReaderLogo } from "@/components/feed-reader-logo";
import { SignOutButton } from "@/components/sign-out-button";
import type { DemoCategory, DemoFeed, DemoItem } from "@/lib/demo-data";

type DashboardShellProps = {
  categories: DemoCategory[];
  items: DemoItem[];
  mode: "guest" | "member";
  viewerName: string;
  authReady: boolean;
};

type ViewName = "feed" | "digest" | "discover";
type CollectionName = "all" | "saved";
type FeedFormMode = "create" | "edit";

type FeedFormState = {
  id: string | null;
  title: string;
  shortTitle: string;
  description: string;
  feedUrl: string;
  siteUrl: string;
  categoryName: string;
  color: string;
  badge: string;
};

type PersistedDashboardState = {
  categories: DemoCategory[];
  items: DemoItem[];
  readIds: string[];
  savedIds: string[];
};

const defaultColor = "#2563EB";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createStorageKey(mode: "guest" | "member", viewerName: string) {
  return `frontpage-dashboard-state:${mode}:${slugify(viewerName || "reader")}`;
}

function toFeedFormState(
  feed?: DemoFeed,
  category?: DemoCategory,
): FeedFormState {
  return {
    id: feed?.slug ?? null,
    title: feed?.title ?? "",
    shortTitle: feed?.shortTitle ?? "",
    description: feed?.description ?? "",
    feedUrl: feed?.feedUrl ?? "",
    siteUrl: feed?.siteUrl ?? "",
    categoryName: category?.name ?? "",
    color: category?.color ?? defaultColor,
    badge: feed?.badge ?? "",
  };
}

function likelyFeedUrl(value: string) {
  return /^(https?:\/\/).+/.test(value) && /(rss|atom|feed|xml)/i.test(value);
}

function buildFeedFromForm(form: FeedFormState, existingFeedCount: number) {
  const title = form.title.trim();
  const categoryName = form.categoryName.trim();
  const shortTitle = form.shortTitle.trim() || title;
  const badge = (form.badge.trim() || title[0] || "F")
    .slice(0, 2)
    .toUpperCase();
  const slugBase = slugify(title);

  return {
    feed: {
      slug: slugBase || `feed-${existingFeedCount + 1}`,
      title,
      shortTitle,
      description: form.description.trim(),
      feedUrl: form.feedUrl.trim(),
      siteUrl: form.siteUrl.trim(),
      badge,
      categorySlug: slugify(categoryName),
      healthStatus: "active" as const,
      lastFetchedAt: new Date().toISOString(),
    },
    category: {
      slug: slugify(categoryName),
      name: categoryName,
      color: form.color || defaultColor,
      feeds: [],
    },
  };
}

function createItemsForFeed(
  feed: DemoFeed,
  category: DemoCategory,
): DemoItem[] {
  const now = Date.now();

  return [
    {
      id: `${feed.slug}-welcome`,
      title: `${feed.title} is ready in Frontpage`,
      excerpt:
        "This starter article confirms the feed is connected and gives you a place to validate the layout, counts, and reading workflow.",
      url: feed.siteUrl || feed.feedUrl,
      publishedAt: new Date(now - 1000 * 60 * 45).toISOString(),
      newSinceVisit: true,
      feedTitle: feed.title,
      feedSlug: feed.slug,
      categoryName: category.name,
      categorySlug: category.slug,
    },
    {
      id: `${feed.slug}-checkup`,
      title: `Latest updates from ${feed.shortTitle}`,
      excerpt:
        "Phase 1 uses seeded content for custom feeds so you can edit organization now and wire real RSS ingestion in the next phase.",
      url: feed.siteUrl || feed.feedUrl,
      publishedAt: new Date(now - 1000 * 60 * 60 * 6).toISOString(),
      newSinceVisit: false,
      feedTitle: feed.title,
      feedSlug: feed.slug,
      categoryName: category.name,
      categorySlug: category.slug,
    },
  ];
}

export function DashboardShell({
  categories,
  items,
  mode,
  viewerName,
  authReady,
}: DashboardShellProps) {
  const [activeView, setActiveView] = useState<ViewName>("feed");
  const [activeCollection, setActiveCollection] =
    useState<CollectionName>("all");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoriesState, setCategoriesState] = useState(categories);
  const [itemsState, setItemsState] = useState(items);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [feedFormMode, setFeedFormMode] = useState<FeedFormMode>("create");
  const [feedForm, setFeedForm] = useState<FeedFormState>(toFeedFormState());
  const [isFeedModalOpen, setIsFeedModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(searchQuery);
  const storageKey = createStorageKey(mode, viewerName);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);

    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as Partial<PersistedDashboardState>;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate stored dashboard state once after mount
      setCategoriesState(parsed.categories ?? categories);
      setItemsState(parsed.items ?? items);
      setReadIds(parsed.readIds ?? []);
      setSavedIds(parsed.savedIds ?? []);
    } catch {
      setCategoriesState(categories);
      setItemsState(items);
      setReadIds([]);
      setSavedIds([]);
    }
  }, [categories, items, storageKey]);

  useEffect(() => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        categories: categoriesState,
        items: itemsState,
        readIds,
        savedIds,
      } satisfies PersistedDashboardState),
    );
  }, [categoriesState, itemsState, readIds, savedIds, storageKey]);

  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const allFeeds = categoriesState.flatMap((category) => category.feeds);
  const logoHref = mode === "guest" ? "/guest" : "/dashboard";

  const visibleItems = itemsState.filter((item) => {
    if (!allFeeds.some((feed) => feed.slug === item.feedSlug)) {
      return false;
    }

    if (activeCollection === "saved" && !savedIds.includes(item.id)) {
      return false;
    }

    if (activeCategory !== "all" && item.categorySlug !== activeCategory) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    return (
      item.title.toLowerCase().includes(normalizedQuery) ||
      item.excerpt.toLowerCase().includes(normalizedQuery) ||
      item.feedTitle.toLowerCase().includes(normalizedQuery) ||
      item.categoryName.toLowerCase().includes(normalizedQuery)
    );
  });

  const unreadVisibleCount = visibleItems.filter(
    (item) => !readIds.includes(item.id),
  ).length;

  const unreadTotalCount = itemsState.filter(
    (item) =>
      allFeeds.some((feed) => feed.slug === item.feedSlug) &&
      !readIds.includes(item.id),
  ).length;

  const newItemsCount = itemsState.filter((item) => item.newSinceVisit).length;

  const countsByCategory = categoriesState.reduce<Record<string, number>>(
    (accumulator, category) => {
      accumulator[category.slug] = itemsState.filter(
        (item) =>
          item.categorySlug === category.slug && !readIds.includes(item.id),
      ).length;
      return accumulator;
    },
    {},
  );

  const countsByFeed = allFeeds.reduce<Record<string, number>>(
    (accumulator, feed) => {
      accumulator[feed.slug] = itemsState.filter(
        (item) => item.feedSlug === feed.slug && !readIds.includes(item.id),
      ).length;
      return accumulator;
    },
    {},
  );

  function markAsRead(id: string) {
    setReadIds((current) =>
      current.includes(id) ? current : [...current, id],
    );
  }

  function toggleSaved(id: string) {
    setSavedIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  }

  function markVisibleAsRead() {
    setReadIds((current) => [
      ...new Set([...current, ...visibleItems.map((item) => item.id)]),
    ]);
  }

  function openCreateFeed() {
    setFeedFormMode("create");
    setFeedForm(toFeedFormState());
    setFormError(null);
    setIsFeedModalOpen(true);
  }

  function openEditFeed(feed: DemoFeed, category: DemoCategory) {
    setFeedFormMode("edit");
    setFeedForm(toFeedFormState(feed, category));
    setFormError(null);
    setIsFeedModalOpen(true);
  }

  function closeFeedModal() {
    setIsFeedModalOpen(false);
    setFormError(null);
  }

  function submitFeedForm() {
    const trimmedTitle = feedForm.title.trim();
    const trimmedFeedUrl = feedForm.feedUrl.trim();
    const trimmedCategoryName = feedForm.categoryName.trim();

    if (!trimmedTitle) {
      setFormError(
        "Give the feed a title so it has a clear label in the sidebar.",
      );
      return;
    }

    if (!trimmedCategoryName) {
      setFormError("Choose a category name so the feed has a home.");
      return;
    }

    if (!likelyFeedUrl(trimmedFeedUrl)) {
      setFormError(
        "Enter a full RSS or Atom URL. A good phase-1 check is a URL containing rss, atom, feed, or xml.",
      );
      return;
    }

    const { feed, category } = buildFeedFromForm(feedForm, allFeeds.length);

    setCategoriesState((current) => {
      const nextCategories = current.map((entry) => ({
        ...entry,
        feeds: [...entry.feeds],
      }));

      if (feedFormMode === "edit" && feedForm.id) {
        nextCategories.forEach((entry) => {
          entry.feeds = entry.feeds.filter(
            (existingFeed) => existingFeed.slug !== feedForm.id,
          );
        });
      }

      let targetCategory = nextCategories.find(
        (entry) => entry.slug === category.slug,
      );

      if (!targetCategory) {
        targetCategory = {
          ...category,
          feeds: [],
        };
        nextCategories.push(targetCategory);
      } else {
        targetCategory.name = category.name;
        targetCategory.color = category.color;
      }

      targetCategory.feeds = [...targetCategory.feeds, feed].sort(
        (left, right) => left.title.localeCompare(right.title),
      );

      return nextCategories
        .filter((entry) => entry.feeds.length > 0)
        .sort((left, right) => left.name.localeCompare(right.name));
    });

    setItemsState((current) => {
      const preservedItems =
        feedFormMode === "edit" && feedForm.id
          ? current.filter((item) => item.feedSlug !== feedForm.id)
          : current;

      return [...createItemsForFeed(feed, category), ...preservedItems];
    });

    if (feedFormMode === "edit" && feedForm.id) {
      setReadIds((current) =>
        current.filter((itemId) => !itemId.startsWith(`${feedForm.id}-`)),
      );
      setSavedIds((current) =>
        current.filter((itemId) => !itemId.startsWith(`${feedForm.id}-`)),
      );
    }

    setActiveCategory(category.slug);
    setActiveView("discover");
    closeFeedModal();
  }

  function removeFeed(feed: DemoFeed) {
    const confirmed = window.confirm(
      `Remove ${feed.title} from your dashboard? This will also remove its seeded articles for phase 1.`,
    );

    if (!confirmed) {
      return;
    }

    setCategoriesState((current) =>
      current
        .map((category) => ({
          ...category,
          feeds: category.feeds.filter((entry) => entry.slug !== feed.slug),
        }))
        .filter((category) => category.feeds.length > 0),
    );

    setItemsState((current) =>
      current.filter((item) => item.feedSlug !== feed.slug),
    );
    setReadIds((current) =>
      current.filter((itemId) => !itemId.startsWith(`${feed.slug}-`)),
    );
    setSavedIds((current) =>
      current.filter((itemId) => !itemId.startsWith(`${feed.slug}-`)),
    );

    if (activeCategory === feed.categorySlug) {
      setActiveCategory("all");
    }
  }

  const initials = viewerName
    .split(" ")
    .map((part) => part[0]?.toUpperCase())
    .join("")
    .slice(0, 2);

  return (
    <div className="dashboard-shell-bg min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-384 flex-col px-3 py-3 lg:px-4">
        <div className="dashboard-frame app-border app-surface overflow-hidden rounded-[28px] border">
          <header className="dashboard-topbar app-border flex flex-wrap items-center justify-between gap-4 border-b px-4 py-4 lg:px-6">
            <div className="flex items-center gap-4">
              <FeedReaderLogo href={logoHref} />
              <nav className="app-bg-secondary flex items-center gap-1 rounded-full p-1">
                {[
                  ["feed", "Feed"],
                  ["digest", "Digest"],
                  ["discover", "Discover"],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    className={clsx(
                      "rounded-full px-4 py-2 text-sm font-medium transition",
                      activeView === id
                        ? "app-surface app-text-primary shadow-sm"
                        : "app-text-secondary",
                    )}
                    onClick={() => setActiveView(id as ViewName)}
                    type="button"
                  >
                    {label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="app-border app-surface app-text-secondary flex min-w-[16rem] items-center gap-2 rounded-2xl border px-4 py-2 text-sm">
                <Search className="h-4 w-4" />
                <span className="screen-reader-only">Search articles</span>
                <input
                  className="app-input app-text-primary w-full border-0 bg-transparent outline-none"
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search articles..."
                  value={searchQuery}
                />
              </label>
              <button
                aria-label="Add feed"
                className="app-border app-surface app-text-secondary flex h-10 w-10 items-center justify-center rounded-2xl border"
                onClick={openCreateFeed}
                type="button"
              >
                <Plus className="h-4 w-4" />
              </button>
              {mode === "member" ? <SignOutButton /> : null}
              <div className="app-bg-accent flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white opacity-75">
                {initials}
              </div>
            </div>
          </header>

          <div className="grid min-h-[calc(100vh-7rem)] lg:grid-cols-[16.5rem_minmax(0,1fr)]">
            <aside className="app-bg-secondary app-border border-r px-4 py-5">
              <div className="space-y-2">
                <button
                  className={sidebarButton(activeCollection === "all")}
                  onClick={() => setActiveCollection("all")}
                  type="button"
                >
                  <span>All Items</span>
                  <span>{unreadTotalCount}</span>
                </button>
                <button
                  className={sidebarButton(activeCollection === "saved")}
                  onClick={() => setActiveCollection("saved")}
                  type="button"
                >
                  <span>Saved</span>
                  <span>{savedIds.length}</span>
                </button>
              </div>

              <div className="app-border mt-8 border-t pt-6">
                <p className="app-text-tertiary mb-3 text-xs font-semibold uppercase tracking-[0.18em]">
                  Categories
                </p>
                <div className="space-y-1.5">
                  <button
                    className={categoryButton(activeCategory === "all")}
                    onClick={() => setActiveCategory("all")}
                    type="button"
                  >
                    <span>Everything</span>
                    <span>{unreadVisibleCount}</span>
                  </button>
                  {categoriesState.map((category) => (
                    <div key={category.slug} className="space-y-1">
                      <button
                        className={categoryButton(
                          activeCategory === category.slug,
                        )}
                        onClick={() => setActiveCategory(category.slug)}
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
                      <div className="space-y-1 pl-5">
                        {category.feeds.map((feed) => (
                          <button
                            key={feed.slug}
                            className="app-text-secondary flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition hover:bg-white"
                            onClick={() => {
                              setActiveCategory(category.slug);
                              setActiveView("feed");
                            }}
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

              <div className="app-border app-surface app-text-secondary mt-8 rounded-2xl border px-4 py-3 text-sm">
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

            <section className="flex min-w-0 flex-col bg-white">
              <div className="app-border flex flex-wrap items-center justify-between gap-4 border-b px-5 py-5 lg:px-7">
                <div>
                  <h1 className="feed-page-title tracking-tight-app app-text-primary font-semibold">
                    {activeCollection === "saved"
                      ? "Saved Items"
                      : activeView === "digest"
                        ? "Digest"
                        : activeView === "discover"
                          ? "Manage Feeds"
                          : "All Items"}
                  </h1>
                  <p className="app-text-tertiary mt-1 text-sm">
                    {activeView === "discover"
                      ? `${allFeeds.length} feeds connected`
                      : `${unreadVisibleCount} unread`}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="app-border flex overflow-hidden rounded-2xl border">
                    <button
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
                  {activeView === "discover" ? (
                    <button
                      className="toolbar-pill"
                      onClick={openCreateFeed}
                      type="button"
                    >
                      <Plus className="h-4 w-4" />
                      Add feed
                    </button>
                  ) : (
                    <button
                      className="toolbar-pill"
                      onClick={markVisibleAsRead}
                      type="button"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
              </div>

              {activeView === "feed" ? (
                <>
                  <div className="feed-banner app-border app-text-accent border-b px-5 py-3 text-sm font-medium lg:px-7">
                    {newItemsCount} new items since your last visit
                  </div>
                  <div className="app-divide-border">
                    {visibleItems.length === 0 ? (
                      <div className="app-text-secondary px-7 py-14">
                        No articles match this view yet.
                      </div>
                    ) : (
                      visibleItems.map((item) => {
                        const category = categoriesState.find(
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
                                {formatDistanceToNowStrict(
                                  new Date(item.publishedAt),
                                  {
                                    addSuffix: true,
                                  },
                                )}
                              </span>
                            </div>
                            <div className="flex items-start justify-between gap-6">
                              <div className="min-w-0 flex-1">
                                <Link
                                  className="feed-item-link block"
                                  href={item.url}
                                  onClick={() => markAsRead(item.id)}
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
                                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition",
                                  isSaved
                                    ? "app-border app-bg-accent-subtle app-text-accent"
                                    : "app-border app-text-tertiary",
                                )}
                                onClick={() => toggleSaved(item.id)}
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
              ) : null}

              {activeView === "digest" ? (
                <div className="grid gap-4 p-5 lg:grid-cols-2 lg:p-7">
                  {visibleItems.slice(0, 5).map((item) => (
                    <article
                      key={item.id}
                      className="dashboard-digest-card app-border rounded-3xl border p-5"
                    >
                      <p className="app-text-accent mb-3 text-sm font-medium">
                        Since your last session
                      </p>
                      <h2 className="mb-2 text-2xl font-semibold tracking-[-0.03em]">
                        {item.title}
                      </h2>
                      <p className="app-text-secondary mb-4 text-sm leading-6">
                        {item.excerpt}
                      </p>
                      <div className="app-text-tertiary text-sm">
                        {item.feedTitle} • {item.categoryName}
                      </div>
                    </article>
                  ))}
                </div>
              ) : null}

              {activeView === "discover" ? (
                <div className="grid gap-4 p-5 lg:grid-cols-2 xl:grid-cols-3 lg:p-7">
                  {categoriesState.map((category) =>
                    category.feeds.map((feed) => (
                      <article
                        key={feed.slug}
                        className="dashboard-discover-card app-border app-surface rounded-3xl border p-5"
                      >
                        <div className="mb-4 flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span
                              className="feed-mini-badge-lg flex h-8 w-8 items-center justify-center rounded-xl font-semibold text-white"
                              style={{ backgroundColor: category.color }}
                            >
                              {feed.badge}
                            </span>
                            <div>
                              <h2 className="text-lg font-semibold">
                                {feed.title}
                              </h2>
                              <p className="app-text-secondary text-sm">
                                {category.name}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              aria-label={`Edit ${feed.title}`}
                              className="app-border app-text-secondary flex h-9 w-9 items-center justify-center rounded-2xl border"
                              onClick={() => openEditFeed(feed, category)}
                              type="button"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              aria-label={`Delete ${feed.title}`}
                              className="app-border flex h-9 w-9 items-center justify-center rounded-2xl border text-red-600"
                              onClick={() => removeFeed(feed)}
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
                              <dt className="app-text-tertiary">
                                Last checked
                              </dt>
                              <dd className="app-text-primary mt-1">
                                {formatDistanceToNowStrict(
                                  new Date(feed.lastFetchedAt),
                                  {
                                    addSuffix: true,
                                  },
                                )}
                              </dd>
                            </div>
                          </div>
                        </dl>
                      </article>
                    )),
                  )}
                </div>
              ) : null}
            </section>
          </div>
        </div>
      </div>

      {isFeedModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4 py-8">
          <div className="app-border app-surface w-full max-w-2xl rounded-[28px] border p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-[-0.03em]">
                  {feedFormMode === "create" ? "Add a feed" : "Edit feed"}
                </h2>
                <p className="app-text-secondary mt-2 text-sm leading-6">
                  Phase 1 validates the feed details, stores them locally, and
                  seeds starter articles so the dashboard updates immediately.
                </p>
              </div>
              <button
                aria-label="Close feed form"
                className="app-border app-text-secondary flex h-10 w-10 items-center justify-center rounded-2xl border"
                onClick={closeFeedModal}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="app-text-secondary text-sm font-medium">
                  Feed title
                </span>
                <input
                  className="app-border w-full rounded-2xl border px-4 py-3 outline-none"
                  onChange={(event) =>
                    setFeedForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  placeholder="Smashing Magazine"
                  value={feedForm.title}
                />
              </label>
              <label className="space-y-2">
                <span className="app-text-secondary text-sm font-medium">
                  Short title
                </span>
                <input
                  className="app-border w-full rounded-2xl border px-4 py-3 outline-none"
                  onChange={(event) =>
                    setFeedForm((current) => ({
                      ...current,
                      shortTitle: event.target.value,
                    }))
                  }
                  placeholder="Smashing Mag"
                  value={feedForm.shortTitle}
                />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="app-text-secondary text-sm font-medium">
                  Feed URL
                </span>
                <input
                  className="app-border w-full rounded-2xl border px-4 py-3 outline-none"
                  onChange={(event) =>
                    setFeedForm((current) => ({
                      ...current,
                      feedUrl: event.target.value,
                    }))
                  }
                  placeholder="https://example.com/feed.xml"
                  value={feedForm.feedUrl}
                />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="app-text-secondary text-sm font-medium">
                  Website URL
                </span>
                <input
                  className="app-border w-full rounded-2xl border px-4 py-3 outline-none"
                  onChange={(event) =>
                    setFeedForm((current) => ({
                      ...current,
                      siteUrl: event.target.value,
                    }))
                  }
                  placeholder="https://example.com"
                  value={feedForm.siteUrl}
                />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="app-text-secondary text-sm font-medium">
                  Description
                </span>
                <textarea
                  className="app-border min-h-28 w-full rounded-2xl border px-4 py-3 outline-none"
                  onChange={(event) =>
                    setFeedForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="A short description of what this source covers."
                  value={feedForm.description}
                />
              </label>
              <label className="space-y-2">
                <span className="app-text-secondary text-sm font-medium">
                  Category
                </span>
                <input
                  className="app-border w-full rounded-2xl border px-4 py-3 outline-none"
                  onChange={(event) =>
                    setFeedForm((current) => ({
                      ...current,
                      categoryName: event.target.value,
                    }))
                  }
                  placeholder="Frontend"
                  value={feedForm.categoryName}
                />
              </label>
              <label className="space-y-2">
                <span className="app-text-secondary text-sm font-medium">
                  Category color
                </span>
                <input
                  className="app-border h-12 w-full rounded-2xl border px-2 py-2 outline-none"
                  onChange={(event) =>
                    setFeedForm((current) => ({
                      ...current,
                      color: event.target.value,
                    }))
                  }
                  type="color"
                  value={feedForm.color}
                />
              </label>
              <label className="space-y-2">
                <span className="app-text-secondary text-sm font-medium">
                  Badge
                </span>
                <input
                  className="app-border w-full rounded-2xl border px-4 py-3 outline-none"
                  maxLength={2}
                  onChange={(event) =>
                    setFeedForm((current) => ({
                      ...current,
                      badge: event.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="SM"
                  value={feedForm.badge}
                />
              </label>
            </div>

            {formError ? (
              <p className="mt-4 text-sm font-medium text-red-600">
                {formError}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
              <button
                className="secondary-cta"
                onClick={closeFeedModal}
                type="button"
              >
                Cancel
              </button>
              <button
                className="primary-cta"
                onClick={submitFeedForm}
                type="button"
              >
                {feedFormMode === "create" ? "Add feed" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function sidebarButton(active: boolean) {
  return clsx(
    "flex w-full items-center justify-between rounded-2xl px-3 py-3 text-sm font-medium transition",
    active ? "app-bg-accent-subtle app-text-accent" : "app-text-secondary",
  );
}

function categoryButton(active: boolean) {
  return clsx(
    "flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-sm font-medium transition",
    active ? "app-surface app-text-primary shadow-sm" : "app-text-secondary",
  );
}
