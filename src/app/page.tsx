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

// 목업 공지사항
const notices = [
  { title: "2026년 제1기 AI교육전문가 자격과정 모집", date: "2026.03.25" },
  { title: "KECA 연간 교육일정 안내", date: "2026.03.20" },
  { title: "제3회 교육컨설팅 세미나 개최 안내", date: "2026.03.15" },
  { title: "신규 회원 가입 혜택 안내", date: "2026.03.10" },
];

// 목업 교육후기
const reviews = [
  { title: "AI 교육 덕분에 업무 효율이 크게 올랐습니다", author: "김○○", program: "AI·에듀테크 교육" },
  { title: "체계적인 커리큘럼이 인상적이었습니다", author: "이○○", program: "교육컨설팅" },
  { title: "강사님의 실무 경험이 많은 도움이 되었습니다", author: "박○○", program: "리더십·조직교육" },
];

export default function HomePage() {
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
            {/* 목업 카드 3개 */}
            {[
              {
                title: "생성형 AI 활용 교육",
                category: "AI·에듀테크",
                target: "기업 임직원",
                duration: "4시간",
              },
              {
                title: "교육리더십 워크숍",
                category: "리더십·조직교육",
                target: "교육기관 관리자",
                duration: "8시간(1일)",
              },
              {
                title: "AI 기반 진로진단 프로그램",
                category: "진로·진학 컨설팅",
                target: "중·고등학생",
                duration: "2시간",
              },
            ].map((program) => (
              <Link
                key={program.title}
                href="/programs"
                className="group rounded-xl border border-border-light overflow-hidden card-hover"
              >
                <div className="aspect-[16/10] bg-gradient-to-br from-primary/5 to-primary-light/10 flex items-center justify-center">
                  <BookOpen size={48} className="text-primary/20" />
                </div>
                <div className="p-5">
                  <span className="inline-block px-2 py-0.5 text-xs font-medium text-primary bg-primary/5 rounded mb-2">
                    {program.category}
                  </span>
                  <h3 className="text-base font-semibold text-text group-hover:text-primary transition-colors">
                    {program.title}
                  </h3>
                  <p className="mt-2 text-xs text-text-sub">
                    {program.target} · {program.duration}
                  </p>
                </div>
              </Link>
            ))}
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
                {notices.map((n, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span className="text-text truncate mr-4">{n.title}</span>
                    <span className="text-text-muted text-xs shrink-0">{n.date}</span>
                  </li>
                ))}
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
                {reviews.map((r, i) => (
                  <li key={i} className="text-sm">
                    <p className="text-text truncate">{r.title}</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {r.author} · {r.program}
                    </p>
                  </li>
                ))}
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
                <li className="flex items-start gap-3 text-sm">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/5 text-primary text-xs font-bold shrink-0">
                    4/5
                  </span>
                  <div>
                    <p className="font-medium text-text">AI교육전문가 1급 과정</p>
                    <p className="text-xs text-text-muted">서울 · 09:00~18:00</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/5 text-primary text-xs font-bold shrink-0">
                    4/12
                  </span>
                  <div>
                    <p className="font-medium text-text">교육컨설팅 기초 세미나</p>
                    <p className="text-xs text-text-muted">온라인 · 14:00~17:00</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/5 text-primary text-xs font-bold shrink-0">
                    4/20
                  </span>
                  <div>
                    <p className="font-medium text-text">리더십 워크숍</p>
                    <p className="text-xs text-text-muted">서울 · 09:00~13:00</p>
                  </div>
                </li>
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
