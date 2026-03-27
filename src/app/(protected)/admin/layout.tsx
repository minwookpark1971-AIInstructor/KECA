"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, FolderOpen,
  MessageSquare, CalendarDays, HelpCircle, CreditCard, Building2,
  Settings, ChevronLeft, Award,
} from "lucide-react";

const sidebarItems = [
  { label: "대시보드", href: "/admin", icon: LayoutDashboard },
  { label: "회원관리", href: "/admin/members", icon: Users },
  { label: "강사관리", href: "/admin/instructors", icon: GraduationCap },
  { type: "divider" as const },
  { label: "교육분야", href: "/admin/categories", icon: FolderOpen },
  { label: "교육프로그램", href: "/admin/programs", icon: BookOpen },
  { label: "전문가과정", href: "/admin/expert", icon: Award },
  { type: "divider" as const },
  { label: "커뮤니티", href: "/admin/community/notice", icon: MessageSquare },
  { label: "교육일정", href: "/admin/schedules", icon: CalendarDays },
  { label: "교육문의", href: "/admin/inquiries", icon: HelpCircle },
  { type: "divider" as const },
  { label: "결제 내역", href: "/admin/payments", icon: CreditCard },
  { label: "파트너 관리", href: "/admin/partners", icon: Building2 },
  { label: "사이트 설정", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-surface">
      {/* 사이드바 */}
      <aside className="fixed left-0 top-[105px] lg:top-[113px] bottom-0 w-60 bg-white border-r border-border-light overflow-y-auto hidden lg:block z-40">
        <div className="p-4">
          <Link href="/admin" className="flex items-center gap-2 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Settings size={16} className="text-white" />
            </div>
            <span className="text-sm font-bold text-primary">관리자</span>
          </Link>

          <nav className="space-y-0.5">
            {sidebarItems.map((item, i) => {
              if ("type" in item && item.type === "divider") {
                return <div key={i} className="my-2 border-t border-border-light" />;
              }
              const navItem = item as { label: string; href: string; icon: React.ElementType };
              const isActive = pathname === navItem.href || (navItem.href !== "/admin" && pathname.startsWith(navItem.href));
              return (
                <Link
                  key={navItem.href}
                  href={navItem.href}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-text-sub hover:bg-surface hover:text-text"
                  )}
                >
                  <navItem.icon size={16} />
                  {navItem.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <div className="lg:ml-60">
        {/* 모바일: 상단 네비 */}
        <div className="lg:hidden bg-white border-b border-border-light px-4 py-2 overflow-x-auto">
          <div className="flex items-center gap-1 min-w-max">
            {sidebarItems
              .filter((item) => !("type" in item))
              .map((item) => {
                const navItem = item as { label: string; href: string; icon: React.ElementType };
                const isActive = pathname === navItem.href || (navItem.href !== "/admin" && pathname.startsWith(navItem.href));
                return (
                  <Link
                    key={navItem.href}
                    href={navItem.href}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                      isActive ? "bg-primary text-white" : "text-text-sub hover:bg-surface"
                    )}
                  >
                    {navItem.label}
                  </Link>
                );
              })}
          </div>
        </div>

        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
