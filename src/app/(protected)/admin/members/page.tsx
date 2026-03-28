import { getMembersForAdmin } from "@/lib/supabase/queries";
import MembersClient from "./MembersClient";

export default async function AdminMembersPage() {
  const members = await getMembersForAdmin();
  return <MembersClient members={members} />;
}
