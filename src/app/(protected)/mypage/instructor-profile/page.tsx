import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getCurrentUser } from "@/lib/supabase/queries";
import InstructorProfileEditForm from "./InstructorProfileEditForm";

export const metadata: Metadata = { title: "강사 프로필 관리" };

export default async function InstructorProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // 승인된 회원 이상만 접근 가능
  const allowedRoles = ["approved", "associate", "member", "instructor", "admin"];
  if (!allowedRoles.includes(user.role)) {
    redirect("/mypage");
  }

  return <InstructorProfileEditForm user={user} />;
}
