"use client";

import { useState, useTransition } from "react";
import { Plus, Save, X, Trash2, Edit2, Upload, ImagePlus } from "lucide-react";
import { createCategory, updateCategory, deleteCategory, addCategoryImage, deleteCategoryImage } from "@/lib/supabase/mutations";
import type { Category, CategoryImage } from "@/types";

export default function CategoriesClient({ categories, allImages }: { categories: Category[]; allImages: CategoryImage[] }) {
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [imageUrl, setImageUrl] = useState("");
  const [imageUploading, setImageUploading] = useState(false);

  // 소개 이미지 (다중)
  const [catImages, setCatImages] = useState<CategoryImage[]>([]);
  const [introImageUploading, setIntroImageUploading] = useState(false);

  const getImagesForCategory = (catId: string) => allImages.filter((img) => img.category_id === catId);

  const resetForm = () => {
    setName(""); setSlug(""); setDescription(""); setSortOrder("0"); setImageUrl("");
    setCatImages([]);
    setShowForm(false); setEditingId(null);
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setSortOrder(String(cat.sort_order));
    setImageUrl(cat.image_url || "");
    setCatImages(getImagesForCategory(cat.id));
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!name.trim() || !slug.trim()) return;
    startTransition(async () => {
      try {
        if (editingId) {
          await updateCategory(editingId, { name, slug, description: description || null, sort_order: Number(sortOrder), image_url: imageUrl || null });
          setMsg({ type: "success", text: "카테고리가 수정되었습니다." });
        } else {
          await createCategory({ name, slug, description: description || undefined, sort_order: Number(sortOrder) });
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

  const handleUploadImage = async (file: File, setter: (url: string) => void) => {
    if (file.size > 5 * 1024 * 1024) { setMsg({ type: "error", text: "5MB 이하만 가능합니다." }); return; }
    setImageUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "categories");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) setter(data.url);
      else setMsg({ type: "error", text: "업로드 실패: " + data.error });
    } catch { setMsg({ type: "error", text: "이미지 업로드에 실패했습니다." }); }
    setImageUploading(false);
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
            <div>
              <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="URL 경로 * (예: ai-edutech)" className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <p className="text-[10px] text-text-muted mt-1">시스템 내부 URL 경로용 (변경 시 주의)</p>
            </div>
          </div>

          <div className="mb-3">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="소개글 — 프론트 페이지에서 카테고리 선택 시 표시됩니다" rows={3} className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y" />
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">정렬순서</label>
              <input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">대표 이미지 (카드 썸네일)</label>
              {imageUrl ? (
                <div className="relative inline-block">
                  <img src={imageUrl} alt="대표" className="h-20 rounded-lg object-cover" />
                  <button type="button" onClick={() => setImageUrl("")} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white p-0.5 rounded-full"><X size={12} /></button>
                </div>
              ) : (
                <label className="inline-flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-lg text-xs text-text-sub cursor-pointer hover:border-primary/30">
                  <Upload size={14} /> {imageUploading ? "업로드 중..." : "이미지 업로드"}
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" disabled={imageUploading} onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUploadImage(file, setImageUrl);
                    if (e.target) e.target.value = "";
                  }} />
                </label>
              )}
            </div>
          </div>

          {/* 소개 이미지 (최대 5장) — 수정 모드에서만 */}
          {editingId && (
            <div className="mb-3 p-4 bg-surface rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-text">소개 이미지 (최대 5장)</p>
                <span className="text-[10px] text-text-muted">{catImages.length} / 5장</span>
              </div>
              {catImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {catImages.map((img, idx) => (
                    <div key={img.id} className="relative group">
                      <img src={img.image_url} alt={`소개 ${idx + 1}`} className="w-full h-20 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={async () => {
                          if (!confirm("이 이미지를 삭제하시겠습니까?")) return;
                          try {
                            await deleteCategoryImage(img.id);
                            setCatImages((prev) => prev.filter((p) => p.id !== img.id));
                          } catch { setMsg({ type: "error", text: "이미지 삭제에 실패했습니다." }); }
                        }}
                        className="absolute top-1 right-1 bg-black/60 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      ><X size={12} /></button>
                      <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1 rounded">{idx + 1}</span>
                    </div>
                  ))}
                </div>
              )}
              {catImages.length < 5 && (
                <label className="flex items-center justify-center gap-2 p-3 border border-dashed border-border rounded-lg text-xs text-text-sub cursor-pointer hover:border-primary/30">
                  <ImagePlus size={16} />
                  {introImageUploading ? "업로드 중..." : "소개 이미지 추가"}
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" disabled={introImageUploading} onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file || !editingId) return;
                    if (file.size > 5 * 1024 * 1024) { setMsg({ type: "error", text: "5MB 이하만 가능합니다." }); return; }
                    setIntroImageUploading(true);
                    try {
                      const fd = new FormData();
                      fd.append("file", file);
                      fd.append("folder", "categories");
                      const res = await fetch("/api/upload", { method: "POST", body: fd });
                      const data = await res.json();
                      if (res.ok) {
                        await addCategoryImage(editingId, data.url, catImages.length);
                        setCatImages((prev) => [...prev, { id: crypto.randomUUID(), category_id: editingId, image_url: data.url, sort_order: prev.length, created_at: new Date().toISOString() }]);
                      } else { setMsg({ type: "error", text: "업로드 실패: " + data.error }); }
                    } catch { setMsg({ type: "error", text: "이미지 업로드에 실패했습니다." }); }
                    setIntroImageUploading(false);
                    e.target.value = "";
                  }} />
                </label>
              )}
            </div>
          )}

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
        {categories.map((cat, i) => {
          const images = getImagesForCategory(cat.id);
          return (
            <div key={cat.id} className="bg-white border border-border-light rounded-xl overflow-hidden">
              {cat.image_url && (
                <img src={cat.image_url} alt={cat.name} className="w-full h-32 object-cover" />
              )}
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-semibold text-text">{cat.name}</h3>
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEdit(cat)} disabled={isPending} className="p-1.5 text-text-muted hover:text-primary rounded disabled:opacity-50"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(cat)} disabled={isPending} className="p-1.5 text-text-muted hover:text-error rounded disabled:opacity-50"><Trash2 size={14} /></button>
                  </div>
                </div>
                {cat.description && <p className="text-xs text-text-sub mt-2 line-clamp-2">{cat.description}</p>}
                {images.length > 0 && (
                  <p className="text-[10px] text-text-muted mt-2">소개 이미지: {images.length}장</p>
                )}
                <div className="mt-3 pt-3 border-t border-border-light flex items-center justify-between text-xs text-text-muted">
                  <span>정렬: {cat.sort_order || i + 1}</span>
                  <span className={cat.is_active ? "text-success" : "text-error"}>{cat.is_active ? "활성" : "비활성"}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
