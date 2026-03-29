"use client";

import { useState, useTransition, useEffect } from "react";
import { SubpageHero } from "@/components/layout/SubpageHero";
import { Send, CheckCircle, MapPin, Mail, Clock } from "lucide-react";
import { createInquiry } from "@/lib/supabase/mutations";
import { createClient } from "@/lib/supabase/client";
import type { Category, Program } from "@/types";

export default function InquiryContent({ categories, programs }: { categories: Category[]; programs?: Program[] }) {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);

    startTransition(async () => {
      try {
        await createInquiry({
          inquiry_type: fd.get("inquiry_type") as string,
          company_name: fd.get("company_name") as string,
          contact_name: fd.get("contact_name") as string,
          contact_email: fd.get("contact_email") as string,
          contact_phone: fd.get("contact_phone") as string,
          preferred_category_id: (fd.get("category_id") as string) || undefined,
          preferred_program_id: (fd.get("program_id") as string) || undefined,
          estimated_participants: (fd.get("participants") as string) || undefined,
          preferred_date: (fd.get("preferred_date") as string) || undefined,
          budget_range: (fd.get("budget") as string) || undefined,
          message: fd.get("message") as string,
          user_id: userId || undefined,
        });
        setSubmitted(true);
      } catch {
        setError("문의 접수에 실패했습니다. 잠시 후 다시 시도해주세요.");
      }
    });
  };

  if (submitted) {
    return (
      <>
        <SubpageHero title="교육문의" breadcrumb={[{ label: "교육문의" }]} />
        <section className="py-20">
          <div className="container-custom max-w-lg text-center">
            <CheckCircle size={48} className="text-success mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-text mb-2">문의가 접수되었습니다</h2>
            <p className="text-text-sub text-sm mb-6">담당자가 확인 후 빠른 시일 내에 연락드리겠습니다.</p>
            <button onClick={() => setSubmitted(false)} className="text-sm text-primary underline">새 문의 작성</button>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <SubpageHero
        title="교육문의"
        subtitle="기업·기관 맞춤 교육이 필요하시면 문의해주세요"
        breadcrumb={[{ label: "교육문의" }]}
      />
      <section className="py-16 lg:py-20">
        <div className="container-custom max-w-5xl">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-12">
            {/* 연락처 사이드바 */}
            <div className="bg-surface rounded-xl p-6 lg:p-8 lg:sticky lg:top-28 h-fit">
              <h3 className="text-lg font-bold text-text mb-6">연락처 정보</h3>
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-text-muted mb-0.5">주소</p>
                    <p className="text-sm text-text-sub">서울특별시 도봉구 마들로13길84</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail size={16} className="text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-text-muted mb-0.5">이메일</p>
                    <a href="mailto:info@keca.or.kr" className="text-sm text-primary hover:underline">info@keca.or.kr</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock size={16} className="text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-text-muted mb-0.5">운영시간</p>
                    <p className="text-sm text-text-sub">평일 09:00 - 18:00</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 문의 폼 */}
            <div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 기관 유형 */}
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">기관 유형 <span className="text-error">*</span></label>
              <select name="inquiry_type" required className="w-full px-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                <option value="">선택해주세요</option>
                <option value="corporate">기업</option>
                <option value="institution">교육기관</option>
                <option value="school">학교</option>
                <option value="government">공공기관</option>
                <option value="other">기타</option>
              </select>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">기업/기관명 <span className="text-error">*</span></label>
                <input name="company_name" required type="text" placeholder="기관명을 입력해주세요" className="w-full px-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">담당자명 <span className="text-error">*</span></label>
                <input name="contact_name" required type="text" placeholder="담당자 이름" className="w-full px-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">이메일 <span className="text-error">*</span></label>
                <input name="contact_email" required type="email" placeholder="example@company.com" className="w-full px-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">연락처 <span className="text-error">*</span></label>
                <input name="contact_phone" required type="tel" placeholder="010-1234-5678" className="w-full px-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">관심 교육분야</label>
                <select name="category_id" className="w-full px-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option value="">선택 (선택사항)</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">관심 교육과정</label>
                <select name="program_id" className="w-full px-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option value="">선택 (선택사항)</option>
                  {programs?.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">희망 일정</label>
                <input name="preferred_date" type="text" placeholder="예: 2026년 4월 중" className="w-full px-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">예산 범위</label>
                <select name="budget" className="w-full px-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option value="">선택 (선택사항)</option>
                  <option>100만원 이하</option>
                  <option>100~300만원</option>
                  <option>300~500만원</option>
                  <option>500만원 이상</option>
                  <option>협의 필요</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1.5">상세 내용 <span className="text-error">*</span></label>
              <textarea name="message" required rows={5} placeholder="교육 관련 상세 요청 사항을 입력해주세요" className="w-full px-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y" />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              <Send size={16} />
              {isPending ? "제출 중..." : "교육문의 제출"}
            </button>
          </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
