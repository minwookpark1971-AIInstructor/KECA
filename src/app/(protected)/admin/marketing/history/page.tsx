import { getMarketingCampaigns } from "@/lib/supabase/queries";
import HistoryClient from "./HistoryClient";

export default async function MarketingHistoryPage() {
  const campaigns = await getMarketingCampaigns();
  return <HistoryClient campaigns={campaigns} />;
}
