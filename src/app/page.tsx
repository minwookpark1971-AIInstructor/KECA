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
} from "lucide-react";
import { getPostsByBoard, getPrograms, getSchedules } from "@/lib/supabase/queries";

// 카테고리 위젯 데이터
const categories = [
  { label: "AI·에듀테크 교육", icon: Cpu, href: "/programs?category=ai-edutech", color: "text-blue-600 bg-blue-50" },
  { label: "진로·진학 컨설팅", icon: Compass, href: "/programs?category=career", color: "text-emerald-600 bg-emerald-50" },
  { label: "교육컨설팅", icon: Briefcase, href: "/programs?category=consulting", color: "text-purple-600 bg-purple-50" },
  { label: "리더십·조직교육", icon: Users, href: "/programs?category=leadership", color: "text-orange-600 bg-orange-50" },
  { label: "직무역량 강화", icon: Target, href: "/programs?category=competency", color: "text-rose-600 bg-rose-50" },
  { label: "법정의무교육", icon: Shield, href: "/programs?category=mandatory", color: "text-slate-600 bg-slate-50" },
  { label: "전문가과정", icon: Award, href: "/expert", color: "text-amber-600 bg-amber-50" },
  { label: "강사진", icon: GraduationCap, href: "/instructors", color: "text-cyan-600 bg-cyan-50" },
];

// 실적 숫자
const stats = [
  { value: "500+", label: "교육 수료생" },
  { value: "50+", label: "기업 파트너" },
  { value: "30+", label: "전문 강사진" },
  { value: "98%", label: "교육 만족도" },
];

export default async function HomePage() {
  const [notices, reviews, featuredPrograms, schedules] = await Promise.all([
    getPostsByBoard("notice", 4),
    getPostsByBoard("review", 3),
    getPrograms({ featured: true, limit: 3 }),
    getSchedules(),
  ]);

  const upcomingSchedules = schedules
    .filter((s) => new Date(s.start_date) >= new Date())
    .slice(0, 3);
  return (
    <>
      {/* ===== 히어로 섹션 ===== */}
      <section className="relative bg-gradient-to-br from-primary via-primary-light to-primary overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-5" />
        <div className="container-custom relative py-20 lg:py-32">
          <div className="max-w-3xl">
            <p className="inline-block px-3 py-1 text-xs font-medium text-accent bg-accent/10 rounded-full mb-6">
              Korea Education Consulting Association
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              신뢰받는
              <br />
              교육컨설팅 생태계를
              <br />
              <span className="text-accent">선도합니다</span>
            </h1>
            <p className="mt-6 text-lg text-white/70 max-w-xl leading-relaxed">
              AI와 에듀테크 기반 전문 교육컨설팅으로
              <br />
              대한민국 교육의 미래를 만들어갑니다
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Link
                href="/programs"
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-dark text-white font-semibold rounded-lg transition-colors"
              >
                교육프로그램
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/inquiry"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 transition-colors"
              >
                교육문의
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 카테고리 위젯 ===== */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-accent tracking-wider uppercase mb-2">
              Education Programs
            </p>
            <h2 className="text-2xl lg:text-3xl font-bold text-text">
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
                  className="group flex flex-col items-center gap-3 p-6 rounded-xl border border-border-light hover:border-primary/20 hover:shadow-md transition-all text-center card-hover"
                >
                  <div className={`p-3 rounded-xl ${cat.color} transition-colors`}>
                    <Icon size={28} />
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
      <section className="py-14 bg-surface">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-text-sub">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 추천 교육 (Featured Programs) ===== */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-sm font-semibold text-accent tracking-wider uppercase mb-2">
                Featured Programs
              </p>
              <h2 className="text-2xl lg:text-3xl font-bold text-text">추천 교육</h2>
            </div>
            <Link
              href="/programs"
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-light transition-colors"
            >
              전체보기 <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPrograms.length > 0 ? featuredPrograms.map((program) => (
              <Link
                key={program.id}
                href={`/programs/${program.slug}`}
                className="group rounded-xl border border-border-light overflow-hidden card-hover"
              >
                <div className="aspect-[16/10] bg-gradient-to-br from-primary/5 to-primary-light/10 flex items-center justify-center">
                  {program.thumbnail_url ? (
                    <img src={program.thumbnail_url} alt={program.title} className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen size={48} className="text-primary/20" />
                  )}
                </div>
                <div className="p-5">
                  {program.category && (
                    <span className="inline-block px-2 py-0.5 text-xs font-medium text-primary bg-primary/5 rounded mb-2">
                      {program.category.name}
                    </span>
                  )}
                  <h3 className="text-base font-semibold text-text group-hover:text-primary transition-colors">
                    {program.title}
                  </h3>
                  <p className="mt-2 text-xs text-text-sub">
                    {program.target_audience || ""}{program.target_audience && program.duration ? " · " : ""}{program.duration || ""}
                  </p>
                </div>
              </Link>
            )) : (
              <p className="col-span-3 text-center text-sm text-text-muted py-8">등록된 추천 프로그램이 없습니다.</p>
            )}
          </div>
        </div>
      </section>

      {/* ===== 4분할 영역 (공지/문의/후기/일정) ===== */}
      <section className="py-16 lg:py-20 bg-surface">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 공지사항 */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-text flex items-center gap-2">
                  <MessageSquare size={20} className="text-primary" />
                  공지사항
                </h3>
                <Link href="/community/notice" className="text-xs text-text-sub hover:text-primary transition-colors">
                  더보기 &rarr;
                </Link>
              </div>
              <ul className="space-y-3">
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

            {/* 교육문의 미니 */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-text flex items-center gap-2">
                  <Briefcase size={20} className="text-accent" />
                  교육문의
                </h3>
                <Link href="/inquiry" className="text-xs text-text-sub hover:text-primary transition-colors">
                  문의하기 &rarr;
                </Link>
              </div>
              <p className="text-sm text-text-sub leading-relaxed mb-4">
                기업·기관 맞춤 교육이 필요하신가요?
                <br />
                교육 전문 컨설턴트가 최적의 프로그램을 제안해드립니다.
              </p>
              <Link
                href="/inquiry"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent-dark rounded-lg transition-colors"
              >
                교육문의 바로가기
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* 교육후기 */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-text flex items-center gap-2">
                  <Star size={20} className="text-amber-500" />
                  교육후기
                </h3>
                <Link href="/community/review" className="text-xs text-text-sub hover:text-primary transition-colors">
                  더보기 &rarr;
                </Link>
              </div>
              <ul className="space-y-3">
                {reviews.length > 0 ? reviews.map((r) => (
                  <li key={r.id} className="text-sm">
                    <p className="text-text truncate">{r.title}</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {r.created_at?.slice(0, 10)}
                    </p>
                  </li>
                )) : (
                  <li className="text-sm text-text-muted">등록된 후기가 없습니다.</li>
                )}
              </ul>
            </div>

            {/* 교육일정 미니 */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-text flex items-center gap-2">
                  <Calendar size={20} className="text-emerald-600" />
                  교육일정
                </h3>
                <Link href="/community/schedule" className="text-xs text-text-sub hover:text-primary transition-colors">
                  더보기 &rarr;
                </Link>
              </div>
              <ul className="space-y-3">
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

      {/* ===== CTA 섹션 ===== */}
      <section className="py-16 lg:py-20 bg-primary">
        <div className="container-custom text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
            교육의 미래를 함께 만들어가세요
          </h2>
          <p className="text-white/60 mb-8 max-w-xl mx-auto">
            KECA 회원이 되시면 전문 교육프로그램, 자격증 과정, 네트워킹 등 다양한 혜택을 누릴 수 있습니다.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-dark text-white font-semibold rounded-lg transition-colors"
            >
              회원가입
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/about/benefits"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 transition-colors"
            >
              회원혜택 보기
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
