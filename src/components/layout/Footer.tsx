import Link from "next/link";
import { Mail, MapPin } from "lucide-react";

const siteLinks = [
  { label: "협회소개", href: "/about" },
  { label: "교육프로그램", href: "/programs" },
  { label: "전문가과정", href: "/expert" },
  { label: "자격소개", href: "/certification" },
  { label: "강사진", href: "/instructors" },
  { label: "교육문의", href: "/inquiry" },
  { label: "공지사항", href: "/community/notice" },
  { label: "교육일정", href: "/community/schedule" },
  { label: "교육후기", href: "/community/review" },
];

export function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="container-custom py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          {/* 협회 정보 */}
          <div>
            <Link href="/" className="text-2xl font-extrabold tracking-tight">
              KECA
            </Link>
            <p className="mt-1 text-xs text-white/40 tracking-widest uppercase">
              Korea Education Consulting Association
            </p>
            <p className="mt-6 text-sm text-white/60 leading-relaxed">
              AI와 에듀테크 기반 전문 교육컨설팅으로
              <br />
              대한민국 교육의 미래를 만들어갑니다.
            </p>
          </div>

          {/* 사이트맵 */}
          <div>
            <h4 className="text-xs font-semibold mb-5 text-white/40 tracking-widest uppercase">Sitemap</h4>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2.5">
              {siteLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* 연락처 */}
          <div>
            <h4 className="text-xs font-semibold mb-5 text-white/40 tracking-widest uppercase">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-white/60">
                <MapPin size={15} className="mt-0.5 shrink-0 text-accent" />
                서울특별시 강남구
              </li>
              <li className="flex items-start gap-3 text-sm text-white/60">
                <Mail size={15} className="mt-0.5 shrink-0 text-accent" />
                info@keca.or.kr
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 하단 바 */}
      <div className="border-t border-white/10">
        <div className="container-custom flex flex-col sm:flex-row items-center justify-between py-5 gap-2">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} 사단법인 한국교육컨설팅협회(KECA). All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-white/30">
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
