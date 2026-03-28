import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/queries";
import InstructorProfileForm from "./InstructorProfileForm";

export default async function InstructorProfilePage() {
  const instructor = await getCurrentUser();
  if (!instructor) redirect("/login");

  return <InstructorProfileForm instructor={instructor} />;
}
