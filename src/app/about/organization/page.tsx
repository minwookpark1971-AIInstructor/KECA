import { Metadata } from "next";
import { SubpageHero } from "@/components/layout/SubpageHero";

export const metadata: Metadata = { title: "조직현황" };

const executives = [
  { name: "조은아", role: "회장", position: "총괄 리더십", duties: ["총괄 리더십", "대외 협력", "중장기 발전 계획 수립"] },
  { name: "박민욱", role: "임원", position: "운영 및 기획", duties: ["경영 기획", "전국 지부 설립 추진", "운영 총괄"] },
  { name: "우기정", role: "임원", position: "R&D 센터장", duties: ["연구 개발", "AI 솔루션 개발", "기술 혁신"] },
  { name: "김현정", role: "임원", position: "교육연수원장", duties: ["인재 양성", "자격 검정 관리", "교육 프로그램 운영"] },
];

const orgChart = [
  { level: "top", items: ["총회"] },
  { level: "top", items: ["이사회"] },
  { level: "top", items: ["회장"] },
  { level: "branches", items: ["사무국", "R&D 센터", "KECA 아카데미", "미래교육정책연구소"] },
];

export default function OrganizationPage() {
  return (
    <>
      <SubpageHero
        title="조직현황"
        subtitle="전문성을 갖춘 임원진과 체계적인 조직 구조로 운영됩니다"
        breadcrumb={[{ label: "협회소개", href: "/about" }, { label: "조직현황" }]}
      />

      <section className="py-16 lg:py-20">
        <div className="container-custom">
          {/* 임원진 */}
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-accent tracking-wider uppercase mb-2">EXECUTIVES</p>
            <h2 className="text-2xl lg:text-3xl font-bold text-text">임원진</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {executives.map((exec) => (
              <div key={exec.name} className="bg-white rounded-xl border border-border-light p-6 text-center card-hover">
                <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl mb-4">
                  {exec.name[0]}
                </div>
                <h4 className="text-lg font-bold text-text">
                  {exec.role} {exec.name}
                </h4>
                <p className="text-sm text-accent font-medium mt-1 mb-4">{exec.position}</p>
                <ul className="space-y-1.5 text-sm text-text-sub text-left">
                  {exec.duties.map((d) => (
                    <li key={d} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* 조직 구성도 */}
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-accent tracking-wider uppercase mb-2">ORGANIZATION CHART</p>
            <h2 className="text-2xl lg:text-3xl font-bold text-text">조직 구성도</h2>
          </div>

          <div className="max-w-3xl mx-auto">
            {/* 총회 → 이사회 → 회장 */}
            <div className="flex flex-col items-center gap-0">
              {["총회", "이사회", "회장"].map((name, i) => (
                <div key={name} className="flex flex-col items-center">
                  <div className="px-8 py-3 bg-primary text-white rounded-lg font-semibold text-sm">
                    {name}
                  </div>
                  {i < 2 && <div className="w-px h-6 bg-border" />}
                </div>
              ))}
            </div>

            {/* 연결선 */}
            <div className="flex justify-center mt-0">
              <div className="w-px h-6 bg-border" />
            </div>

            {/* 가로 연결선 */}
            <div className="relative mx-8 lg:mx-16">
              <div className="h-px bg-border" />
              <div className="absolute top-0 left-0 w-px h-6 bg-border" />
              <div className="absolute top-0 right-0 w-px h-6 bg-border" />
              <div className="absolute top-0 left-1/3 w-px h-6 bg-border" />
              <div className="absolute top-0 left-2/3 w-px h-6 bg-border" />
            </div>

            {/* 하위 부서 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
              {["사무국", "R&D 센터", "KECA 아카데미", "미래교육정책연구소"].map((dept) => (
                <div key={dept} className="px-4 py-3 bg-surface border border-border-light rounded-lg text-center text-sm font-medium text-text">
                  {dept}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
