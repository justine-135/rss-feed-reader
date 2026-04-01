import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { FeedReaderLogo } from "@/components/feed-reader-logo";
import { GithubSignInButton } from "@/components/github-sign-in-button";
import { authConfigReady, getSafeServerSession } from "@/lib/auth";

export default async function SignInPage(props: PageProps<"/auth/signin">) {
  const searchParams = await props.searchParams;
  const callbackUrl =
    typeof searchParams.callbackUrl === "string"
      ? searchParams.callbackUrl
      : "/dashboard";

  const session = await getSafeServerSession();

  if (session?.user) {
    redirect(callbackUrl);
  }

  return (
    <main className="signin-shell min-h-screen px-5 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10">
          <FeedReaderLogo />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="signin-card app-border app-surface rounded-[30px] border p-8">
            <p className="app-text-accent mb-4 text-sm font-semibold uppercase tracking-[0.2em]">
              Member Access
            </p>
            <h1 className="app-text-primary mb-4 text-4xl font-semibold tracking-[-0.04em]">
              Sign in with GitHub to sync Frontpage across devices.
            </h1>
            <p className="app-text-secondary mb-8 max-w-xl text-lg leading-8">
              Phase 1 is guest-ready today, with GitHub sign-in wired for your
              future Neon database. Once your environment variables are set, the
              member dashboard is ready to take over.
            </p>

            {authConfigReady ? (
              <GithubSignInButton
                callbackUrl={callbackUrl}
                className="justify-center"
              />
            ) : (
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <div className="mb-2 flex items-center gap-2 font-semibold">
                  <AlertCircle className="h-4 w-4" />
                  GitHub auth is not configured yet
                </div>
                <p className="leading-6">
                  Add <code>GITHUB_CLIENT_ID</code>,{" "}
                  <code>GITHUB_CLIENT_SECRET</code>, and{" "}
                  <code>AUTH_SECRET</code> before using GitHub sign-in.
                </p>
              </div>
            )}

            {authConfigReady ? (
              <p className="app-text-tertiary mt-4 text-sm leading-6">
                GitHub sign-in now uses secure JWT sessions for phase 1, and
                redirects to the dashboard after a successful login.
              </p>
            ) : null}
          </section>

          <aside className="signin-aside app-border rounded-[30px] border p-8">
            <h2 className="mb-4 text-2xl font-semibold tracking-[-0.03em]">
              What is live in phase 1
            </h2>
            <ul className="app-text-secondary space-y-3 text-sm leading-6">
              <li>Guest dashboard seeded with curated Frontpage sources</li>
              <li>
                Feed, Digest, and Discover views built from the same app shell
              </li>
              <li>Saved and read state persistence for guest browsing</li>
              <li>Prisma schema and Auth.js route wiring for GitHub sign-in</li>
            </ul>

            <div className="mt-8 flex flex-col gap-3">
              <Link className="primary-cta justify-center" href="/guest">
                Continue as Guest
              </Link>
              <Link className="secondary-cta justify-center" href="/">
                Back to landing page
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
