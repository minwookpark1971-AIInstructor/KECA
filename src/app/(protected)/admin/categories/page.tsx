import { mockCategories } from "@/lib/mock-data";
import { FolderOpen, Plus, Edit2, Trash2 } from "lucide-react";

export default function AdminCategoriesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">교육분야 관리</h1>
        <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors">
          <Plus size={16} /> 분야 추가
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockCategories.map((cat, i) => (
          <div key={cat.id} className="bg-white border border-border-light rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary text-lg">
                  {cat.icon_name || "📚"}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text">{cat.name}</h3>
                  <p className="text-xs text-text-muted">/{cat.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1.5 text-text-muted hover:text-primary rounded transition-colors"><Edit2 size={14} /></button>
                <button className="p-1.5 text-text-muted hover:text-error rounded transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
            {cat.description && (
              <p className="text-xs text-text-sub mt-3">{cat.description}</p>
            )}
            <div className="mt-3 pt-3 border-t border-border-light flex items-center justify-between text-xs text-text-muted">
              <span>정렬: {cat.sort_order || i + 1}</span>
              <span className={cat.is_active ? "text-success" : "text-error"}>
                {cat.is_active ? "활성" : "비활성"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
