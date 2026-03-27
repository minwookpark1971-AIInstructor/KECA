import { Metadata } from "next";
import { SubpageHero } from "@/components/layout/SubpageHero";

export const metadata: Metadata = { title: "자격증 신청안내" };

export default function ApplyPage() {
  return (
    <>
      <SubpageHero title="자격증 신청안내" breadcrumb={[{ label: "자격소개", href: "/certification" }, { label: "신청안내" }]} />
      <section className="py-16 lg:py-20">
        <div className="container-custom max-w-3xl">
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-text mb-4">신청 절차</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                {["1. 온라인 접수", "2. 서류 확인", "3. 시험 응시", "4. 자격증 발급"].map((step, i) => (
                  <div key={i} className="flex-1 bg-surface rounded-xl p-4 text-center">
                    <p className="text-sm font-medium text-primary">{step}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-text mb-4">응시 자격</h2>
              <ul className="space-y-2 text-sm text-text-sub">
                <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />학력, 연령, 경력 제한 없음</li>
                <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />KECA 자격 과정 수료자 또는 동등 학력 인정자</li>
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-bold text-text mb-4">응시료</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-surface rounded-xl p-5"><p className="text-xs text-text-muted">필기시험</p><p className="text-lg font-bold text-text">50,000원</p></div>
                <div className="bg-surface rounded-xl p-5"><p className="text-xs text-text-muted">실기시험</p><p className="text-lg font-bold text-text">80,000원</p></div>
              </div>
            </div>
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-6">
              <p className="text-sm text-text-sub">자격증 신청 및 문의는 <strong className="text-text">info@keca.or.kr</strong>로 연락주시기 바랍니다.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
