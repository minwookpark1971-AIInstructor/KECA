import { Metadata } from "next";
import Link from "next/link";
import { SubpageHero } from "@/components/layout/SubpageHero";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "자격소개" };

export default function CertificationPage() {
  return (
    <>
      <SubpageHero
        title="인공지능(AI)교육전문가"
        subtitle="AI 시대 교육 전문가로 성장하세요"
        breadcrumb={[{ label: "자격소개" }]}
      />
      <section className="py-16 lg:py-20">
        <div className="container-custom max-w-4xl">
          {/* 자격 개요 */}
          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            <div className="bg-surface rounded-xl p-5 text-center">
              <p className="text-xs text-text-muted mb-1">자격명</p>
              <p className="text-sm font-semibold text-text">인공지능(AI)교육전문가</p>
            </div>
            <div className="bg-surface rounded-xl p-5 text-center">
              <p className="text-xs text-text-muted mb-1">등록 구분</p>
              <p className="text-sm font-semibold text-text">자격기본법에 따른 등록 민간자격</p>
            </div>
            <div className="bg-surface rounded-xl p-5 text-center">
              <p className="text-xs text-text-muted mb-1">유효기간</p>
              <p className="text-sm font-semibold text-text">5년 (보수교육 이수 후 갱신)</p>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/10 rounded-xl p-6 mb-10">
            <h3 className="text-base font-bold text-text mb-2">직무 내용</h3>
            <p className="text-sm text-text-sub leading-relaxed">
              생성형 AI 기반 업무 자동화 설계, 교육 콘텐츠 제작, 데이터 분석 및 AI 활용 교육과정 기획·지도
            </p>
          </div>

          {/* 검정 기준 */}
          <h2 className="text-xl font-bold text-text mb-4">검정 기준</h2>
          <div className="overflow-x-auto mb-10">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary text-white">
                  <th className="px-4 py-3 text-left font-medium rounded-tl-lg">구분</th>
                  <th className="px-4 py-3 text-left font-medium">검정 과목</th>
                  <th className="px-4 py-3 text-center font-medium">시험 시간</th>
                  <th className="px-4 py-3 text-center font-medium rounded-tr-lg">합격 기준</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                <tr className="bg-white">
                  <td className="px-4 py-4 font-semibold text-text align-top">필기</td>
                  <td className="px-4 py-4 text-text-sub">
                    1. 생성형 AI 리터러시<br/>
                    2. AI 주요 도구 활용 기법<br/>
                    3. AI 윤리 및 프롬프트 기획<br/>
                    <span className="text-xs text-text-muted">(객관식 25문항)</span>
                  </td>
                  <td className="px-4 py-4 text-center text-text-sub align-top">50분</td>
                  <td className="px-4 py-4 text-center text-text-sub align-top">100점 만점 중<br/>60점 이상</td>
                </tr>
                <tr className="bg-surface">
                  <td className="px-4 py-4 font-semibold text-text align-top">실기</td>
                  <td className="px-4 py-4 text-text-sub">
                    1. AI 교육지도 자료 설계 시연<br/>
                    2. AI 교육 커리큘럼 구성안 작성<br/>
                    <span className="text-xs text-text-muted">(작업형)</span>
                  </td>
                  <td className="px-4 py-4 text-center text-text-sub align-top">90분</td>
                  <td className="px-4 py-4 text-center text-text-sub align-top">100점 만점 중<br/>60점 이상</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 배출 실적 */}
          <h2 className="text-xl font-bold text-text mb-4">배출 실적</h2>
          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            <div className="bg-surface rounded-xl p-6 text-center">
              <div className="text-2xl font-bold text-primary">50명</div>
              <div className="text-sm text-text-sub mt-1">1기 배출 인원 (2025년)</div>
            </div>
            <div className="bg-surface rounded-xl p-6 text-center">
              <div className="text-sm font-semibold text-text mb-2">활동 분야</div>
              <div className="text-xs text-text-sub leading-relaxed">학교 방과 후 강사<br/>기업 사내 강사<br/>교육컨설팅 전문가</div>
            </div>
            <div className="bg-surface rounded-xl p-6 text-center">
              <div className="text-2xl font-bold text-primary">200명</div>
              <div className="text-sm text-text-sub mt-1">2026년 목표 (연간)</div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              href="/certification/apply"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-dark text-white font-semibold rounded-lg transition-colors"
            >
              자격증 신청하기 <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
