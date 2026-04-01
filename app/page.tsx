import Link from "next/link";
import { getSafeServerSession, authConfigReady } from "@/lib/auth";
import { ArrowRight, Layers3, Newspaper, Sparkles } from "lucide-react";
import { FeedReaderLogo } from "@/components/feed-reader-logo";
import { GithubSignInButton } from "@/components/github-sign-in-button";

const highlights = [
  {
    title: "A calm reading dashboard",
    description:
      "Track every source you follow in a dense, quiet interface designed for people who read for work.",
    icon: Newspaper,
  },
  {
    title: "Digest and discovery built in",
    description:
      "Move from today's stream into highlights and curated starter packs without losing context.",
    icon: Sparkles,
  },
  {
    title: "One front page for the web",
    description:
      "Organize feeds by category, save standouts for later, and keep the whole reading system in sync.",
    icon: Layers3,
  },
];

export default async function Home() {
  const session = await getSafeServerSession();
  const homeHref = session?.user ? "/dashboard" : "/";

  return (
    <main className="landing-shell min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[var(--page-max-width)] flex-col px-5 py-5 sm:px-8 lg:px-10">
        <header className="landing-header app-border flex items-center justify-between rounded-[28px] border px-5 py-4 backdrop-blur md:px-6">
          <FeedReaderLogo href={homeHref} />
          <nav className="hidden items-center gap-3 md:flex">
            <Link className="landing-nav-link" href="#features">
              Features
            </Link>
            <Link className="landing-nav-link" href="#preview">
              Preview
            </Link>
            <Link className="landing-nav-link" href="/guest">
              Try as Guest
            </Link>
          </nav>
          <GithubSignInButton
            className="hidden md:inline-flex"
            disabled={!authConfigReady}
          />
        </header>

        <section className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[1.08fr_0.92fr] lg:py-18">
          <div className="space-y-8">
            <div className="app-border app-surface app-text-secondary inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium shadow-sm">
              <span className="app-bg-accent h-2 w-2 rounded-full" />
              Your personalized front page for tech content
            </div>

            <div className="max-w-2xl space-y-5">
              <h1 className="app-text-primary max-w-3xl text-4xl font-semibold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                Read the web like it was designed for you.
              </h1>
              <p className="app-text-secondary max-w-2xl text-lg leading-8 sm:text-xl">
                Frontpage brings RSS and Atom feeds into a focused dashboard
                with digest views, saved reading, and a guest experience that is
                ready from the first click.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link className="primary-cta" href="/guest">
                Try as Guest
                <ArrowRight className="h-4 w-4" />
              </Link>
              <GithubSignInButton
                className="secondary-cta justify-center"
                disabled={!authConfigReady}
              />
            </div>

            <div
              id="features"
              className="app-border grid gap-4 border-t pt-8 sm:grid-cols-3"
            >
              {highlights.map(({ title, description, icon: Icon }) => (
                <article
                  key={title}
                  className="landing-card app-border rounded-[24px] border p-5"
                >
                  <div className="app-bg-accent-subtle app-text-accent mb-4 flex h-11 w-11 items-center justify-center rounded-2xl">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="app-text-primary mb-2 text-lg font-semibold">
                    {title}
                  </h2>
                  <p className="app-text-secondary text-sm leading-6">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div id="preview" className="relative">
            <div className="landing-preview-glow absolute inset-x-[8%] top-6 -z-10 h-32 rounded-full blur-3xl" />
            <div className="landing-preview-frame app-border app-surface overflow-hidden rounded-[30px] border">
              <div className="landing-preview-topbar app-border border-b px-5 py-4">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FeedReaderLogo compact href={homeHref} />
                    <div className="app-bg-tertiary app-text-secondary hidden rounded-full px-3 py-1 text-sm font-medium sm:block">
                      Feed
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="app-border app-text-tertiary hidden rounded-full border px-4 py-2 text-sm sm:block">
                      Search articles...
                    </div>
                    <div className="app-bg-accent flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white opacity-75">
                      MS
                    </div>
                  </div>
                </div>
                <div className="app-bg-accent-subtle app-text-accent rounded-2xl px-4 py-3 text-sm font-medium">
                  5 new items since your last visit
                </div>
              </div>

              <div className="grid min-h-[30rem] grid-cols-[15rem_minmax(0,1fr)]">
                <aside className="app-bg-secondary app-border border-r px-4 py-5">
                  <div className="space-y-2">
                    <div className="app-bg-accent-subtle app-text-accent rounded-2xl px-3 py-3 text-sm font-semibold">
                      All Items
                    </div>
                    <div className="app-text-secondary px-3 py-2 text-sm">
                      Saved
                    </div>
                  </div>
                  <div className="mt-8 space-y-3 text-sm">
                    {["Frontend", "Design", "Backend & DevOps", "General Tech", "AI & ML"].map(
                      (item) => (
                        <div
                          key={item}
                          className="app-text-secondary flex items-center justify-between"
                        >
                          <span>{item}</span>
                          <span className="app-text-tertiary">
                            {Math.floor(item.length * 1.7)}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </aside>

                <div className="bg-white">
                  {[
                    {
                      title: "Practical Guide To Designing For Colorblind Users",
                      source: "Smashing Magazine",
                      category: "Design",
                    },
                    {
                      title: "How We Reduced P99 Latency by 60% with Edge-First Caching",
                      source: "Cloudflare Blog",
                      category: "Backend & DevOps",
                    },
                    {
                      title: "Building Effective RAG Systems: What Actually Works in Production",
                      source: "Simon Willison",
                      category: "AI & ML",
                    },
                  ].map((item) => (
                    <article
                      key={item.title}
                      className="app-border border-b px-6 py-5"
                    >
                      <div className="app-text-tertiary mb-2 flex items-center gap-2 text-sm">
                        <span className="app-bg-unread h-2 w-2 rounded-full" />
                        {item.source}
                      </div>
                      <h3 className="app-text-primary mb-2 text-2xl font-semibold tracking-[-0.03em]">
                        {item.title}
                      </h3>
                      <p className="app-text-secondary mb-3 max-w-2xl text-base leading-7">
                        Dense enough to scan, calm enough to read, and polished
                        enough to feel like a real product from the moment the
                        dashboard opens.
                      </p>
                      <span className="app-bg-accent-subtle app-text-accent inline-flex rounded-full px-3 py-1 text-xs font-semibold">
                        {item.category}
                      </span>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
