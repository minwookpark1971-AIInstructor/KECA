import Link from "next/link";
import { Metadata } from "next";
import { SubpageHero } from "@/components/layout/SubpageHero";
import { mockPrograms, getCategoryById } from "@/lib/mock-data";
import { BookOpen, Clock, Users, ChevronRight } from "lucide-react";

export const metadata: Metadata = { title: "배정된 교육프로그램" };

export default function InstructorProgramsPage() {
  // 목업: 발행된 프로그램 중 일부를 배정된 것으로 표시
  const assignedPrograms = mockPrograms.filter((p) => p.status === "published").slice(0, 4);

  return (
    <>
      <SubpageHero
        title="배정된 교육프로그램"
        breadcrumb={[{ label: "강사", href: "/instructor" }, { label: "배정된 프로그램" }]}
      />
      <section className="py-16 lg:py-20">
        <div className="container-custom max-w-4xl">
          {assignedPrograms.length > 0 ? (
            <div className="space-y-4">
              {assignedPrograms.map((program) => {
                const category = getCategoryById(program.category_id || "");
                return (
                  <Link
                    key={program.id}
                    href={`/programs/${program.slug}`}
                    className="flex items-center gap-4 bg-white border border-border-light rounded-xl p-5 card-hover"
                  >
                    <div className="w-12 h-12 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                      <BookOpen size={22} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {category && (
                        <span className="text-xs font-medium text-accent">{category.name}</span>
                      )}
                      <h3 className="text-sm font-semibold text-text mt-0.5">{program.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                        {program.target_audience && (
                          <span className="flex items-center gap-1"><Users size={12} /> {program.target_audience}</span>
                        )}
                        {program.duration && (
                          <span className="flex items-center gap-1"><Clock size={12} /> {program.duration}</span>
                        )}
                      </div>
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 text-xs rounded-full font-medium ${
                      program.status === "published" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                    }`}>
                      {program.status === "published" ? "공개" : program.status}
                    </span>
                    <ChevronRight size={16} className="text-text-muted shrink-0" />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <BookOpen size={48} className="mx-auto text-text-muted/30 mb-4" />
              <p className="text-text-sub">배정된 교육프로그램이 없습니다.</p>
              <p className="text-sm text-text-muted mt-1">관리자가 프로그램을 배정하면 여기에 표시됩니다.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
