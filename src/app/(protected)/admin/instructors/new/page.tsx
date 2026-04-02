import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getApprovedProfiles } from "@/lib/supabase/queries";
import NewInstructorClient from "./NewInstructorClient";

export default async function NewInstructorPage() {
  const approvedProfiles = await getApprovedProfiles();

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/instructors" className="p-2 text-text-muted hover:text-primary rounded-lg hover:bg-surface transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-text">강사 등록</h1>
      </div>
      <NewInstructorClient approvedProfiles={approvedProfiles} />
    </div>
  );
}
