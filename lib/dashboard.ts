import type { DemoCategory, DemoFeed, DemoItem } from "@/lib/demo-data";

export type ViewName = "feed" | "digest" | "discover";
export type CollectionName = "all" | "saved";
export type FeedFormMode = "create" | "edit";

export type FeedFormState = {
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

export type PersistedDashboardState = {
  categories: DemoCategory[];
  items: DemoItem[];
  readIds: string[];
  savedIds: string[];
};

export const defaultColor = "#2563EB";

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createStorageKey(mode: "guest" | "member", viewerName: string) {
  return `frontpage-dashboard-state:${mode}:${slugify(viewerName || "reader")}`;
}

export function toFeedFormState(
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

export function likelyFeedUrl(value: string) {
  return /^(https?:\/\/).+/.test(value) && /(rss|atom|feed|xml)/i.test(value);
}

export function buildFeedFromForm(
  form: FeedFormState,
  existingFeedCount: number,
) {
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

export function createItemsForFeed(
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
