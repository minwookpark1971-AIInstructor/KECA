import Link from "next/link";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { SubpageHero } from "@/components/layout/SubpageHero";
import { getCurrentUser, getInstructorPrograms } from "@/lib/supabase/queries";
import { User, BookOpen, Edit, Eye, EyeOff, ChevronRight } from "lucide-react";

export const metadata: Metadata = { title: "강사 대시보드" };

export default async function InstructorDashboardPage() {
  const instructor = await getCurrentUser();
  if (!instructor) redirect("/login");
  const assignedPrograms = await getInstructorPrograms(instructor.id);

  return (
    <>
      <SubpageHero title="강사 대시보드" breadcrumb={[{ label: "강사" }]} />
      <section className="py-16 lg:py-20">
        <div className="container-custom max-w-4xl">
          {/* 프로필 상태 */}
          <div className="bg-white border border-border-light rounded-2xl p-6 lg:p-8 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                <User size={28} className="text-purple-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-text">{instructor.name} 강사님</h2>
                <p className="text-sm text-text-sub mt-0.5">{instructor.email}</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="flex items-center gap-1 text-xs text-text-muted">
                    {instructor.is_profile_public ? (
                      <><Eye size={12} className="text-success" /> 프로필 공개</>
                    ) : (
                      <><EyeOff size={12} /> 프로필 비공개</>
                    )}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-text-muted">
                    <BookOpen size={12} /> 배정 프로그램: {assignedPrograms.length}개
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 빠른 메뉴 */}
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <Link
              href="/instructor/profile"
              className="flex items-center gap-4 bg-white border border-border-light rounded-xl p-5 card-hover"
            >
              <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                <Edit size={22} className="text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-text">프로필 관리</h3>
                <p className="text-xs text-text-muted mt-0.5">소개, 경력, 전문분야, 이미지, 영상</p>
              </div>
              <ChevronRight size={16} className="text-text-muted" />
            </Link>
            <Link
              href="/instructor/programs"
              className="flex items-center gap-4 bg-white border border-border-light rounded-xl p-5 card-hover"
            >
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <BookOpen size={22} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-text">배정된 교육프로그램</h3>
                <p className="text-xs text-text-muted mt-0.5">담당 교육 과정 확인</p>
              </div>
              <ChevronRight size={16} className="text-text-muted" />
            </Link>
          </div>

          {/* 전문분야 태그 */}
          {instructor.specialties && instructor.specialties.length > 0 && (
            <div className="bg-white border border-border-light rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-text mb-3">전문분야</h3>
              <div className="flex flex-wrap gap-2">
                {instructor.specialties.map((s) => (
                  <span key={s} className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
