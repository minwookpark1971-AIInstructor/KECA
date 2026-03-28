"use client";

import { useState, useTransition } from "react";
import { Plus, Save, X, Trash2, Edit2 } from "lucide-react";
import { createCategory, updateCategory, deleteCategory } from "@/lib/supabase/mutations";
import type { Category } from "@/types";

export default function CategoriesClient({ categories }: { categories: Category[] }) {
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [iconName, setIconName] = useState("");
  const [sortOrder, setSortOrder] = useState("0");

  const resetForm = () => {
    setName(""); setSlug(""); setDescription(""); setIconName(""); setSortOrder("0");
    setShowForm(false); setEditingId(null);
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setIconName(cat.icon_name || "");
    setSortOrder(String(cat.sort_order));
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!name.trim() || !slug.trim()) return;
    startTransition(async () => {
      try {
        if (editingId) {
          await updateCategory(editingId, { name, slug, description: description || null, icon_name: iconName || null, sort_order: Number(sortOrder) });
          setMsg({ type: "success", text: "카테고리가 수정되었습니다." });
        } else {
          await createCategory({ name, slug, description: description || undefined, icon_name: iconName || undefined, sort_order: Number(sortOrder) });
          setMsg({ type: "success", text: "카테고리가 추가되었습니다." });
        }
        resetForm();
      } catch { setMsg({ type: "error", text: "저장에 실패했습니다." }); }
    });
  };

  const handleDelete = (cat: Category) => {
    if (!confirm(`"${cat.name}" 카테고리를 삭제하시겠습니까?`)) return;
    startTransition(async () => {
      try {
        await deleteCategory(cat.id);
        setMsg({ type: "success", text: "카테고리가 삭제되었습니다." });
      } catch { setMsg({ type: "error", text: "삭제에 실패했습니다. 해당 카테고리에 프로그램이 있을 수 있습니다." }); }
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">교육분야 관리</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors">
          <Plus size={16} /> 분야 추가
        </button>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${msg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{msg.text}</div>
      )}

      {showForm && (
        <div className="bg-white border border-primary/20 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-bold text-text mb-3">{editingId ? "카테고리 수정" : "새 카테고리"}</h3>
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="카테고리명 *" className="px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="URL slug * (예: ai-edutech)" className="px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="grid sm:grid-cols-3 gap-3 mb-3">
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="설명 (선택)" className="px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <input type="text" value={iconName} onChange={(e) => setIconName(e.target.value)} placeholder="아이콘 (선택)" className="px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} placeholder="정렬순서" className="px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSubmit} disabled={isPending} className="flex items-center gap-1 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-light disabled:opacity-50">
              <Save size={14} /> {isPending ? "저장 중..." : editingId ? "수정" : "추가"}
            </button>
            <button onClick={resetForm} className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-text-sub border border-border-light hover:bg-surface">
              <X size={14} /> 취소
            </button>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat, i) => (
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
                <button onClick={() => startEdit(cat)} disabled={isPending} className="p-1.5 text-text-muted hover:text-primary rounded disabled:opacity-50"><Edit2 size={14} /></button>
                <button onClick={() => handleDelete(cat)} disabled={isPending} className="p-1.5 text-text-muted hover:text-error rounded disabled:opacity-50"><Trash2 size={14} /></button>
              </div>
            </div>
            {cat.description && <p className="text-xs text-text-sub mt-3">{cat.description}</p>}
            <div className="mt-3 pt-3 border-t border-border-light flex items-center justify-between text-xs text-text-muted">
              <span>정렬: {cat.sort_order || i + 1}</span>
              <span className={cat.is_active ? "text-success" : "text-error"}>{cat.is_active ? "활성" : "비활성"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
