"use client";

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { DigestView } from "@/components/dashboard/digest-view";
import { FeedFormModal } from "@/components/dashboard/feed-form-modal";
import { FeedListView } from "@/components/dashboard/feed-list-view";
import { ManageFeedsView } from "@/components/dashboard/manage-feeds-view";
import { useDashboardState } from "@/components/dashboard/use-dashboard-state";
import type { DemoCategory, DemoItem } from "@/lib/demo-data";

type DashboardAppProps = {
  categories: DemoCategory[];
  items: DemoItem[];
  mode: "guest" | "member";
  viewerName: string;
  authReady: boolean;
};

export function DashboardApp(props: DashboardAppProps) {
  const state = useDashboardState(props);

  const pageTitle =
    state.activeCollection === "saved"
      ? "Saved Items"
      : state.activeView === "digest"
        ? "Digest"
        : state.activeView === "discover"
          ? "Manage Feeds"
          : "All Items";

  const pageMeta =
    state.activeView === "discover"
      ? `${state.allFeeds.length} feeds connected`
      : `${state.unreadVisibleCount} unread`;

  return (
    <div className="dashboard-shell-bg min-h-screen">
      <div className="dashboard-layout min-h-screen">
        <DashboardTopbar
          activeView={state.activeView}
          initials={state.initials}
          logoHref={state.logoHref}
          mode={state.mode}
          onAddFeed={state.openCreateFeed}
          onSearchChange={state.setSearchQuery}
          onViewChange={state.setActiveView}
          searchQuery={state.searchQuery}
          showManageAction={state.activeView === "discover"}
          viewerName={state.viewerName}
        />

        <div className="grid min-h-[calc(100vh-4.5rem)] lg:grid-cols-[16.25rem_minmax(0,1fr)]">
          <DashboardSidebar
            activeCategory={state.activeCategory}
            activeCollection={state.activeCollection}
            authReady={state.authReady}
            categories={state.categoriesState}
            countsByCategory={state.countsByCategory}
            countsByFeed={state.countsByFeed}
            mode={state.mode}
            onCategoryChange={state.setActiveCategory}
            onCollectionChange={state.setActiveCollection}
            onSelectFeed={(categorySlug) => {
              state.setActiveCategory(categorySlug);
              state.setActiveView("feed");
            }}
            savedCount={state.savedIds.length}
            unreadTotalCount={state.unreadTotalCount}
            unreadVisibleCount={state.unreadVisibleCount}
          />

          <section className="flex min-w-0 flex-col bg-white">
            <div className="app-border flex flex-wrap items-center justify-between gap-4 border-b px-5 py-5 lg:px-7">
              <div>
                <h1 className="feed-page-title tracking-tight-app app-text-primary font-semibold">
                  {pageTitle}
                </h1>
                <p className="app-text-tertiary mt-1 text-sm">{pageMeta}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {state.activeView === "discover" ? (
                  <button
                    className="toolbar-pill"
                    onClick={state.openCreateFeed}
                    type="button"
                  >
                    Add feed
                  </button>
                ) : (
                  <button
                    className="toolbar-pill"
                    onClick={state.markVisibleAsRead}
                    type="button"
                  >
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            {state.activeView === "feed" ? (
              <FeedListView
                categories={state.categoriesState}
                items={state.visibleItems}
                newItemsCount={state.newItemsCount}
                onMarkAsRead={state.markAsRead}
                onToggleSaved={state.toggleSaved}
                readIds={state.readIds}
                savedIds={state.savedIds}
              />
            ) : null}

            {state.activeView === "digest" ? (
              <DigestView items={state.visibleItems} />
            ) : null}

            {state.activeView === "discover" ? (
              <ManageFeedsView
                categories={state.categoriesState}
                onEditFeed={state.openEditFeed}
                onRemoveFeed={state.removeFeed}
              />
            ) : null}
          </section>
        </div>
      </div>

      <FeedFormModal
        feedForm={state.feedForm}
        feedFormMode={state.feedFormMode}
        formError={state.formError}
        isOpen={state.isFeedModalOpen}
        onChange={state.setFeedForm}
        onClose={state.closeFeedModal}
        onSubmit={state.submitFeedForm}
      />
    </div>
  );
}
