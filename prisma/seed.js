/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const sampleFeeds = require("../data/sample-feeds.json");
const demoItems = require("../data/demo-items.json");

const prisma = new PrismaClient();

const categoryColors = {
  Frontend: "#4F7FFF",
  Design: "#EC4899",
  "Backend & DevOps": "#F59E0B",
  "General Tech": "#6366F1",
  "AI & ML": "#8B5CF6",
};

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  await prisma.savedItem.deleteMany();
  await prisma.readItem.deleteMany();
  await prisma.feedItem.deleteMany();
  await prisma.feed.deleteMany({ where: { isSeeded: true } });
  await prisma.category.deleteMany({ where: { isSystem: true } });

  for (const [categoryIndex, category] of sampleFeeds.categories.entries()) {
    const createdCategory = await prisma.category.create({
      data: {
        name: category.name,
        slug: slugify(category.name),
        color: categoryColors[category.name] ?? "#2563EB",
        isSystem: true,
        sortOrder: categoryIndex,
      },
    });

    for (const [feedIndex, feed] of category.feeds.entries()) {
      const createdFeed = await prisma.feed.create({
        data: {
          title: feed.title,
          slug: slugify(feed.title),
          siteUrl: feed.siteUrl,
          feedUrl: feed.feedUrl,
          description: feed.description,
          isSeeded: true,
          categoryId: createdCategory.id,
          badge: feed.title[0],
          lastFetchedAt: new Date(),
        },
      });

      const itemsForFeed = demoItems.items.filter(
        (item) => item.feedTitle === feed.title,
      );

      for (const item of itemsForFeed) {
        await prisma.feedItem.create({
          data: {
            title: item.title,
            summary: item.excerpt,
            articleUrl: item.url,
            publishedAt: new Date(item.publishedAt),
            newSinceVisit: item.newSinceVisit,
            categoryName: category.name,
            feedId: createdFeed.id,
          },
        });
      }

      if (!itemsForFeed.length) {
        await prisma.feedItem.create({
          data: {
            title: `${feed.title} starter item`,
            summary: feed.description,
            articleUrl: feed.siteUrl,
            publishedAt: new Date(Date.now() - feedIndex * 3_600_000),
            categoryName: category.name,
            feedId: createdFeed.id,
          },
        });
      }
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
