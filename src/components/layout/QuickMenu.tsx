"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, Play, FileText, ArrowUp } from "lucide-react";
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
    color: "bg-[#FEE500] hover:bg-[#F5DC00] text-[#3C1E1E]",
    external: true,
  },
  {
    label: "유튜브",
    href: "#",
    icon: Play,
    color: "bg-[#FF0000] hover:bg-[#CC0000]",
    external: true,
  },
];

export function QuickMenu() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className={cn(
        "fixed right-4 bottom-6 z-40 flex flex-col gap-2 transition-all duration-300",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}
    >
      {quickItems.map((item) => {
        const Icon = item.icon;
        const Component = item.external ? "a" : Link;
        return (
          <Component
            key={item.label}
            href={item.href}
            {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className={cn(
              "flex items-center justify-center w-11 h-11 rounded-full text-white shadow-lg transition-all",
              item.color
            )}
            aria-label={item.label}
          >
            <Icon size={18} />
          </Component>
        );
      })}

      {/* 맨 위로 */}
      <button
        onClick={scrollToTop}
        className="flex items-center justify-center w-11 h-11 rounded-full bg-text/80 hover:bg-text text-white shadow-lg transition-all"
        aria-label="맨 위로"
      >
        <ArrowUp size={18} />
      </button>
    </div>
  );
}
