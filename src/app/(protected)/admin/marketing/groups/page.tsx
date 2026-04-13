import { getMarketingGroups } from "@/lib/supabase/queries";
import GroupsClient from "./GroupsClient";

export default async function GroupsPage() {
  const groups = await getMarketingGroups();
  return <GroupsClient groups={groups} />;
}
