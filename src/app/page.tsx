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
  Calendar,
  MessageSquare,
  Star,
  BookOpen,
  ChevronDown,
} from "lucide-react";
import { getPostsByBoard, getPrograms, getSchedules, getPartners } from "@/lib/supabase/queries";

const catCardStyles: Record<string, { gradient: string; icon: typeof Cpu }> = {
  "ai-edutech": { gradient: "from-[#1B2A4A] to-[#2E5090]", icon: Cpu },
  "career": { gradient: "from-[#064E3B] to-[#10B981]", icon: Compass },
  "consulting": { gradient: "from-[#4C1D95] to-[#7C3AED]", icon: Briefcase },
  "leadership": { gradient: "from-[#92400E] to-[#F59E0B]", icon: Users },
  "competency": { gradient: "from-[#831843] to-[#EC4899]", icon: Target },
  "mandatory": { gradient: "from-[#374151] to-[#6B7280]", icon: Shield },
};

const categories = [
  { label: "AI·에듀테크 교육", icon: Cpu, href: "/programs?category=ai-edutech" },
  { label: "진로·진학 컨설팅", icon: Compass, href: "/programs?category=career" },
  { label: "교육컨설팅", icon: Briefcase, href: "/programs?category=consulting" },
  { label: "리더십·조직교육", icon: Users, href: "/programs?category=leadership" },
  { label: "직무역량 강화", icon: Target, href: "/programs?category=competency" },
  { label: "법정의무교육", icon: Shield, href: "/programs?category=mandatory" },
  { label: "전문가과정", icon: Award, href: "/expert" },
  { label: "강사진", icon: GraduationCap, href: "/instructors" },
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

  return (
    <>
      {/* ===== 히어로 — 풀스크린, 미니멀 ===== */}
      <section className="relative min-h-[100vh] flex items-center bg-primary overflow-hidden -mt-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        <div className="container-custom relative z-10 pt-20">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold text-accent tracking-[0.2em] uppercase mb-8">
              Korea Education Consulting Association
            </p>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight">
              신뢰받는
              <br />
              교육컨설팅 생태계를
              <br />
              <span className="text-accent">선도합니다</span>
            </h1>
            <p className="mt-8 text-lg text-white/50 max-w-lg leading-relaxed font-light">
              AI와 에듀테크 기반 전문 교육컨설팅으로
              <br />
              대한민국 교육의 미래를 만들어갑니다
            </p>
            <div className="flex flex-wrap gap-4 mt-10">
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
      <section className="py-20 lg:py-28">
        <div className="container-custom">
          <div className="text-center mb-14">
            <p className="section-label">Education Programs</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-text tracking-tight">
              KECA 핵심 교육 분야
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.label}
                  href={cat.href}
                  className="group flex flex-col items-center gap-4 p-8 rounded-lg hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all text-center"
                >
                  <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Icon size={24} className="text-primary" />
                  </div>
                  <span className="text-sm font-medium text-text group-hover:text-primary transition-colors">
                    {cat.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== 실적 카운터 ===== */}
      <section className="py-20 bg-surface">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-primary tracking-tight">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-text-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 추천 교육 ===== */}
      <section className="py-20 lg:py-28">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="section-label">Featured Programs</p>
              <h2 className="text-3xl lg:text-4xl font-bold text-text tracking-tight">추천 교육</h2>
            </div>
            <Link
              href="/programs"
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-text-sub hover:text-primary transition-colors"
            >
              전체보기 <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPrograms.length > 0 ? featuredPrograms.map((program) => {
              const catSlug = program.category?.slug || "";
              const cStyle = catCardStyles[catSlug] || { gradient: "from-[#1B2A4A] to-[#C4963C]", icon: Award };
              const CatIcon = cStyle.icon;
              return (
              <Link
                key={program.id}
                href={`/programs/${program.slug}`}
                className="group rounded-lg overflow-hidden card-hover"
              >
                <div className="aspect-[16/10] bg-[#F0F0F0] flex flex-col items-center justify-center p-6 overflow-hidden">
                  {program.thumbnail_url ? (
                    <img src={program.thumbnail_url} alt={program.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <>
                      <CatIcon size={72} className="text-text-muted/20 mb-3 group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-text-muted/40 text-base font-semibold tracking-wide">{program.category?.name || ""}</span>
                    </>
                  )}
                </div>
                <div className="p-6">
                  {program.category && (
                    <span className="text-xs font-medium text-accent mb-2 block">
                      {program.category.name}
                    </span>
                  )}
                  <h3 className="text-base font-semibold text-text group-hover:text-primary transition-colors">
                    {program.title}
                  </h3>
                  <p className="mt-2 text-xs text-text-muted">
                    {program.target_audience || ""}{program.target_audience && program.duration ? " · " : ""}{program.duration || ""}
                  </p>
                </div>
              </Link>
              );
            }) : (
              <p className="col-span-3 text-center text-sm text-text-muted py-12">등록된 추천 프로그램이 없습니다.</p>
            )}
          </div>
        </div>
      </section>

      {/* ===== 뉴스 & 일정 (2×2) ===== */}
      <section className="py-20 lg:py-28 bg-surface">
        <div className="container-custom">
          <div className="text-center mb-14">
            <p className="section-label">News & Events</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-text tracking-tight">소식 & 일정</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* 공지사항 */}
            <div className="bg-white rounded-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-text flex items-center gap-2">
                  <MessageSquare size={18} className="text-primary" />
                  공지사항
                </h3>
                <Link href="/community/notice" className="text-xs text-text-muted hover:text-primary transition-colors">
                  더보기 &rarr;
                </Link>
              </div>
              <ul className="space-y-4">
                {notices.length > 0 ? notices.map((n) => (
                  <li key={n.id} className="flex items-center justify-between text-sm">
                    <span className="text-text truncate mr-4">{n.title}</span>
                    <span className="text-text-muted text-xs shrink-0">{n.created_at?.slice(0, 10)}</span>
                  </li>
                )) : (
                  <li className="text-sm text-text-muted">등록된 공지사항이 없습니다.</li>
                )}
              </ul>
            </div>

            {/* 교육문의 */}
            <div className="bg-white rounded-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-text flex items-center gap-2">
                  <Briefcase size={18} className="text-accent" />
                  교육문의
                </h3>
              </div>
              <p className="text-sm text-text-sub leading-relaxed mb-6">
                기업·기관 맞춤 교육이 필요하신가요?
                <br />
                교육 전문 컨설턴트가 최적의 프로그램을 제안해드립니다.
              </p>
              <Link href="/inquiry" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-white/90 text-primary font-semibold text-xs rounded-full transition-colors shadow-sm">
                교육문의 바로가기 <ArrowRight size={14} />
              </Link>
            </div>

            {/* 교육후기 */}
            <div className="bg-white rounded-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-text flex items-center gap-2">
                  <Star size={18} className="text-amber-500" />
                  교육후기
                </h3>
                <Link href="/community/review" className="text-xs text-text-muted hover:text-primary transition-colors">
                  더보기 &rarr;
                </Link>
              </div>
              <ul className="space-y-4">
                {reviews.length > 0 ? reviews.map((r) => (
                  <li key={r.id} className="text-sm">
                    <p className="text-text truncate">{r.title}</p>
                    <p className="text-xs text-text-muted mt-0.5">{r.created_at?.slice(0, 10)}</p>
                  </li>
                )) : (
                  <li className="text-sm text-text-muted">등록된 후기가 없습니다.</li>
                )}
              </ul>
            </div>

            {/* 교육일정 */}
            <div className="bg-white rounded-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-text flex items-center gap-2">
                  <Calendar size={18} className="text-emerald-600" />
                  교육일정
                </h3>
                <Link href="/community/schedule" className="text-xs text-text-muted hover:text-primary transition-colors">
                  더보기 &rarr;
                </Link>
              </div>
              <ul className="space-y-4">
                {upcomingSchedules.length > 0 ? upcomingSchedules.map((s) => {
                  const d = new Date(s.start_date);
                  return (
                    <li key={s.id} className="flex items-start gap-3 text-sm">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/5 text-primary text-xs font-bold shrink-0">
                        {d.getMonth() + 1}/{d.getDate()}
                      </span>
                      <div>
                        <p className="font-medium text-text">{s.title}</p>
                        <p className="text-xs text-text-muted">
                          {s.is_online ? "온라인" : s.location || ""}
                          {s.start_time ? ` · ${s.start_time}~${s.end_time || ""}` : ""}
                        </p>
                      </div>
                    </li>
                  );
                }) : (
                  <li className="text-sm text-text-muted">예정된 일정이 없습니다.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 파트너 ===== */}
      {partners.length > 0 && (
        <section className="py-16">
          <div className="container-custom">
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
          </div>
        </section>
      )}

      {/* ===== CTA ===== */}
      <section className="py-24 lg:py-32 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.02%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        <div className="container-custom text-center relative z-10">
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
        </div>
      </section>
    </>
  );
}
