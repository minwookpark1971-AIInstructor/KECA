import Link from "next/link";
import { getPrograms, getCategories } from "@/lib/supabase/queries";
import { Plus, Edit2, Eye, BookOpen } from "lucide-react";

export default async function AdminProgramsPage() {
  const [programs, categories] = await Promise.all([getPrograms(), getCategories()]);
  const getCategoryById = (id: string) => categories.find((c) => c.id === id);
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">교육프로그램 관리</h1>
        <Link
          href="/admin/programs/new"
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors"
        >
          <Plus size={16} /> 프로그램 등록
        </Link>
      </div>

      <div className="bg-white border border-border-light rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface border-b border-border-light text-text-sub">
                <th className="text-left px-4 py-3 font-medium">프로그램명</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">카테고리</th>
                <th className="text-center px-4 py-3 font-medium hidden md:table-cell">유형</th>
                <th className="text-center px-4 py-3 font-medium">상태</th>
                <th className="text-center px-4 py-3 font-medium">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {programs.map((prog) => {
                const cat = getCategoryById(prog.category_id || "");
                return (
                  <tr key={prog.id} className="hover:bg-surface/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <BookOpen size={14} className="text-primary shrink-0" />
                        <span className="font-medium text-text">{prog.title}</span>
                        {prog.is_featured && <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent">추천</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-sub hidden sm:table-cell">{cat?.name || "-"}</td>
                    <td className="px-4 py-3 text-center hidden md:table-cell">
                      <span className="text-xs text-text-muted">
                        {prog.program_type === "education" ? "교육" : prog.program_type === "expert" ? "전문가" : "자격증"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                        prog.status === "published" ? "bg-green-100 text-green-800" : prog.status === "draft" ? "bg-gray-100 text-gray-600" : "bg-red-100 text-red-600"
                      }`}>
                        {prog.status === "published" ? "공개" : prog.status === "draft" ? "초안" : "보관"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/programs/${prog.slug}`} className="p-1 text-text-muted hover:text-primary"><Eye size={14} /></Link>
                        <Link href={`/admin/programs/${prog.id}`} className="p-1 text-text-muted hover:text-primary"><Edit2 size={14} /></Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
