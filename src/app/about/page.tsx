import { Metadata } from "next";
import { SubpageHero } from "@/components/layout/SubpageHero";

export const metadata: Metadata = {
  title: "인사말",
};

export default function AboutPage() {
  return (
    <>
      <SubpageHero
        title="인사말"
        subtitle="한국교육컨설팅협회(KECA)를 찾아주셔서 감사합니다"
        breadcrumb={[{ label: "협회소개", href: "/about" }, { label: "인사말" }]}
      />

      <section className="py-16 lg:py-20">
        <div className="container-custom max-w-4xl">
          <div className="space-y-8">
            <div className="text-center">
              <p className="text-sm font-semibold text-accent tracking-wider uppercase mb-3">
                GREETING
              </p>
              <h2 className="text-2xl lg:text-3xl font-bold text-text">
                대한민국 교육의 미래를
                <br />
                함께 만들어갑니다
              </h2>
            </div>

            <div className="bg-surface rounded-xl p-8 lg:p-10">
              <div className="prose prose-lg max-w-none text-text-sub leading-relaxed space-y-6">
                <p>
                  안녕하십니까. 사단법인 한국교육컨설팅협회(KECA) 회장 조은아입니다.
                </p>
                <p>
                  한국교육컨설팅협회는 AI와 에듀테크 기반의 전문 교육컨설팅을 통해
                  교육 생태계의 전문화와 표준화를 선도하고 있습니다.
                </p>
                <p>
                  급변하는 교육 환경 속에서 데이터와 근거 기반의 과학적 컨설팅,
                  투명하고 정직한 정보 제공, AI 및 에듀테크 기술의 선도적 도입,
                  그리고 회원 간 협력과 사회적 가치 실현을 핵심 가치로 삼고 있습니다.
                </p>
                <p>
                  KECA는 교육컨설팅 분야의 전문 인력 양성, R&D 기반 교육 솔루션 개발,
                  그리고 사회공헌 활동을 통해 대한민국 교육 경쟁력 강화에 기여하겠습니다.
                </p>
                <p>
                  여러분의 많은 관심과 참여를 부탁드립니다. 감사합니다.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                    조
                  </div>
                  <div>
                    <p className="font-semibold text-text">조은아</p>
                    <p className="text-sm text-text-sub">
                      사단법인 한국교육컨설팅협회 회장
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 기관 개요 */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: "2025.04", label: "설립일" },
                { value: "사단법인", label: "기관 유형" },
                { value: "조은아", label: "회장" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="text-center py-6 bg-white rounded-xl border border-border-light"
                >
                  <div className="text-xl font-bold text-primary">{stat.value}</div>
                  <div className="text-xs text-text-sub mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
