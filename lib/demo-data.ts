import sampleFeeds from "@/data/sample-feeds.json";
import demoItems from "@/data/demo-items.json";

const categoryColors: Record<string, string> = {
  Frontend: "#4F7FFF",
  Design: "#EC4899",
  "Backend & DevOps": "#F59E0B",
  "General Tech": "#6366F1",
  "AI & ML": "#8B5CF6",
};

const feedAliases: Record<string, string> = {
  "Smashing Magazine": "Smashing Mag",
  "Simon Willison's Weblog": "Simon Willison",
  "Nielsen Norman Group": "NN Group",
};

const feedBadges: Record<string, string> = {
  "CSS-Tricks": "C",
  "Smashing Magazine": "S",
  "Josh W. Comeau": "J",
  "Kent C. Dodds": "K",
  "web.dev": "W",
  "MDN Blog": "M",
  "Sidebar.io": "S",
  "Nielsen Norman Group": "N",
  "Figma Blog": "F",
  "A List Apart": "A",
  "UX Collective": "U",
  "Cloudflare Blog": "C",
  "Vercel Blog": "V",
  "The GitHub Blog": "G",
  "Netlify Blog": "N",
  "The Pragmatic Engineer": "P",
  "Hacker News Best": "H",
  "Simon Willison's Weblog": "S",
  "Hugging Face Blog": "H",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type DemoFeed = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  feedUrl: string;
  siteUrl: string;
  badge: string;
  categorySlug: string;
  healthStatus: "active" | "stale" | "error";
  lastFetchedAt: string;
};

export type DemoCategory = {
  slug: string;
  name: string;
  color: string;
  feeds: DemoFeed[];
};

export type DemoItem = {
  id: string;
  title: string;
  excerpt: string;
  url: string;
  publishedAt: string;
  newSinceVisit: boolean;
  feedTitle: string;
  feedSlug: string;
  categoryName: string;
  categorySlug: string;
};

export function getDemoCategories(): DemoCategory[] {
  return sampleFeeds.categories.map((category) => ({
    slug: slugify(category.name),
    name: category.name,
    color: categoryColors[category.name] ?? "#2563EB",
    feeds: category.feeds.map((feed) => ({
      slug: slugify(feed.title),
      title: feed.title,
      shortTitle: feedAliases[feed.title] ?? feed.title,
      description: feed.description,
      feedUrl: feed.feedUrl,
      siteUrl: feed.siteUrl,
      badge: feedBadges[feed.title] ?? feed.title[0]?.toUpperCase() ?? "?",
      categorySlug: slugify(category.name),
      healthStatus: "active",
      lastFetchedAt: new Date("2026-04-01T10:00:00.000Z").toISOString(),
    })),
  }));
}

export function getDemoItems(): DemoItem[] {
  return demoItems.items.map((item) => ({
    ...item,
    feedSlug: slugify(item.feedTitle),
    categorySlug: slugify(item.categoryName),
  }));
}

export function getDemoData() {
  const categories = getDemoCategories();
  const items = getDemoItems();

  return {
    categories,
    items,
    unreadCount: items.length,
    newItemsCount: items.filter((item) => item.newSinceVisit).length,
  };
}
