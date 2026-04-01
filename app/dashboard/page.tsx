import { redirect } from "next/navigation";
import { DashboardApp } from "@/components/dashboard-app";
import { authConfigReady, getSafeServerSession } from "@/lib/auth";
import { getDemoData } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (!authConfigReady) {
    redirect("/auth/signin");
  }

  const session = await getSafeServerSession();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/dashboard");
  }

  const data = getDemoData();

  return (
    <DashboardApp
      authReady={authConfigReady}
      categories={data.categories}
      items={data.items}
      mode="member"
      viewerName={session.user.name ?? "Member"}
    />
  );
}
