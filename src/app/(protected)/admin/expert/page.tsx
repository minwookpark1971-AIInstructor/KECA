import { getPrograms, getCategories } from "@/lib/supabase/queries";
import { Plus } from "lucide-react";
import Link from "next/link";
import ExpertAdminClient from "./ExpertAdminClient";

export default async function AdminExpertPage() {
  const [allPrograms, categories] = await Promise.all([getPrograms(), getCategories()]);
  const expertPrograms = allPrograms.filter((p) => p.program_type === "expert" || p.program_type === "certification");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">전문가과정 관리</h1>
        <Link
          href="/admin/programs/new?type=expert"
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors"
        >
          <Plus size={16} /> 과정 등록
        </Link>
      </div>

      <ExpertAdminClient programs={expertPrograms} categories={categories} />
    </div>
  );
}
