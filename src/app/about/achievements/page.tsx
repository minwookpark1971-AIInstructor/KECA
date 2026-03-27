import { Metadata } from "next";
import { SubpageHero } from "@/components/layout/SubpageHero";
import { FlaskConical, GraduationCap, Globe, Heart } from "lucide-react";

export const metadata: Metadata = { title: "대표실적" };

const businesses = [
  { num: "01", icon: FlaskConical, title: "R&D 센터 운영", items: ["AI 기반 진로/진학 진단 솔루션 개발", "교육컨설팅 표준 매뉴얼 발간", "데이터 기반 컨설팅 방법론 연구"] },
  { num: "02", icon: GraduationCap, title: "인재 양성", items: ["인공지능(AI)교육전문가 자격 과정 운영", "교육컨설턴트 양성 프로그램", "정기 보수 교육 및 역량 강화 교육"] },
  { num: "03", icon: Globe, title: "네트워크 구축", items: ["정기 학술 포럼 및 컨퍼런스 개최", "컨설팅 케이스 스터디 워크숍", "멘토링 프로그램 운영"] },
  { num: "04", icon: Heart, title: "사회공헌", items: ["찾아가는 학교 무료 진로 컨설팅", "지자체 협력 교육 프로그램 운영", "교육 소외 계층 지원 활동"] },
];

const achievements = [
  { value: "50명", label: "자격증 배출 인원", detail: "인공지능(AI)교육전문가 1기 (2025년)" },
  { value: "2", label: "교육 시스템 구축", detail: "AI전문교육 사이트와 자격증 시스템 구축" },
  { value: "4명", label: "전문 임원진", detail: "조직 체계 확립 완료" },
];

export default function AchievementsPage() {
  return (
    <>
      <SubpageHero
        title="대표실적"
        subtitle="4대 핵심 전략 사업과 주요 성과"
        breadcrumb={[{ label: "협회소개", href: "/about" }, { label: "대표실적" }]}
      />
      <section className="py-16 lg:py-20">
        <div className="container-custom">
          {/* 주요 사업 */}
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-accent tracking-wider uppercase mb-2">BUSINESS</p>
            <h2 className="text-2xl lg:text-3xl font-bold text-text">주요 사업</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-20">
            {businesses.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.num} className="bg-white rounded-xl border border-border-light p-6 card-hover">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                      <Icon size={24} className="text-primary" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-accent">{b.num}</span>
                      <h3 className="text-lg font-bold text-text mt-1 mb-3">{b.title}</h3>
                      <ul className="space-y-1.5">
                        {b.items.map((item) => (
                          <li key={item} className="text-sm text-text-sub flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 주요 성과 */}
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-accent tracking-wider uppercase mb-2">ACHIEVEMENTS</p>
            <h2 className="text-2xl lg:text-3xl font-bold text-text">주요 성과</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {achievements.map((a) => (
              <div key={a.label} className="bg-surface rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">{a.value}</div>
                <div className="text-sm font-medium text-text mb-1">{a.label}</div>
                <div className="text-xs text-text-muted">{a.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
