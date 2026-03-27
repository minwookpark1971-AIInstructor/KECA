import { Metadata } from "next";
import { SubpageHero } from "@/components/layout/SubpageHero";

export const metadata: Metadata = { title: "배출현황" };

export default function GraduatesPage() {
  return (
    <>
      <SubpageHero title="배출현황" breadcrumb={[{ label: "자격소개", href: "/certification" }, { label: "배출현황" }]} />
      <section className="py-16 lg:py-20">
        <div className="container-custom max-w-4xl">
          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            <div className="bg-surface rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-primary">50명</div>
              <div className="text-sm text-text-sub mt-1">1기 배출 (2025)</div>
            </div>
            <div className="bg-surface rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-primary">200명</div>
              <div className="text-sm text-text-sub mt-1">2026년 목표</div>
            </div>
            <div className="bg-surface rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-primary">1,000명</div>
              <div className="text-sm text-text-sub mt-1">2028년 누적 목표</div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-text mb-4">주요 활동 분야</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {["학교 방과 후 AI교육 강사", "기업 사내 AI활용 강사", "교육컨설팅 전문가"].map((area) => (
                <div key={area} className="bg-white border border-border-light rounded-xl p-4 text-center text-sm text-text-sub">{area}</div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
