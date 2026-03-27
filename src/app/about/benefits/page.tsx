import { Metadata } from "next";
import { SubpageHero } from "@/components/layout/SubpageHero";
import { Award, BarChart3, Scale, Monitor, Handshake, CreditCard } from "lucide-react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "회원혜택" };

const benefits = [
  { icon: Award, title: "공신력 확보", desc: "협회 인증 현판 및 로고 사용권 부여로 전문성을 공식적으로 인정받으세요" },
  { icon: BarChart3, title: "정보 접근권", desc: "최신 교육 트렌드 리포트 및 정책 분석 자료집 정기 구독" },
  { icon: Scale, title: "경영 지원", desc: "자문 변호사 및 세무사를 통한 법률·세무 지원 서비스" },
  { icon: Monitor, title: "플랫폼 이용", desc: "컨설턴트 매칭 플랫폼 우선 등재 및 강연 의뢰 우선 배정" },
  { icon: Handshake, title: "네트워킹", desc: "정기 학술 포럼, 워크숍, 멘토링 프로그램 참여 기회" },
  { icon: CreditCard, title: "교육 지원", desc: "자격 과정 및 보수 교육 수강료 할인 혜택" },
];

export default function BenefitsPage() {
  return (
    <>
      <SubpageHero
        title="회원혜택"
        subtitle="KECA 회원만을 위한 특별한 혜택을 제공합니다"
        breadcrumb={[{ label: "협회소개", href: "/about" }, { label: "회원혜택" }]}
      />
      <section className="py-16 lg:py-20">
        <div className="container-custom">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="bg-white rounded-xl border border-border-light p-6 card-hover">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                    <Icon size={24} className="text-accent" />
                  </div>
                  <h4 className="text-lg font-bold text-text mb-2">{b.title}</h4>
                  <p className="text-sm text-text-sub leading-relaxed">{b.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="text-center bg-primary rounded-xl p-8 lg:p-12">
            <h3 className="text-xl lg:text-2xl font-bold text-white mb-3">KECA 회원이 되어보세요</h3>
            <p className="text-white/60 text-sm mb-6">전문 교육프로그램, 자격증 과정, 네트워킹 등 다양한 혜택을 누릴 수 있습니다.</p>
            <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-dark text-white font-semibold rounded-lg transition-colors">
              회원가입 <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
