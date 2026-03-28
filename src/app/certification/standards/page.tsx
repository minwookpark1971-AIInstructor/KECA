import { Metadata } from "next";
import Link from "next/link";
import { SubpageHero } from "@/components/layout/SubpageHero";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "검정기준 및 과목" };

export default function StandardsPage() {
  return (
    <>
      <SubpageHero
        title="검정기준 및 과목"
        breadcrumb={[{ label: "자격소개", href: "/certification" }, { label: "검정기준 및 과목" }]}
      />
      <section className="py-16 lg:py-20">
        <div className="container-custom max-w-4xl">
          {/* 자격 개요 */}
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-6 mb-10">
            <h3 className="text-base font-bold text-text mb-2">인공지능(AI)교육전문가</h3>
            <p className="text-sm text-text-sub leading-relaxed">
              생성형 AI 기반 업무 자동화 설계, 교육 콘텐츠 제작, 데이터 분석 및 AI 활용 교육과정 기획·지도
            </p>
          </div>

          {/* 검정 기준 테이블 */}
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

          {/* 과목별 세부 내용 */}
          <h2 className="text-xl font-bold text-text mb-4">과목별 세부 내용</h2>
          <div className="space-y-4 mb-10">
            <div className="bg-white border border-border-light rounded-xl p-5">
              <h4 className="font-semibold text-text mb-2">필기 1. 생성형 AI 리터러시</h4>
              <p className="text-sm text-text-sub">생성형 AI의 개념, 원리, 주요 모델(GPT, Claude, Gemini 등)의 특징과 활용 범위에 대한 이해</p>
            </div>
            <div className="bg-white border border-border-light rounded-xl p-5">
              <h4 className="font-semibold text-text mb-2">필기 2. AI 주요 도구 활용 기법</h4>
              <p className="text-sm text-text-sub">텍스트·이미지·영상 생성 도구, 자동화 도구(Make, Zapier), 데이터 분석 도구의 실무 활용법</p>
            </div>
            <div className="bg-white border border-border-light rounded-xl p-5">
              <h4 className="font-semibold text-text mb-2">필기 3. AI 윤리 및 프롬프트 기획</h4>
              <p className="text-sm text-text-sub">AI 윤리 가이드라인, 저작권 이슈, 효과적인 프롬프트 설계 원칙 및 교육 시나리오 기획</p>
            </div>
            <div className="bg-white border border-border-light rounded-xl p-5">
              <h4 className="font-semibold text-text mb-2">실기 1. AI 교육지도 자료 설계 시연</h4>
              <p className="text-sm text-text-sub">AI 도구를 활용한 교육 콘텐츠(프레젠테이션, 학습자료) 실시간 제작 및 시연</p>
            </div>
            <div className="bg-white border border-border-light rounded-xl p-5">
              <h4 className="font-semibold text-text mb-2">실기 2. AI 교육 커리큘럼 구성안 작성</h4>
              <p className="text-sm text-text-sub">특정 대상·목표에 맞는 AI 활용 교육과정 커리큘럼 설계 및 교안 작성</p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              href="/certification/apply"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-text font-semibold rounded-lg transition-colors"
            >
              자격증 신청 안내 <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
