import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/queries";
import ProfileEditForm from "./ProfileEditForm";

export default async function ProfileEditPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return <ProfileEditForm user={user} />;
}
