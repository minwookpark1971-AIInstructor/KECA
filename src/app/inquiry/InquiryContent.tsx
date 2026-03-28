"use client";

import { useState } from "react";
import { SubpageHero } from "@/components/layout/SubpageHero";
import { Send, CheckCircle } from "lucide-react";
import type { Category } from "@/types";

export default function InquiryContent({ categories }: { categories: Category[] }) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API 연동 (현재 목업)
    setSubmitted(true);
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
        <div className="container-custom max-w-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 기관 유형 */}
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">기관 유형 <span className="text-error">*</span></label>
              <select required className="w-full px-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
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
                <input required type="text" placeholder="기관명을 입력해주세요" className="w-full px-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">담당자명 <span className="text-error">*</span></label>
                <input required type="text" placeholder="담당자 이름" className="w-full px-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">이메일 <span className="text-error">*</span></label>
                <input required type="email" placeholder="example@company.com" className="w-full px-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">연락처 <span className="text-error">*</span></label>
                <input required type="tel" placeholder="010-1234-5678" className="w-full px-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">관심 교육분야</label>
                <select className="w-full px-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option value="">선택 (선택사항)</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">예상 인원</label>
                <input type="text" placeholder="예: 30명" className="w-full px-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">희망 일정</label>
                <input type="text" placeholder="예: 2026년 4월 중" className="w-full px-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">예산 범위</label>
                <select className="w-full px-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
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
              <textarea required rows={5} placeholder="교육 관련 상세 요청 사항을 입력해주세요" className="w-full px-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y" />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-accent hover:bg-accent-dark text-white font-semibold rounded-lg transition-colors"
            >
              <Send size={16} />
              교육문의 제출
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
