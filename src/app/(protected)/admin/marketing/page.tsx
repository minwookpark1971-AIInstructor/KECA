import { getMarketingStats } from "@/lib/supabase/queries";
import MarketingDashboardClient from "./MarketingDashboardClient";

export default async function MarketingDashboardPage() {
  const stats = await getMarketingStats();
  return <MarketingDashboardClient stats={stats} />;
}
