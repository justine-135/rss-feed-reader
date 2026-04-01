"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import type { DemoCategory, DemoFeed, DemoItem } from "@/lib/demo-data";
import {
  buildFeedFromForm,
  createItemsForFeed,
  createStorageKey,
  likelyFeedUrl,
  type CollectionName,
  type FeedFormMode,
  type FeedFormState,
  type PersistedDashboardState,
  toFeedFormState,
  type ViewName,
} from "@/lib/dashboard";

type UseDashboardStateOptions = {
  authReady: boolean;
  categories: DemoCategory[];
  items: DemoItem[];
  mode: "guest" | "member";
  viewerName: string;
};

export function useDashboardState({
  authReady,
  categories,
  items,
  mode,
  viewerName,
}: UseDashboardStateOptions) {
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
  const allFeeds = useMemo(
    () => categoriesState.flatMap((category) => category.feeds),
    [categoriesState],
  );
  const logoHref = mode === "guest" ? "/guest" : "/dashboard";

  const visibleItems = useMemo(
    () =>
      itemsState.filter((item) => {
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
      }),
    [
      activeCategory,
      activeCollection,
      allFeeds,
      itemsState,
      normalizedQuery,
      savedIds,
    ],
  );

  const unreadVisibleCount = useMemo(
    () => visibleItems.filter((item) => !readIds.includes(item.id)).length,
    [readIds, visibleItems],
  );

  const unreadTotalCount = useMemo(
    () =>
      itemsState.filter(
        (item) =>
          allFeeds.some((feed) => feed.slug === item.feedSlug) &&
          !readIds.includes(item.id),
      ).length,
    [allFeeds, itemsState, readIds],
  );

  const newItemsCount = useMemo(
    () => itemsState.filter((item) => item.newSinceVisit).length,
    [itemsState],
  );

  const countsByCategory = useMemo(
    () =>
      categoriesState.reduce<Record<string, number>>((accumulator, category) => {
        accumulator[category.slug] = itemsState.filter(
          (item) =>
            item.categorySlug === category.slug && !readIds.includes(item.id),
        ).length;
        return accumulator;
      }, {}),
    [categoriesState, itemsState, readIds],
  );

  const countsByFeed = useMemo(
    () =>
      allFeeds.reduce<Record<string, number>>((accumulator, feed) => {
        accumulator[feed.slug] = itemsState.filter(
          (item) => item.feedSlug === feed.slug && !readIds.includes(item.id),
        ).length;
        return accumulator;
      }, {}),
    [allFeeds, itemsState, readIds],
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

  return {
    activeCategory,
    activeCollection,
    activeView,
    allFeeds,
    authReady,
    categoriesState,
    countsByCategory,
    countsByFeed,
    feedForm,
    feedFormMode,
    formError,
    initials,
    isFeedModalOpen,
    itemsState,
    logoHref,
    mode,
    newItemsCount,
    readIds,
    savedIds,
    searchQuery,
    unreadTotalCount,
    unreadVisibleCount,
    viewerName,
    visibleItems,
    closeFeedModal,
    markAsRead,
    markVisibleAsRead,
    openCreateFeed,
    openEditFeed,
    removeFeed,
    setActiveCategory,
    setActiveCollection,
    setActiveView,
    setFeedForm,
    setSearchQuery,
    submitFeedForm,
    toggleSaved,
  };
}
