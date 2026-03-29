import Link from "next/link";
import {
  ArrowRight,
  Cpu,
  Compass,
  Briefcase,
  Users,
  Target,
  Shield,
  Award,
  GraduationCap,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { getPostsByBoard, getPrograms, getSchedules, getPartners } from "@/lib/supabase/queries";
import { ScrollReveal } from "@/components/layout/ScrollReveal";
import { CounterStats } from "@/components/home/CounterStats";
import { NewsTabs } from "@/components/home/NewsTabs";

const catCardStyles: Record<string, { gradient: string; icon: typeof Cpu }> = {
  "ai-edutech": { gradient: "from-[#1B2A4A] to-[#2E5090]", icon: Cpu },
  "career": { gradient: "from-[#064E3B] to-[#10B981]", icon: Compass },
  "consulting": { gradient: "from-[#4C1D95] to-[#7C3AED]", icon: Briefcase },
  "leadership": { gradient: "from-[#92400E] to-[#F59E0B]", icon: Users },
  "competency": { gradient: "from-[#831843] to-[#EC4899]", icon: Target },
  "mandatory": { gradient: "from-[#374151] to-[#6B7280]", icon: Shield },
};

const categories = [
  { label: "AI·에듀테크 교육", desc: "AI와 에듀테크를 활용한 미래형 교육 설계", icon: Cpu, href: "/programs?category=ai-edutech" },
  { label: "진로·진학 컨설팅", desc: "학생 맞춤형 진로·진학 컨설팅 서비스", icon: Compass, href: "/programs?category=career" },
  { label: "교육컨설팅", desc: "기업·기관 대상 전문 교육컨설팅", icon: Briefcase, href: "/programs?category=consulting" },
  { label: "리더십·조직교육", desc: "조직 성과를 높이는 리더십 교육", icon: Users, href: "/programs?category=leadership" },
  { label: "직무역량 강화", desc: "실무 중심의 직무역량 개발 프로그램", icon: Target, href: "/programs?category=competency" },
  { label: "법정의무교육", desc: "법정 필수 이수 교육과정 제공", icon: Shield, href: "/programs?category=mandatory" },
  { label: "전문가과정", desc: "자격증·전문가 양성 심화과정", icon: Award, href: "/expert" },
  { label: "강사진", desc: "검증된 전문 강사진 소개", icon: GraduationCap, href: "/instructors" },
];

const stats = [
  { value: "500+", label: "교육 수료생" },
  { value: "50+", label: "기업 파트너" },
  { value: "30+", label: "전문 강사진" },
  { value: "98%", label: "교육 만족도" },
];

export default async function HomePage() {
  const [notices, reviews, featuredPrograms, schedules, partners] = await Promise.all([
    getPostsByBoard("notice", 4),
    getPostsByBoard("review", 3),
    getPrograms({ featured: true, limit: 3 }),
    getSchedules(),
    getPartners(),
  ]);

  const upcomingSchedules = schedules
    .filter((s) => new Date(s.start_date) >= new Date())
    .slice(0, 3);

  const hasNewsContent = notices.length > 0 || reviews.length > 0 || upcomingSchedules.length > 0;

  return (
    <>
      {/* ===== 히어로 — 풀스크린, 애니메이션 그라디언트 ===== */}
      <section className="relative min-h-[100vh] flex items-center hero-gradient overflow-hidden -mt-20" aria-label="메인 배너">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        <div className="hero-glow" />
        <div className="container-custom relative z-10 pt-20">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold text-accent tracking-[0.2em] uppercase mb-8 animate-fade-in-up">
              Korea Education Consulting Association
            </p>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              신뢰받는
              <br />
              교육컨설팅 생태계를
              <br />
              <span className="text-accent">선도합니다</span>
            </h1>
            <p className="mt-8 text-lg text-white/50 max-w-lg leading-relaxed font-light animate-fade-in-up" style={{ animationDelay: "400ms" }}>
              AI와 에듀테크 기반 전문 교육컨설팅으로
              <br />
              대한민국 교육의 미래를 만들어갑니다
            </p>
            <div className="flex flex-wrap gap-4 mt-10 animate-fade-in-up" style={{ animationDelay: "600ms" }}>
              <Link href="/programs" className="btn-primary">
                교육프로그램 <ArrowRight size={16} />
              </Link>
              <Link href="/inquiry" className="btn-secondary !border-white/20 !text-white hover:!bg-white/10">
                교육문의
              </Link>
            </div>
          </div>
        </div>

        {/* 스크롤 인디케이터 */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
          <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
          <ChevronDown size={16} className="animate-bounce-slow" />
        </div>
      </section>

      {/* ===== 카테고리 위젯 ===== */}
      <section className="py-20 lg:py-28" aria-label="교육 분야">
        <div className="container-custom">
          <ScrollReveal>
            <div className="text-center mb-14">
              <p className="section-label">Education Programs</p>
              <h2 className="section-title">
                KECA 핵심 교육 분야
              </h2>
            </div>
            <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-3 sm:grid sm:grid-cols-4 sm:overflow-visible sm:gap-4 lg:gap-6">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.label}
                    href={cat.href}
                    className="group flex flex-col items-center gap-3 p-6 lg:p-8 rounded-xl border border-transparent hover:border-border-light hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all text-center shrink-0 w-[140px] snap-start sm:w-auto sm:shrink"
                  >
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center group-hover:from-primary group-hover:to-primary-light group-hover:scale-110 transition-all">
                      <Icon size={24} className="text-primary group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-sm font-semibold text-text group-hover:text-primary transition-colors">
                      {cat.label}
                    </span>
                    <span className="text-xs text-text-muted leading-snug opacity-0 group-hover:opacity-100 max-h-0 group-hover:max-h-10 overflow-hidden transition-all duration-300">
                      {cat.desc}
                    </span>
                  </Link>
                );
              })}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== 실적 카운터 ===== */}
      <section className="py-20 bg-surface">
        <div className="container-custom">
          <CounterStats stats={stats} />
        </div>
      </section>

      {/* ===== 추천 교육 ===== */}
      {featuredPrograms.length > 0 && (
        <section className="py-20 lg:py-28">
          <div className="container-custom">
            <ScrollReveal>
              <div className="flex items-end justify-between mb-12">
                <div>
                  <p className="section-label">Featured Programs</p>
                  <h2 className="section-title">추천 교육</h2>
                </div>
                <Link
                  href="/programs"
                  className="hidden sm:flex items-center gap-1 text-sm font-medium text-text-sub hover:text-primary transition-colors"
                >
                  전체보기 <ChevronRight size={16} />
                </Link>
              </div>

              <div className="-mx-4 px-4 md:mx-0 md:px-0 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-5 md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible md:gap-8">
                {featuredPrograms.map((program) => {
                  const catSlug = program.category?.slug || "";
                  const cStyle = catCardStyles[catSlug] || { gradient: "from-[#1B2A4A] to-[#C4963C]", icon: Award };
                  const CatIcon = cStyle.icon;
                  return (
                    <Link
                      key={program.id}
                      href={`/programs/${program.slug}`}
                      className="group rounded-xl overflow-hidden card-hover bg-white border border-border-light shrink-0 w-[300px] snap-start md:w-auto md:shrink"
                    >
                      <div className={`aspect-[16/10] relative flex flex-col items-center justify-center overflow-hidden ${
                        program.thumbnail_url ? "" : `bg-gradient-to-br ${cStyle.gradient}`
                      }`}>
                        {program.thumbnail_url ? (
                          <img src={program.thumbnail_url} alt={program.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.15),transparent_60%)]" />
                            <CatIcon size={56} className="text-white/30 mb-3 group-hover:scale-110 group-hover:text-white/50 transition-all duration-300" />
                            <span className="text-white/60 text-sm font-medium tracking-wide">{program.category?.name || ""}</span>
                          </>
                        )}
                        {program.status === "published" && (
                          <span className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 text-xs font-semibold text-primary rounded-full backdrop-blur-sm">
                            모집중
                          </span>
                        )}
                      </div>
                      <div className="p-5">
                        {program.category && (
                          <span className="text-xs font-medium text-accent mb-2 block">
                            {program.category.name}
                          </span>
                        )}
                        <h3 className="text-base font-semibold text-text group-hover:text-primary transition-colors leading-snug">
                          {program.title}
                        </h3>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {program.target_audience && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/5 text-primary">
                              {program.target_audience}
                            </span>
                          )}
                          {program.duration && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent-dark">
                              {program.duration}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ===== 뉴스 & 일정 — 탭 UI ===== */}
      {hasNewsContent && (
        <section className="py-20 lg:py-28 bg-surface">
          <div className="container-custom">
            <ScrollReveal>
              <div className="text-center mb-14">
                <p className="section-label">News & Events</p>
                <h2 className="section-title">소식 & 일정</h2>
              </div>
              <NewsTabs
                notices={notices}
                reviews={reviews}
                upcomingSchedules={upcomingSchedules}
              />
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ===== 파트너 ===== */}
      {partners.length > 0 && (
        <section className="py-16">
          <div className="container-custom">
            <ScrollReveal>
              <div className="text-center mb-10">
                <p className="section-label">Partners</p>
                <h2 className="text-2xl font-bold text-text tracking-tight">함께하는 파트너</h2>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-12">
                {partners.map((p) => (
                  <div key={p.id} className="text-center">
                    {p.logo_url ? (
                      <img src={p.logo_url} alt={p.name} className="h-10 object-contain grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100" />
                    ) : (
                      <span className="text-sm text-text-muted font-medium">{p.name}</span>
                    )}
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ===== CTA ===== */}
      <section className="py-24 lg:py-32 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.02%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        <div className="container-custom text-center relative z-10">
          <ScrollReveal>
            <p className="text-xs font-semibold text-accent tracking-[0.2em] uppercase mb-6">Join KECA</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6 tracking-tight">
              교육의 미래를 함께 만들어가세요
            </h2>
            <p className="text-white/40 mb-10 max-w-lg mx-auto text-sm leading-relaxed">
              KECA 회원이 되시면 전문 교육프로그램, 자격증 과정, 네트워킹 등 다양한 혜택을 누릴 수 있습니다.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register" className="btn-primary !bg-accent hover:!bg-accent-dark">
                회원가입 <ArrowRight size={16} />
              </Link>
              <Link href="/about/benefits" className="btn-secondary !border-white/20 !text-white hover:!bg-white/10">
                회원혜택 보기
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
