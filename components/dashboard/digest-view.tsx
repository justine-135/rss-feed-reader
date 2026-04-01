"use client";

import type { DemoItem } from "@/lib/demo-data";

type DigestViewProps = {
  items: DemoItem[];
};

export function DigestView({ items }: DigestViewProps) {
  return (
    <div className="grid gap-4 p-5 lg:grid-cols-2 lg:p-7">
      {items.slice(0, 5).map((item) => (
        <article
          key={item.id}
          className="dashboard-digest-card app-border border p-5"
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
  );
}
