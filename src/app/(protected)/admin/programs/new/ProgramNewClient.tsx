"use client";

import { Save, Upload } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProgram } from "@/lib/supabase/mutations";
import type { Category } from "@/types";

export default function ProgramNewClient({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [programType, setProgramType] = useState("education");
  const [targetAudience, setTargetAudience] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("프로그램명을 입력해주세요.");
      return;
    }

    setError(null);
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 80);

    startTransition(async () => {
      try {
        await createProgram({
          title,
          slug: slug || `program-${Date.now()}`,
          category_id: category || undefined,
          program_type: programType,
          target_audience: targetAudience || undefined,
          duration: duration || undefined,
          description: description || undefined,
          status: "draft",
        });
        router.push("/admin/programs");
      } catch (err) {
        setError(err instanceof Error ? err.message : "프로그램 등록에 실패했습니다.");
      }
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-6">교육프로그램 등록</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {/* 기본 정보 */}
        <div className="bg-white border border-border-light rounded-xl p-6">
          <h2 className="text-sm font-bold text-text mb-4">기본 정보</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">프로그램명 <span className="text-red-500">*</span></label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="교육프로그램 제목" required className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">카테고리</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="">선택하세요</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">유형</label>
                <select value={programType} onChange={(e) => setProgramType(e.target.value)} className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
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
              <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="교육 과정에 대한 상세 설명" className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
            </div>
          </div>
        </div>

        {/* 이미지 업로드 (추후 확장) */}
        <div className="bg-white border border-border-light rounded-xl p-6">
          <h2 className="text-sm font-bold text-text mb-4">이미지</h2>
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
            <Upload size={32} className="mx-auto text-text-muted/40 mb-2" />
            <p className="text-sm text-text-sub">PNG, JPG 이미지를 드래그하거나 클릭하여 업로드</p>
            <p className="text-xs text-text-muted mt-1">이미지 업로드는 추후 지원 예정입니다</p>
          </div>
        </div>

        {/* 저장 */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors disabled:opacity-50"
          >
            <Save size={16} /> {isPending ? "등록 중..." : "등록"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-text-sub border border-border-light hover:bg-surface transition-colors"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}
