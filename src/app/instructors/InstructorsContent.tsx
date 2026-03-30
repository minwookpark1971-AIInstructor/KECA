"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { SubpageHero } from "@/components/layout/SubpageHero";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types";
import {
  Search,
  ArrowRight,
  LayoutGrid,
  Bot,
  Compass,
  GraduationCap,
  Users,
  Monitor,
} from "lucide-react";

const filterTags = [
  { label: "전체", value: "", icon: LayoutGrid },
  { label: "AI교육", value: "AI교육", icon: Bot },
  { label: "진로교육", value: "진로교육", icon: Compass },
  { label: "교육컨설팅", value: "교육컨설팅", icon: GraduationCap },
  { label: "리더십", value: "리더십", icon: Users },
  { label: "에듀테크", value: "에듀테크", icon: Monitor },
];

const tagColors = [
  "bg-[#1B2A4A]/8 text-[#1B2A4A]",
  "bg-[#C4963C]/10 text-[#A67D2E]",
  "bg-blue-50 text-blue-700",
  "bg-teal-50 text-teal-700",
  "bg-purple-50 text-purple-700",
];

export default function InstructorsContent({ instructors }: { instructors: Profile[] }) {
  const [activeFilter, setActiveFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "newest">("name");

  const filteredInstructors = useMemo(() => {
    let result = instructors;

    if (activeFilter) {
      result = result.filter((inst) =>
        inst.specialties?.some((s) => s.includes(activeFilter))
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((inst) => inst.name.toLowerCase().includes(q));
    }

    result = [...result].sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return a.name.localeCompare(b.name, "ko");
    });

    return result;
  }, [instructors, activeFilter, searchQuery, sortBy]);

  return (
    <>
      <SubpageHero
        title="강사진"
        subtitle="KECA 소속 전문 교육 강사진을 소개합니다"
        breadcrumb={[{ label: "강사진" }]}
      />

      <section className="py-16 lg:py-20">
        <div className="container-custom">
          {/* ── 카테고리 필터 ── */}
          <div className="bg-surface rounded-2xl p-4 md:p-5 mb-6">
            <div className="flex flex-wrap gap-2.5">
              {filterTags.map((tag) => {
                const Icon = tag.icon;
                const isActive = activeFilter === tag.value;
                return (
                  <button
                    key={tag.value}
                    onClick={() => setActiveFilter(tag.value)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border transition-all duration-200",
                      isActive
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-white text-text-sub border-border hover:border-primary hover:text-primary"
                    )}
                  >
                    <Icon size={16} />
                    {tag.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── 툴바: 카운트 + 검색 + 정렬 ── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <p className="text-sm text-text-sub">
              전체{" "}
              <span className="font-semibold text-primary">
                {filteredInstructors.length}
              </span>
              명의 강사님이 검색되었습니다
            </p>

            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="강사명 검색"
                  className="w-full sm:w-64 pl-9 pr-4 py-2 border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>

              <div className="flex items-center gap-1 text-sm shrink-0">
                <button
                  onClick={() => setSortBy("name")}
                  className={cn(
                    "px-2 py-1 rounded transition-colors",
                    sortBy === "name"
                      ? "text-primary font-semibold"
                      : "text-text-muted hover:text-text-sub"
                  )}
                >
                  이름순
                </button>
                <span className="text-border">|</span>
                <button
                  onClick={() => setSortBy("newest")}
                  className={cn(
                    "px-2 py-1 rounded transition-colors",
                    sortBy === "newest"
                      ? "text-primary font-semibold"
                      : "text-text-muted hover:text-text-sub"
                  )}
                >
                  최신순
                </button>
              </div>
            </div>
          </div>

          {/* ── 강사 카드 그리드 (5열) ── */}
          {filteredInstructors.length === 0 ? (
            <div className="text-center py-20">
              <Search size={48} className="mx-auto mb-4 text-text-muted/30" />
              <p className="text-base text-text-muted">
                {searchQuery || activeFilter
                  ? "검색 조건에 해당하는 강사가 없습니다."
                  : "등록된 강사가 없습니다."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {filteredInstructors.map((inst) => (
                <Link
                  key={inst.id}
                  href={`/instructors/${inst.id}`}
                  className="group bg-white rounded-xl border border-border-light overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300"
                >
                  {/* 프로필 사진 */}
                  <div className="aspect-[4/5] w-full bg-primary/5 overflow-hidden">
                    {inst.profile_image_url ? (
                      <img
                        src={inst.profile_image_url}
                        alt={inst.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <span className="text-primary font-bold text-4xl">
                          {inst.name[0]}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 정보 */}
                  <div className="p-4">
                    <h3 className="text-base font-bold text-text group-hover:text-primary transition-colors truncate">
                      {inst.name}
                    </h3>

                    {inst.career_summary && (
                      <p className="mt-1 text-xs text-text-sub line-clamp-2 leading-relaxed">
                        {inst.career_summary.split("\n").filter(Boolean).slice(0, 2).join(" / ")}
                      </p>
                    )}

                    {inst.specialties && inst.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {inst.specialties.slice(0, 3).map((s, idx) => (
                          <span
                            key={s}
                            className={cn(
                              "px-2 py-0.5 text-[10px] font-medium rounded-full",
                              tagColors[idx % tagColors.length]
                            )}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t border-border-light">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:gap-2 transition-all">
                        상세보기 <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
