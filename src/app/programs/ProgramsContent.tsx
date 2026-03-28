"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SubpageHero } from "@/components/layout/SubpageHero";
import { BookOpen, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category, Program } from "@/types";

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
      if (!activeCategory) return true;
      const cat = categories.find((c) => c.id === p.category_id);
      return cat?.slug === activeCategory;
    })
    .filter((p) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        (p.subtitle && p.subtitle.toLowerCase().includes(q)) ||
        (p.target_audience && p.target_audience.toLowerCase().includes(q))
      );
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
          <div className="relative mb-6">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="프로그램 검색..."
              className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
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
                return (
                  <Link
                    key={program.id}
                    href={`/programs/${program.slug}`}
                    className="group rounded-xl border border-border-light overflow-hidden card-hover bg-white"
                  >
                    <div className="aspect-[16/10] bg-gradient-to-br from-primary/5 to-primary-light/10 flex items-center justify-center">
                      <BookOpen size={48} className="text-primary/20" />
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
