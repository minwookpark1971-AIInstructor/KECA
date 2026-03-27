"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, ChevronDown, User, LogIn } from "lucide-react";
import { mainNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { MobileNav } from "./MobileNav";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 페이지 이동 시 메뉴 닫기
  useEffect(() => {
    setMobileOpen(false);
    setActiveMenu(null);
  }, [pathname]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm"
            : "bg-white"
        )}
      >
        {/* 상단 유틸 바 */}
        <div className="border-b border-border-light">
          <div className="container-custom flex items-center justify-end gap-4 py-2 text-xs text-text-sub">
            <Link href="/login" className="flex items-center gap-1 hover:text-primary transition-colors">
              <LogIn size={12} />
              로그인
            </Link>
            <Link href="/register" className="hover:text-primary transition-colors">
              회원가입
            </Link>
          </div>
        </div>

        {/* 메인 GNB */}
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* 로고 */}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl lg:text-3xl font-extrabold tracking-tight text-primary">
                KECA
              </span>
              <span className="hidden sm:block text-[10px] lg:text-xs text-text-sub leading-tight">
                한국교육컨설팅협회
              </span>
            </Link>

            {/* 데스크톱 네비게이션 */}
            <nav className="hidden lg:flex items-center gap-1">
              {mainNavigation.map((item) => (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => setActiveMenu(item.label)}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-md transition-colors",
                      pathname.startsWith(item.href)
                        ? "text-primary"
                        : "text-text hover:text-primary hover:bg-surface"
                    )}
                  >
                    {item.label}
                    {item.children && <ChevronDown size={14} className="opacity-50" />}
                  </Link>

                  {/* 드롭다운 */}
                  {item.children && activeMenu === item.label && (
                    <div className="absolute top-full left-0 pt-1 min-w-[200px] z-50">
                      <div className="bg-white rounded-lg shadow-lg border border-border-light py-2">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "block px-4 py-2.5 text-sm transition-colors",
                              pathname === child.href
                                ? "text-primary bg-surface font-medium"
                                : "text-text-sub hover:text-primary hover:bg-surface"
                            )}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* 모바일 메뉴 버튼 */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-text hover:text-primary transition-colors"
              aria-label="메뉴"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* 모바일 네비게이션 */}
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* 헤더 높이만큼 spacer */}
      <div className="h-[105px] lg:h-[113px]" />
    </>
  );
}
