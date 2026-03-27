import { Metadata } from "next";
import { SubpageHero } from "@/components/layout/SubpageHero";
import { Briefcase, ShieldCheck, Lightbulb, Handshake } from "lucide-react";

export const metadata: Metadata = { title: "비전/미션" };

const coreValues = [
  { num: "01", icon: Briefcase, title: "전문성", sub: "Professionalism", desc: "데이터와 근거 기반의 과학적 컨설팅" },
  { num: "02", icon: ShieldCheck, title: "윤리성", sub: "Integrity", desc: "투명하고 정직한 정보 제공" },
  { num: "03", icon: Lightbulb, title: "혁신성", sub: "Innovation", desc: "AI 및 에듀테크 기술의 선도적 도입" },
  { num: "04", icon: Handshake, title: "상생", sub: "Coexistence", desc: "회원 간 협력 및 사회적 가치 실현" },
];

export default function VisionPage() {
  return (
    <>
      <SubpageHero
        title="비전/미션"
        subtitle="KECA가 추구하는 가치와 방향"
        breadcrumb={[{ label: "협회소개", href: "/about" }, { label: "비전/미션" }]}
      />

      <section className="py-16 lg:py-20">
        <div className="container-custom">
          {/* 미션 & 비전 */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            <div className="bg-primary text-white rounded-xl p-8 lg:p-10">
              <p className="text-xs font-semibold text-accent tracking-wider uppercase mb-3">MISSION</p>
              <h3 className="text-2xl font-bold mb-3">미션</h3>
              <p className="text-white/70 leading-relaxed">
                신뢰받는 교육컨설팅 생태계 조성을 통한 대한민국 교육 경쟁력 강화
              </p>
            </div>
            <div className="bg-surface rounded-xl p-8 lg:p-10 border border-border-light">
              <p className="text-xs font-semibold text-accent tracking-wider uppercase mb-3">VISION 2030</p>
              <h3 className="text-2xl font-bold text-text mb-3">비전 2030</h3>
              <p className="text-text-sub leading-relaxed">
                아시아 최고의 에듀테크 기반 교육컨설팅 플랫폼 허브
              </p>
            </div>
          </div>

          {/* 핵심 가치 */}
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-accent tracking-wider uppercase mb-2">CORE VALUES</p>
            <h2 className="text-2xl lg:text-3xl font-bold text-text">핵심 가치</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.num} className="bg-white rounded-xl border border-border-light p-6 text-center card-hover">
                  <span className="text-xs font-bold text-accent">{v.num}</span>
                  <div className="my-4 flex justify-center">
                    <div className="w-14 h-14 rounded-xl bg-primary/5 flex items-center justify-center">
                      <Icon size={28} className="text-primary" />
                    </div>
                  </div>
                  <h4 className="text-lg font-bold text-text">{v.title}</h4>
                  <p className="text-xs text-text-muted mt-1 mb-2">{v.sub}</p>
                  <p className="text-sm text-text-sub">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
