"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { AdminHeader } from "@/components/layout/AdminHeader";
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, FolderOpen,
  MessageSquare, HelpCircle, CreditCard, Building2,
  Settings, Award, ChevronDown,
  Megaphone, CalendarDays, Star, Image, Video, FolderArchive, Mic2, SlidersHorizontal,
} from "lucide-react";

type SidebarItem =
  | { type: "divider" }
  | { label: string; href: string; icon: React.ElementType }
  | { label: string; icon: React.ElementType; children: { label: string; href: string; icon: React.ElementType }[] };

const sidebarItems: SidebarItem[] = [
  { label: "대시보드", href: "/admin", icon: LayoutDashboard },
  { label: "회원관리", href: "/admin/members", icon: Users },
  { label: "강사관리", href: "/admin/instructors", icon: GraduationCap },
  { type: "divider" },
  { label: "교육분야", href: "/admin/categories", icon: FolderOpen },
  { label: "교육프로그램", href: "/admin/programs", icon: BookOpen },
  { label: "전문가과정", href: "/admin/expert", icon: Award },
  { type: "divider" },
  {
    label: "커뮤니티", icon: MessageSquare,
    children: [
      { label: "공지사항", href: "/admin/community/notice", icon: Megaphone },
      { label: "교육일정", href: "/admin/community/schedule", icon: CalendarDays },
      { label: "교육후기", href: "/admin/community/review", icon: Star },
      { label: "교육사진 갤러리", href: "/admin/community/photo_gallery", icon: Image },
      { label: "영상갤러리", href: "/admin/community/video_gallery", icon: Video },
      { label: "자료실", href: "/admin/community/resource", icon: FolderArchive },
      { label: "강의공고", href: "/admin/community/lecture", icon: Mic2 },
      { label: "메뉴 관리", href: "/admin/community/settings", icon: SlidersHorizontal },
    ],
  },
  { label: "교육문의", href: "/admin/inquiries", icon: HelpCircle },
  { type: "divider" },
  { label: "결제 내역", href: "/admin/payments", icon: CreditCard },
  { label: "파트너 관리", href: "/admin/partners", icon: Building2 },
  { label: "사이트 설정", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    // 커뮤니티 하위 경로에 있으면 자동으로 펼침
    if (pathname.startsWith("/admin/community")) {
      initial.add("커뮤니티");
    }
    return initial;
  });

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const isItemActive = (href: string) =>
    pathname === href || (href !== "/admin" && pathname.startsWith(href));

  const isGroupActive = (item: SidebarItem) => {
    if (!("children" in item)) return false;
    return item.children.some((child) => isItemActive(child.href));
  };

  // 모바일용 flat 메뉴 (하위 항목 포함)
  const flatItems = sidebarItems.flatMap((item) => {
    if ("type" in item) return [];
    if ("children" in item) return item.children;
    return [item as { label: string; href: string; icon: React.ElementType }];
  });

  return (
    <div className="min-h-screen bg-surface">
      <AdminHeader />

      {/* 사이드바 — top-14 = AdminHeader 높이(h-14) */}
      <aside className="fixed left-0 top-14 bottom-0 w-60 bg-white border-r border-border-light overflow-y-auto hidden lg:block z-40">
        <div className="p-4">
          <nav className="space-y-0.5">
            {sidebarItems.map((item, i) => {
              if ("type" in item) {
                return <div key={i} className="my-2 border-t border-border-light" />;
              }

              // 확장형 메뉴 (children 있음)
              if ("children" in item) {
                const expanded = expandedMenus.has(item.label) || isGroupActive(item);
                return (
                  <div key={item.label}>
                    <button
                      onClick={() => toggleMenu(item.label)}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors w-full",
                        isGroupActive(item)
                          ? "text-primary font-medium"
                          : "text-text-sub hover:bg-surface hover:text-text"
                      )}
                    >
                      <item.icon size={16} />
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronDown
                        size={14}
                        className={cn(
                          "transition-transform duration-200",
                          expanded ? "rotate-0" : "-rotate-90"
                        )}
                      />
                    </button>
                    {expanded && (
                      <div className="ml-4 mt-0.5 space-y-0.5 border-l border-border-light pl-2">
                        {item.children.map((child) => {
                          const active = isItemActive(child.href);
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors",
                                active
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "text-text-sub hover:bg-surface hover:text-text"
                              )}
                            >
                              <child.icon size={13} />
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              // 일반 메뉴 항목
              const navItem = item as { label: string; href: string; icon: React.ElementType };
              const isActive = isItemActive(navItem.href);
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
      <div className="lg:ml-60 pt-14">
        {/* 모바일: 상단 네비 */}
        <div className="lg:hidden bg-white border-b border-border-light px-4 py-2 overflow-x-auto">
          <div className="flex items-center gap-1 min-w-max">
            {flatItems.map((navItem) => {
              const isActive = isItemActive(navItem.href);
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
