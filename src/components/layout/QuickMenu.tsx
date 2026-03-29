"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { MessageCircle, Play, FileText, ArrowUp, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

const quickItems = [
  {
    label: "교육문의",
    href: "/inquiry",
    icon: FileText,
    color: "bg-primary hover:bg-primary-dark",
  },
  {
    label: "카카오",
    href: "#",
    icon: MessageCircle,
    color: "bg-primary hover:bg-primary-dark",
    external: true,
  },
  {
    label: "유튜브",
    href: "#",
    icon: Play,
    color: "bg-primary hover:bg-primary-dark",
    external: true,
  },
];

export function QuickMenu() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setOpen(false);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      {/* 배경 오버레이 */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/20 transition-opacity"
          onClick={close}
          aria-hidden
        />
      )}

      <div
        className={cn(
          "fixed right-4 bottom-6 z-40 flex flex-col items-center gap-3 transition-all duration-300",
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        {/* Speed Dial 아이템 */}
        {quickItems.map((item, i) => {
          const Icon = item.icon;
          const Component = item.external ? "a" : Link;
          return (
            <div
              key={item.label}
              className={cn(
                "flex items-center gap-3 transition-all duration-200",
                open
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 translate-y-3 pointer-events-none"
              )}
              style={{ transitionDelay: open ? `${(quickItems.length - i) * 50}ms` : "0ms" }}
            >
              <span className={cn(
                "text-xs font-medium text-white bg-text/80 px-3 py-1.5 rounded-full whitespace-nowrap shadow-sm transition-opacity",
                open ? "opacity-100" : "opacity-0"
              )}>
                {item.label}
              </span>
              <Component
                href={item.href}
                {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className={cn(
                  "flex items-center justify-center w-11 h-11 rounded-full text-white shadow-lg transition-all",
                  item.color
                )}
                onClick={close}
                aria-label={item.label}
              >
                <Icon size={18} />
              </Component>
            </div>
          );
        })}

        {/* 맨 위로 */}
        <div
          className={cn(
            "flex items-center gap-3 transition-all duration-200",
            open
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-3 pointer-events-none"
          )}
          style={{ transitionDelay: open ? "50ms" : "0ms" }}
        >
          <span className={cn(
            "text-xs font-medium text-white bg-text/80 px-3 py-1.5 rounded-full whitespace-nowrap shadow-sm transition-opacity",
            open ? "opacity-100" : "opacity-0"
          )}>
            맨 위로
          </span>
          <button
            onClick={scrollToTop}
            className="flex items-center justify-center w-11 h-11 rounded-full bg-primary hover:bg-primary-dark text-white shadow-lg transition-all"
            aria-label="맨 위로"
          >
            <ArrowUp size={18} />
          </button>
        </div>

        {/* 메인 FAB */}
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            "flex items-center justify-center w-14 h-14 rounded-full bg-accent hover:bg-accent-dark text-white shadow-xl transition-all duration-300",
            open && "rotate-[135deg]"
          )}
          aria-label={open ? "메뉴 닫기" : "빠른 메뉴"}
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <Plus size={24} />}
        </button>
      </div>
    </>
  );
}
