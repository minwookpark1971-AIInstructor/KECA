"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SubpageHero } from "@/components/layout/SubpageHero";
import { Cpu, Compass, Briefcase, Users, Target, Shield, Award, BookOpen, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category, Program } from "@/types";

const categoryStyles: Record<string, { gradient: string; icon: React.ElementType }> = {
  "ai-edutech": { gradient: "from-[#1B2A4A] to-[#2E5090]", icon: Cpu },
  "career": { gradient: "from-[#064E3B] to-[#10B981]", icon: Compass },
  "consulting": { gradient: "from-[#4C1D95] to-[#7C3AED]", icon: Briefcase },
  "leadership": { gradient: "from-[#92400E] to-[#F59E0B]", icon: Users },
  "competency": { gradient: "from-[#831843] to-[#EC4899]", icon: Target },
  "mandatory": { gradient: "from-[#374151] to-[#6B7280]", icon: Shield },
};

export default function ProgramsContent({ categories, programs }: { categories: Category[]; programs: Program[] }) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const cat = searchParams.get("category") || "";
    setActiveCategory(cat);
  }, [searchParams]);

  const filteredPrograms = programs
    .filter((p) => p.status === "published")
    .filter((p) => {
      if (activeCategory) {
        const cat = categories.find((c) => c.id === p.category_id);
        if (cat?.slug !== activeCategory) return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return p.title.toLowerCase().includes(q) || p.subtitle?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
      }
      return true;
    });

  return (
    <>
      <SubpageHero
        title="교육프로그램"
        subtitle="AI·에듀테크부터 법정의무교육까지 다양한 교육과정을 제공합니다"
        breadcrumb={[{ label: "교육프로그램" }]}
      />

      <section className="py-16 lg:py-20">
        <div className="container-custom">
          {/* 검색 */}
          <div className="mb-6 max-w-sm ml-auto">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="프로그램 검색"
                className="w-full pl-9 pr-4 py-2 border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label="프로그램 검색"
              />
            </div>
          </div>

          {/* 카테고리 탭 */}
          <div className="flex flex-wrap gap-2 mb-10">
            <button
              onClick={() => setActiveCategory("")}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-full border transition-colors",
                !activeCategory
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-text-sub border-border hover:border-primary hover:text-primary"
              )}
            >
              전체
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-full border transition-colors",
                  activeCategory === cat.slug
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-text-sub border-border hover:border-primary hover:text-primary"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* 프로그램 그리드 */}
          {filteredPrograms.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrograms.map((program) => {
                const category = categories.find((c) => c.id === program.category_id);
                const catSlug = category?.slug || "";
                const style = categoryStyles[catSlug] || { gradient: "from-[#1B2A4A] to-[#C4963C]", icon: Award };
                const Icon = style.icon;
                return (
                  <Link
                    key={program.id}
                    href={`/programs/${program.slug}`}
                    className="group rounded-lg overflow-hidden card-hover bg-white"
                  >
                    <div className={`aspect-[16/10] bg-gradient-to-br ${style.gradient} flex flex-col items-center justify-center p-6 relative`}>
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.04%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
                      <Icon size={36} className="text-white/30 mb-3 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-white/50 text-xs font-medium tracking-wider uppercase relative z-10">{category?.name || "교육과정"}</span>
                    </div>
                    <div className="p-5">
                      {category && (
                        <span className="inline-block px-2 py-0.5 text-xs font-medium text-primary bg-primary/5 rounded mb-2">
                          {category.name}
                        </span>
                      )}
                      <h3 className="text-base font-semibold text-text group-hover:text-primary transition-colors">
                        {program.title}
                      </h3>
                      {program.subtitle && (
                        <p className="mt-1 text-xs text-text-muted line-clamp-2">{program.subtitle}</p>
                      )}
                      <p className="mt-3 text-xs text-text-sub">
                        {program.target_audience && <span>{program.target_audience}</span>}
                        {program.duration && <span> · {program.duration}</span>}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 text-text-muted">
              해당 카테고리의 교육프로그램이 준비 중입니다.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
