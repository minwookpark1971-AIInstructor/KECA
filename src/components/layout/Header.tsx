"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { mainNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { MobileNav } from "./MobileNav";
import { AuthStatus } from "./AuthStatus";

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
            ? "bg-white shadow-[0_1px_0_rgba(0,0,0,0.06)]"
            : "bg-white/0"
        )}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-20">
            {/* 로고 */}
            <Link href="/" className="flex items-center gap-3">
              <span className="text-2xl font-extrabold tracking-tight text-primary">
                KECA
              </span>
              <span className="hidden sm:block text-[10px] text-text-muted leading-tight border-l border-border pl-3">
                한국교육컨설팅협회
              </span>
            </Link>

            {/* 데스크톱 네비게이션 */}
            <nav className="hidden lg:flex items-center gap-0.5" aria-label="메인 메뉴">
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
                      "flex items-center gap-1 px-4 py-2 text-[13px] font-medium tracking-tight transition-colors",
                      pathname.startsWith(item.href)
                        ? "text-primary"
                        : "text-text-sub hover:text-primary"
                    )}
                  >
                    {item.label}
                    {item.children && <ChevronDown size={12} className="opacity-40" />}
                  </Link>

                  {/* 드롭다운 — 전폭 메가메뉴 */}
                  {item.children && activeMenu === item.label && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 min-w-[220px] z-50">
                      <div className="bg-white rounded-lg shadow-lg border border-border-light py-2">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "block px-5 py-2.5 text-[13px] transition-colors",
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

            {/* 우측: 인증 상태 + 모바일 버튼 */}
            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-3 text-xs text-text-sub">
                <AuthStatus />
              </div>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 text-text hover:text-primary transition-colors"
                aria-label="메뉴"
              >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 모바일 네비게이션 */}
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* 헤더 높이 spacer */}
      <div className="h-20" />
    </>
  );
}
