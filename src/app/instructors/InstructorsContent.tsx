"use client";

import { useState } from "react";
import Link from "next/link";
import { SubpageHero } from "@/components/layout/SubpageHero";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types";

export default function InstructorsContent({ instructors }: { instructors: Profile[] }) {
  const [activeFilter, setActiveFilter] = useState("");

  const filteredInstructors = activeFilter
    ? instructors.filter((inst) => inst.specialties?.some((s) => s.includes(activeFilter)))
    : instructors;

  const filterTags = ["AI교육", "진로교육", "교육컨설팅", "리더십", "에듀테크"];

  return (
    <>
      <SubpageHero
        title="강사진"
        subtitle="KECA 소속 전문 교육 강사진을 소개합니다"
        breadcrumb={[{ label: "강사진" }]}
      />
      <section className="py-16 lg:py-20">
        <div className="container-custom">
          {/* 분야 필터 */}
          <div className="flex flex-wrap gap-2 mb-10">
            <button
              onClick={() => setActiveFilter("")}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-full border transition-colors",
                !activeFilter ? "bg-primary text-white border-primary" : "bg-white text-text-sub border-border hover:border-primary hover:text-primary"
              )}
            >
              전체
            </button>
            {filterTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveFilter(tag)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-full border transition-colors",
                  activeFilter === tag ? "bg-primary text-white border-primary" : "bg-white text-text-sub border-border hover:border-primary hover:text-primary"
                )}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* 강사 카드 그리드 */}
          {filteredInstructors.length === 0 && (
            <div className="text-center py-20 text-text-muted">
              {activeFilter ? `"${activeFilter}" 분야의 강사가 없습니다.` : "등록된 강사가 없습니다."}
            </div>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInstructors.map((inst) => (
              <Link
                key={inst.id}
                href={`/instructors/${inst.id}`}
                className="group bg-white rounded-xl border border-border-light overflow-hidden card-hover"
              >
                <div className="p-6 text-center">
                  {/* 프로필 아바타 */}
                  <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center overflow-hidden mb-4">
                    {inst.profile_image_url ? (
                      <img src={inst.profile_image_url} alt={inst.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-primary font-bold text-3xl">{inst.name[0]}</span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors">
                    {inst.name}
                  </h3>

                  {/* 경력 */}
                  {inst.career_summary && (
                    <div className="mt-3 pt-3 border-t border-border-light">
                      <div className="text-xs text-text-sub text-left space-y-1">
                        {inst.career_summary.split("\n").slice(0, 3).map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 전문 분야 태그 */}
                  {inst.specialties && (
                    <div className="mt-3 pt-3 border-t border-border-light flex flex-wrap justify-center gap-1.5">
                      {inst.specialties.map((s) => (
                        <span key={s} className="px-2 py-0.5 text-xs font-medium text-primary bg-primary/5 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
