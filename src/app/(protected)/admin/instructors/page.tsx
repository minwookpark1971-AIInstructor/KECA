import Link from "next/link";
import { getMembersForAdmin } from "@/lib/supabase/queries";
import InstructorsAdminClient from "./InstructorsAdminClient";
import { Plus } from "lucide-react";

export default async function AdminInstructorsPage() {
  const members = await getMembersForAdmin();
  const instructors = members.filter((u) => u.is_instructor);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">강사관리</h1>
        <Link
          href="/admin/instructors/new"
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors"
        >
          <Plus size={16} /> 강사 등록
        </Link>
      </div>
      <InstructorsAdminClient instructors={instructors} />
    </div>
  );
}
