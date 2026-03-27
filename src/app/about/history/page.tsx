import { Metadata } from "next";
import { SubpageHero } from "@/components/layout/SubpageHero";

export const metadata: Metadata = { title: "연혁" };

const timeline = [
  { year: "2025", events: ["04월 사단법인 설립 허가", "05월 인공지능(AI)교육전문가 1기 과정 개설", "06월 AI전문교육 사이트 및 자격증 시스템 구축", "12월 1기 자격증 50명 배출"] },
  { year: "2026", events: ["01월 교육컨설팅 표준 매뉴얼 발간 착수", "03월 KECA 웹사이트 리뉴얼 오픈", "연간 자격증 배출 200명 목표"] },
];

export default function HistoryPage() {
  return (
    <>
      <SubpageHero
        title="연혁"
        subtitle="KECA의 발자취"
        breadcrumb={[{ label: "협회소개", href: "/about" }, { label: "연혁" }]}
      />
      <section className="py-16 lg:py-20">
        <div className="container-custom max-w-3xl">
          <div className="space-y-8">
            {timeline.map((t) => (
              <div key={t.year} className="flex gap-6">
                <div className="shrink-0 w-20 text-right">
                  <span className="text-2xl font-bold text-primary">{t.year}</span>
                </div>
                <div className="relative pl-6 border-l-2 border-accent/30 pb-2">
                  <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-accent" />
                  <ul className="space-y-3">
                    {t.events.map((e, i) => (
                      <li key={i} className="text-sm text-text-sub leading-relaxed">{e}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
