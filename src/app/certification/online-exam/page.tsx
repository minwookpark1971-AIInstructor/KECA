import { Metadata } from "next";
import { SubpageHero } from "@/components/layout/SubpageHero";
import { ClipboardList, Monitor, CheckCircle, ExternalLink, Clock, FileText, Award } from "lucide-react";

export const metadata: Metadata = { title: "온라인 자격시험" };

export default function OnlineExamPage() {
  return (
    <>
      <SubpageHero
        title="온라인 자격시험"
        subtitle="KECA 인공지능(AI)교육전문가 온라인 시험 안내"
        breadcrumb={[{ label: "자격소개", href: "/certification" }, { label: "온라인 자격시험" }]}
      />
      <section className="py-16 lg:py-20">
        <div className="container-custom max-w-4xl">
          {/* 시험 시스템 소개 */}
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-6 mb-10">
            <h2 className="text-lg font-bold text-text mb-2">온라인 자격증 객관식 시험 플랫폼</h2>
            <p className="text-sm text-text-sub leading-relaxed">
              KECA 자격증 시험은 온라인 객관식 시험 플랫폼을 통해 진행됩니다.
              별도의 프로그램 설치 없이 웹 브라우저에서 바로 응시할 수 있으며,
              관리자로부터 전달받은 시험 URL을 통해 접속하여 시험을 응시합니다.
            </p>
          </div>

          {/* 시험 응시 절차 */}
          <h2 className="text-xl font-bold text-text mb-6">시험 응시 방법</h2>
          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            <div className="bg-surface rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="text-primary" size={24} />
              </div>
              <div className="text-xs text-accent font-semibold mb-1">STEP 1</div>
              <h3 className="text-sm font-bold text-text mb-2">시험 URL 수신</h3>
              <p className="text-xs text-text-sub leading-relaxed">
                KECA 관리자로부터 시험 응시 URL을 이메일 또는 문자로 전달받습니다.
              </p>
            </div>
            <div className="bg-surface rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Monitor className="text-primary" size={24} />
              </div>
              <div className="text-xs text-accent font-semibold mb-1">STEP 2</div>
              <h3 className="text-sm font-bold text-text mb-2">온라인 시험 응시</h3>
              <p className="text-xs text-text-sub leading-relaxed">
                전달받은 URL로 접속하여 객관식 문항을 풀이합니다. PC 또는 모바일 브라우저에서 응시 가능합니다.
              </p>
            </div>
            <div className="bg-surface rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-primary" size={24} />
              </div>
              <div className="text-xs text-accent font-semibold mb-1">STEP 3</div>
              <h3 className="text-sm font-bold text-text mb-2">결과 확인</h3>
              <p className="text-xs text-text-sub leading-relaxed">
                시험 완료 후 결과를 확인하고, 합격 기준 충족 시 자격증이 발급됩니다.
              </p>
            </div>
          </div>

          {/* 필기시험 정보 */}
          <h2 className="text-xl font-bold text-text mb-4">필기시험 정보</h2>
          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            <div className="bg-white border border-border-light rounded-xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <FileText className="text-primary" size={20} />
              </div>
              <div>
                <p className="text-xs text-text-muted">출제 형식</p>
                <p className="text-sm font-semibold text-text">객관식 25문항</p>
              </div>
            </div>
            <div className="bg-white border border-border-light rounded-xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <Clock className="text-primary" size={20} />
              </div>
              <div>
                <p className="text-xs text-text-muted">시험 시간</p>
                <p className="text-sm font-semibold text-text">50분</p>
              </div>
            </div>
            <div className="bg-white border border-border-light rounded-xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <Award className="text-primary" size={20} />
              </div>
              <div>
                <p className="text-xs text-text-muted">합격 기준</p>
                <p className="text-sm font-semibold text-text">100점 만점 중 60점 이상</p>
              </div>
            </div>
          </div>

          {/* 시험 과목 */}
          <div className="bg-surface rounded-xl p-6 mb-10">
            <h3 className="text-base font-bold text-text mb-3">필기 시험 과목</h3>
            <ul className="space-y-2 text-sm text-text-sub">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                생성형 AI 리터러시
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                AI 주요 도구 활용 기법
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                AI 윤리 및 프롬프트 기획
              </li>
            </ul>
          </div>

          {/* 유의사항 */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-10">
            <h3 className="text-base font-bold text-text mb-3">응시 유의사항</h3>
            <ul className="space-y-2 text-sm text-text-sub">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                시험 URL은 관리자가 개별 전달하며, 지정된 시간에만 접속 가능합니다.
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                안정적인 인터넷 환경에서 응시해 주세요.
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                시험 중 브라우저를 닫거나 새로고침하면 진행 상황이 유실될 수 있습니다.
              </li>
            </ul>
          </div>

          {/* CTA 버튼 */}
          <div className="text-center">
            <a
              href="https://keca-test-system.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors text-base"
            >
              시험 응시하기 <ExternalLink size={18} />
            </a>
            <p className="text-xs text-text-muted mt-3">
              * 관리자로부터 전달받은 시험 URL로 접속하세요.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
