"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createLecture, updateLecture } from "@/lib/supabase/mutations";
import type { Category, Lecture } from "@/types";

interface Props {
  categories: Category[];
  lecture?: Lecture;
}

export default function LectureForm({ categories, lecture }: Props) {
  const router = useRouter();
  const isEdit = !!lecture;

  const [form, setForm] = useState({
    title: lecture?.title ?? "",
    description: lecture?.description ?? "",
    category_id: lecture?.category_id ?? "",
    location: lecture?.location ?? "",
    lecture_date: lecture?.lecture_date ?? "",
    lecture_time: lecture?.lecture_time ?? "",
    duration: lecture?.duration ?? "",
    target: lecture?.target ?? "",
    required_count: lecture?.required_count ?? 1,
    fee: lecture?.fee ?? "",
    requirements: lecture?.requirements ?? "",
    status: lecture?.status ?? "open",
    deadline: lecture?.deadline ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxApplicants = Math.ceil(form.required_count * 1.5);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "required_count" ? Number(value) : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (isEdit) {
        await updateLecture(lecture.id, form);
      } else {
        await createLecture(form);
      }
      router.push("/admin/lectures");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장 실패");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl border border-border-light p-6 space-y-5">
        {/* 제목 */}
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">
            공고 제목 <span className="text-red-500">*</span>
          </label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="강의공고 제목"
            className="w-full border border-border-light rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* 설명 */}
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">공고 설명</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="강의 내용, 특이사항 등을 작성해주세요."
            className="w-full border border-border-light rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>

        {/* 분야 + 상태 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">교육 분야</label>
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              className="w-full border border-border-light rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">분야 선택</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">모집 상태</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border border-border-light rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="open">모집중</option>
              <option value="closed">마감</option>
              <option value="completed">완료</option>
            </select>
          </div>
        </div>

        {/* 날짜/시간/소요시간 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">강의 일자</label>
            <input
              type="date"
              name="lecture_date"
              value={form.lecture_date}
              onChange={handleChange}
              className="w-full border border-border-light rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">강의 시간</label>
            <input
              name="lecture_time"
              value={form.lecture_time}
              onChange={handleChange}
              placeholder="예: 14:00~16:00"
              className="w-full border border-border-light rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">소요 시간</label>
            <input
              name="duration"
              value={form.duration}
              onChange={handleChange}
              placeholder="예: 2시간"
              className="w-full border border-border-light rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* 장소 + 교육대상 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">장소</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="강의 장소"
              className="w-full border border-border-light rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">교육 대상</label>
            <input
              name="target"
              value={form.target}
              onChange={handleChange}
              placeholder="예: 중학생, 학부모 등"
              className="w-full border border-border-light rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* 필요 인원 + 강사료 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              필요 강사 수 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="required_count"
              value={form.required_count}
              onChange={handleChange}
              min={1}
              className="w-full border border-border-light rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <p className="mt-1 text-xs text-text-sub">
              1.5배수 접수: 최대 <strong className="text-primary">{maxApplicants}명</strong> 선발 예정
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">강사료</label>
            <input
              name="fee"
              value={form.fee}
              onChange={handleChange}
              placeholder="예: 시간당 100,000원"
              className="w-full border border-border-light rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* 마감일 */}
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">지원 마감일</label>
          <input
            type="date"
            name="deadline"
            value={form.deadline}
            onChange={handleChange}
            className="w-full sm:w-48 border border-border-light rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* 지원 자격 요건 */}
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">지원 자격 요건</label>
          <textarea
            name="requirements"
            value={form.requirements}
            onChange={handleChange}
            rows={3}
            placeholder="지원 자격, 우대 사항 등을 작성해주세요."
            className="w-full border border-border-light rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 sm:flex-none px-6 py-2.5 border border-border-light rounded-lg text-sm text-text-sub hover:bg-surface transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 sm:flex-none px-8 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {saving ? "저장 중..." : isEdit ? "수정 저장" : "공고 등록"}
        </button>
      </div>
    </form>
  );
}
