"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, Trash2, ArrowLeft, Eye, Upload, X, ImagePlus } from "lucide-react";
import { updateProgram, deleteProgram, addProgramImage, deleteProgramImage } from "@/lib/supabase/mutations";
import type { Program, Category, ProgramImage } from "@/types";

export default function ProgramEditClient({
  program,
  categories,
  initialImages = [],
}: {
  program: Program;
  categories: Category[];
  initialImages?: ProgramImage[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [title, setTitle] = useState(program.title);
  const [categoryId, setCategoryId] = useState(program.category_id || "");
  const [programType, setProgramType] = useState(program.program_type);
  const [targetAudience, setTargetAudience] = useState(program.target_audience || "");
  const [duration, setDuration] = useState(program.duration || "");
  const [description, setDescription] = useState(program.description || "");
  const [status, setStatus] = useState(program.status);
  const [isFeatured, setIsFeatured] = useState(program.is_featured);
  const [thumbnailUrl, setThumbnailUrl] = useState(program.thumbnail_url || "");
  const [imageUploading, setImageUploading] = useState(false);
  const [programImages, setProgramImages] = useState<ProgramImage[]>(initialImages);
  const [introImageUploading, setIntroImageUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setMsg({ type: "error", text: "이미지 크기는 5MB 이하여야 합니다." }); return; }
    setImageUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "programs");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { setMsg({ type: "error", text: "업로드 실패: " + data.error }); }
      else { setThumbnailUrl(data.url); }
    } catch { setMsg({ type: "error", text: "이미지 업로드에 실패했습니다." }); }
    setImageUploading(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    startTransition(async () => {
      try {
        await updateProgram(program.id, {
          title,
          category_id: categoryId || null,
          program_type: programType,
          target_audience: targetAudience || null,
          duration: duration || null,
          description: description || null,
          status,
          is_featured: isFeatured,
          thumbnail_url: thumbnailUrl || null,
        });
        setMsg({ type: "success", text: "프로그램이 저장되었습니다." });
      } catch {
        setMsg({ type: "error", text: "저장에 실패했습니다." });
      }
    });
  };

  const handleDelete = () => {
    if (!confirm(`"${program.title}" 프로그램을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) return;
    startTransition(async () => {
      try {
        await deleteProgram(program.id);
        router.push("/admin/programs");
      } catch {
        setMsg({ type: "error", text: "삭제에 실패했습니다." });
      }
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/programs" className="p-2 text-text-muted hover:text-primary rounded-lg hover:bg-surface transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-text">프로그램 수정</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/programs/${program.slug}`}
            target="_blank"
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-text-sub border border-border-light rounded-lg hover:bg-surface"
          >
            <Eye size={12} /> 공개 페이지
          </Link>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 size={12} /> 삭제
          </button>
        </div>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${msg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
        {/* 기본 정보 */}
        <div className="bg-white border border-border-light rounded-xl p-6">
          <h2 className="text-sm font-bold text-text mb-4">기본 정보</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">프로그램명 <span className="text-red-500">*</span></label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">카테고리</label>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="">선택하세요</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">유형</label>
                <select value={programType} onChange={(e) => setProgramType(e.target.value as Program["program_type"])} className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="education">교육프로그램</option>
                  <option value="expert">전문가과정</option>
                  <option value="certification">자격증과정</option>
                </select>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">대상</label>
                <input type="text" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="기업 임직원, 대학생 등" className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">소요시간</label>
                <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="4시간, 2일(16시간)" className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">과정 설명</label>
              <textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y" />
            </div>
          </div>
        </div>

        {/* 썸네일 이미지 */}
        <div className="bg-white border border-border-light rounded-xl p-6">
          <h2 className="text-sm font-bold text-text mb-4">썸네일 이미지</h2>
          {thumbnailUrl ? (
            <div className="relative">
              <img src={thumbnailUrl} alt="썸네일" className="w-full max-h-60 object-cover rounded-lg" />
              <button type="button" onClick={() => setThumbnailUrl("")} className="absolute top-2 right-2 bg-white/90 text-text-muted hover:text-error px-2 py-1 rounded text-xs">삭제</button>
            </div>
          ) : (
            <label className="block border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/30 transition-colors">
              <Upload size={32} className="mx-auto text-text-muted/40 mb-2" />
              <p className="text-sm text-text-sub">{imageUploading ? "업로드 중..." : "PNG, JPG 이미지를 클릭하여 업로드"}</p>
              <p className="text-xs text-text-muted mt-1">최대 5MB</p>
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageUpload} disabled={imageUploading} className="hidden" />
            </label>
          )}
        </div>

        {/* 과정소개 이미지 (최대 5장) */}
        <div className="bg-white border border-border-light rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-text">과정소개 이미지</h2>
            <span className="text-xs text-text-muted">{programImages.length} / 5장</span>
          </div>

          {programImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              {programImages.map((img, idx) => (
                <div key={img.id} className="relative group">
                  <img src={img.image_url} alt={`과정소개 ${idx + 1}`} className="w-full h-32 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!confirm("이 이미지를 삭제하시겠습니까?")) return;
                      try {
                        await deleteProgramImage(img.id, program.id);
                        setProgramImages((prev) => prev.filter((p) => p.id !== img.id));
                      } catch {
                        setMsg({ type: "error", text: "이미지 삭제에 실패했습니다." });
                      }
                    }}
                    className="absolute top-1.5 right-1.5 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                  <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">{idx + 1}</span>
                </div>
              ))}
            </div>
          )}

          {programImages.length < 5 && (
            <label className="block border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/30 transition-colors">
              <ImagePlus size={28} className="mx-auto text-text-muted/40 mb-2" />
              <p className="text-sm text-text-sub">
                {introImageUploading ? "업로드 중..." : "과정을 설명하는 이미지를 업로드하세요"}
              </p>
              <p className="text-xs text-text-muted mt-1">PNG, JPG (최대 5MB) · 회원에게 슬라이드로 표시됩니다</p>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={introImageUploading}
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 5 * 1024 * 1024) {
                    setMsg({ type: "error", text: "이미지 크기는 5MB 이하여야 합니다." });
                    return;
                  }
                  setIntroImageUploading(true);
                  try {
                    const fd = new FormData();
                    fd.append("file", file);
                    fd.append("folder", "programs");
                    const res = await fetch("/api/upload", { method: "POST", body: fd });
                    const data = await res.json();
                    if (!res.ok) {
                      setMsg({ type: "error", text: "업로드 실패: " + data.error });
                    } else {
                      await addProgramImage(program.id, data.url, programImages.length);
                      setProgramImages((prev) => [
                        ...prev,
                        { id: crypto.randomUUID(), program_id: program.id, image_url: data.url, sort_order: prev.length, created_at: new Date().toISOString() },
                      ]);
                    }
                  } catch {
                    setMsg({ type: "error", text: "이미지 업로드에 실패했습니다." });
                  }
                  setIntroImageUploading(false);
                  e.target.value = "";
                }}
              />
            </label>
          )}
        </div>

        {/* 공개 설정 */}
        <div className="bg-white border border-border-light rounded-xl p-6">
          <h2 className="text-sm font-bold text-text mb-4">공개 설정</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">상태</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as Program["status"])} className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option value="draft">초안</option>
                <option value="published">공개</option>
                <option value="archived">보관</option>
              </select>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-4 h-4 accent-primary" />
              <div>
                <p className="text-sm font-medium text-text">추천 프로그램</p>
                <p className="text-xs text-text-muted">홈페이지 추천 교육 섹션에 표시됩니다.</p>
              </div>
            </label>
          </div>
        </div>

        {/* 저장 */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors disabled:opacity-50"
          >
            <Save size={16} /> {isPending ? "저장 중..." : "저장"}
          </button>
          <Link href="/admin/programs" className="px-6 py-2.5 rounded-lg text-sm font-medium text-text-sub border border-border-light hover:bg-surface transition-colors">
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
