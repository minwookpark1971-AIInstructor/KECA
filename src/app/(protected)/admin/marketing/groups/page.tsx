import { getMarketingGroups, getAllPrograms } from "@/lib/supabase/queries";
import GroupsClient from "./GroupsClient";

export default async function GroupsPage() {
  const groups = await getMarketingGroups();
  const programs = await getAllPrograms();
  return <GroupsClient groups={groups} programs={programs} />;
}
