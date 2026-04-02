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

          {/* 카테고리 카드 그리드 */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {categories.map((cat) => {
              const style = categoryStyles[cat.slug] || { gradient: "from-[#1B2A4A] to-[#C4963C]", icon: Award };
              const Icon = style.icon;
              const isActive = activeCategory === cat.slug;
              return (
                <Link
                  key={cat.slug}
                  href={`/programs?category=${cat.slug}`}
                  onClick={(e) => { e.preventDefault(); setActiveCategory(isActive ? "" : cat.slug); }}
                  className={cn(
                    "text-left rounded-xl overflow-hidden border-2 transition-all",
                    isActive ? "border-primary shadow-lg" : "border-transparent shadow-card hover:shadow-lg"
                  )}
                >
                  {cat.image_url ? (
                    <div className="h-36 overflow-hidden">
                      <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className={`h-36 bg-gradient-to-br ${style.gradient} flex items-center justify-center`}>
                      <Icon size={40} className="text-white/60" />
                    </div>
                  )}
                  <div className="p-4 bg-white">
                    <h3 className="text-sm font-bold text-text">{cat.name}</h3>
                    {cat.description && (
                      <p className="text-xs text-text-sub mt-1 line-clamp-2">{cat.description}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* 선택된 카테고리 상세 설명 */}
          {activeCategory && (() => {
            const selectedCat = categories.find((c) => c.slug === activeCategory);
            if (!selectedCat) return null;
            return (
              <div className="mb-10 bg-white border border-border-light rounded-2xl overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {selectedCat.image_url && (
                    <div className="md:w-2/5 shrink-0">
                      <img src={selectedCat.image_url} alt={selectedCat.name} className="w-full h-full min-h-[200px] object-cover" />
                    </div>
                  )}
                  <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-xl font-bold text-text">{selectedCat.name}</h2>
                      <button onClick={() => setActiveCategory("")} className="text-xs text-text-muted hover:text-primary px-3 py-1 border border-border-light rounded-full">
                        전체보기
                      </button>
                    </div>
                    {selectedCat.description && (
                      <p className="text-sm text-text-sub leading-relaxed whitespace-pre-line">{selectedCat.description}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 교육과정 목록 */}
          {activeCategory && (
            <h3 className="text-lg font-bold text-text mb-6">
              {categories.find((c) => c.slug === activeCategory)?.name} 교육과정
            </h3>
          )}

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
                    <div className={`aspect-[16/10] flex flex-col items-center justify-center p-6 overflow-hidden ${
                      program.thumbnail_url
                        ? "bg-white border border-border"
                        : `bg-gradient-to-br ${style.gradient}`
                    }`}>
                      {program.thumbnail_url ? (
                        <img src={program.thumbnail_url} alt={program.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <>
                          <Icon size={48} className="text-white/80 mb-3 group-hover:scale-110 transition-transform duration-300" />
                          <span className="text-white/70 text-sm font-medium tracking-wide">{category?.name || "교육과정"}</span>
                        </>
                      )}
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
              {activeCategory ? "해당 카테고리의 교육프로그램이 준비 중입니다." : "등록된 교육프로그램이 없습니다."}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
