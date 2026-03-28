import { getPrograms, getCategories } from "@/lib/supabase/queries";
import { Plus, BookOpen } from "lucide-react";

export default async function AdminExpertPage() {
  const [allPrograms, categories] = await Promise.all([getPrograms(), getCategories()]);
  const expertPrograms = allPrograms.filter((p) => p.program_type === "expert" || p.program_type === "certification");
  const getCategoryById = (id: string) => categories.find((c) => c.id === id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">전문가과정 관리</h1>
        <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors">
          <Plus size={16} /> 과정 등록
        </button>
      </div>

      {expertPrograms.length > 0 ? (
        <div className="space-y-3">
          {expertPrograms.map((prog) => {
            const cat = getCategoryById(prog.category_id || "");
            return (
              <div key={prog.id} className="bg-white border border-border-light rounded-xl p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                  <BookOpen size={18} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-text">{prog.title}</h3>
                  <p className="text-xs text-text-muted">{cat?.name} · {prog.program_type === "expert" ? "전문가과정" : "자격증과정"}</p>
                </div>
                <span className={`shrink-0 px-2 py-0.5 text-xs rounded-full font-medium ${prog.status === "published" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                  {prog.status === "published" ? "공개" : "초안"}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-border-light rounded-xl p-12 text-center">
          <p className="text-sm text-text-muted">등록된 전문가과정이 없습니다.</p>
        </div>
      )}
    </div>
  );
}
