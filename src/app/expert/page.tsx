import { Metadata } from "next";
import Link from "next/link";
import { SubpageHero } from "@/components/layout/SubpageHero";
import { getPrograms } from "@/lib/supabase/queries";
import { Award, GraduationCap, RefreshCw, BookOpen } from "lucide-react";

export const metadata: Metadata = { title: "전문가과정" };

<<<<<<< HEAD
const courses = [
  {
    type: "자격증 과정", icon: Award, items: [
      { title: "인공지능(AI)교육전문가", desc: "생성형 AI 기반 업무 자동화 설계, 교육 콘텐츠 제작, 데이터 분석 및 AI 활용 교육과정 기획·지도", href: "/certification" },
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
=======
export default async function ExpertPage() {
  const [certPrograms, expertPrograms] = await Promise.all([
    getPrograms({ programType: "certification" }),
    getPrograms({ programType: "expert" }),
  ]);

  // 강사양성 과정 vs 보수교육 분리 (slug 기반)
  const continuingEduSlugs = ["annual-continuing-education", "competency-workshop"];
  const trainingPrograms = expertPrograms.filter((p) => !continuingEduSlugs.includes(p.slug));
  const continuingPrograms = expertPrograms.filter((p) => continuingEduSlugs.includes(p.slug));

  const groups = [
    { type: "자격증 과정", icon: Award, programs: certPrograms },
    { type: "강사양성 과정", icon: GraduationCap, programs: trainingPrograms },
    { type: "보수교육", icon: RefreshCw, programs: continuingPrograms },
  ];
>>>>>>> 263dd1c7d81a75adc07a4c816af1a692986eac76

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
            {groups.map((group) => {
              const Icon = group.icon;
              return (
                <div key={group.type}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Icon size={20} className="text-accent" />
                    </div>
                    <h2 className="text-xl font-bold text-text">{group.type}</h2>
                  </div>
                  {group.programs.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {group.programs.map((prog) => (
                        <Link key={prog.id} href={`/programs/${prog.slug}`} className="bg-white border border-border-light rounded-xl p-5 card-hover group">
                          <h3 className="text-base font-semibold text-text group-hover:text-primary transition-colors mb-1">{prog.title}</h3>
                          <p className="text-sm text-text-sub">{prog.subtitle || prog.description?.slice(0, 50)}</p>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-text-muted py-4">등록된 과정이 없습니다.</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
