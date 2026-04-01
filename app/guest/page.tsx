import { DashboardApp } from "@/components/dashboard-app";
import { getDemoData } from "@/lib/demo-data";

export default function GuestPage() {
  const data = getDemoData();

  return (
    <DashboardApp
      authReady={false}
      categories={data.categories}
      items={data.items}
      mode="guest"
      viewerName="Guest Reader"
    />
  );
}
