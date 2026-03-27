import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

const quickLinks = [
  { label: "협회소개", href: "/about" },
  { label: "교육프로그램", href: "/programs" },
  { label: "전문가과정", href: "/expert" },
  { label: "자격소개", href: "/certification" },
  { label: "강사진", href: "/instructors" },
  { label: "교육문의", href: "/inquiry" },
];

const communityLinks = [
  { label: "공지사항", href: "/community/notice" },
  { label: "교육일정", href: "/community/schedule" },
  { label: "교육후기", href: "/community/review" },
  { label: "갤러리", href: "/community/gallery" },
];

export function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="container-custom py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* 협회 정보 */}
          <div className="lg:col-span-1">
            <Link href="/" className="text-2xl font-extrabold tracking-tight">
              KECA
            </Link>
            <p className="mt-1 text-sm text-white/60">
              Korea Education Consulting Association
            </p>
            <p className="mt-4 text-sm text-white/70 leading-relaxed">
              AI와 에듀테크 기반 전문 교육컨설팅으로
              <br />
              대한민국 교육의 미래를 만들어갑니다
            </p>
          </div>

          {/* 빠른 링크 */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-white/90">바로가기</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 커뮤니티 */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-white/90">커뮤니티</h4>
            <ul className="space-y-2.5">
              {communityLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 연락처 */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-white/90">연락처</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-white/60">
                <MapPin size={16} className="mt-0.5 shrink-0 text-accent" />
                서울특별시 강남구
              </li>
              <li className="flex items-start gap-2.5 text-sm text-white/60">
                <Mail size={16} className="mt-0.5 shrink-0 text-accent" />
                info@keca.or.kr
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 하단 바 */}
      <div className="border-t border-white/10">
        <div className="container-custom flex flex-col sm:flex-row items-center justify-between py-4 gap-2">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} 사단법인 한국교육컨설팅협회(KECA). All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-white/40">
            <Link href="/privacy" className="hover:text-white/60 transition-colors">
              개인정보처리방침
            </Link>
            <Link href="/terms" className="hover:text-white/60 transition-colors">
              이용약관
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
