import { Metadata } from "next";
import Link from "next/link";
import { SubpageHero } from "@/components/layout/SubpageHero";
import { Award, GraduationCap, RefreshCw } from "lucide-react";

export const metadata: Metadata = { title: "전문가과정" };

const courses = [
  {
    type: "자격증 과정", icon: Award, items: [
      { title: "인공지능(AI)교육전문가 1급", desc: "생성형 AI 활용 교육 전문가 양성", href: "/expert/ai-edu-expert" },
      { title: "교육컨설턴트 자격과정", desc: "교육과정 설계 및 컨설팅 전문가", href: "/expert/edu-consultant" },
      { title: "에듀테크 지도사 과정", desc: "에듀테크 도구 활용 지도 전문가", href: "/expert/edutech-instructor" },
    ]
  },
  {
    type: "강사양성 과정", icon: GraduationCap, items: [
      { title: "AI교육 강사양성", desc: "AI 활용 교육 강사 양성 프로그램", href: "/expert/ai-instructor" },
      { title: "진로교육 강사양성", desc: "진로·진학 교육 강사 양성", href: "/expert/career-instructor" },
      { title: "교육컨설팅 강사양성", desc: "교육컨설팅 분야 강사 양성", href: "/expert/consulting-instructor" },
    ]
  },
  {
    type: "보수교육", icon: RefreshCw, items: [
      { title: "연간 보수교육", desc: "자격 유지를 위한 연간 보수교육", href: "/expert/annual-continuing" },
      { title: "역량강화 워크숍", desc: "전문 역량 심화 워크숍", href: "/expert/workshop" },
    ]
  },
];

export default function ExpertPage() {
  return (
    <>
      <SubpageHero
        title="전문가과정"
        subtitle="자격증, 강사양성, 보수교육 과정을 운영합니다"
        breadcrumb={[{ label: "전문가과정" }]}
      />
      <section className="py-16 lg:py-20">
        <div className="container-custom">
          <div className="space-y-12">
            {courses.map((group) => {
              const Icon = group.icon;
              return (
                <div key={group.type}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Icon size={20} className="text-accent" />
                    </div>
                    <h2 className="text-xl font-bold text-text">{group.type}</h2>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.items.map((item) => (
                      <Link key={item.title} href={item.href} className="bg-white border border-border-light rounded-xl p-5 card-hover group">
                        <h3 className="text-base font-semibold text-text group-hover:text-primary transition-colors mb-1">{item.title}</h3>
                        <p className="text-sm text-text-sub">{item.desc}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
