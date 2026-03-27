import { notFound } from "next/navigation";
import Link from "next/link";
import { SubpageHero } from "@/components/layout/SubpageHero";
import { mockInstructors } from "@/lib/mock-data";
import { BookOpen } from "lucide-react";

export default async function InstructorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const instructor = mockInstructors.find((i) => i.id === id);
  if (!instructor) notFound();

  return (
    <>
      <SubpageHero
        title={instructor.name}
        breadcrumb={[{ label: "강사진", href: "/instructors" }, { label: instructor.name }]}
      />
      <section className="py-16 lg:py-20">
        <div className="container-custom max-w-4xl">
          <div className="flex flex-col md:flex-row gap-8 mb-10">
            {/* 프로필 이미지 */}
            <div className="shrink-0">
              <div className="w-40 h-40 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-5xl">
                {instructor.name[0]}
              </div>
            </div>

            {/* 정보 */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-text mb-2">{instructor.name}</h2>

              {/* 전문 분야 태그 */}
              {instructor.specialties && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {instructor.specialties.map((s) => (
                    <span key={s} className="px-3 py-1 text-xs font-medium text-primary bg-primary/5 rounded-full">
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {/* 경력 */}
              {instructor.career_summary && (
                <div className="space-y-1 text-sm text-text-sub">
                  {instructor.career_summary.split("\n").map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 소개글 */}
          {instructor.bio && (
            <div className="mb-10">
              <h3 className="text-lg font-bold text-text mb-3">소개</h3>
              <p className="text-text-sub leading-relaxed">{instructor.bio}</p>
            </div>
          )}

          {/* 강의 영상 placeholder */}
          {instructor.video_url && (
            <div className="mb-10">
              <h3 className="text-lg font-bold text-text mb-3">강의 영상</h3>
              <div className="aspect-video bg-surface rounded-xl flex items-center justify-center">
                <p className="text-text-muted text-sm">강의 영상 영역</p>
              </div>
            </div>
          )}

          {/* 담당 교육프로그램 */}
          <div>
            <h3 className="text-lg font-bold text-text mb-3">담당 교육프로그램</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link href="/programs/gen-ai-training" className="flex items-center gap-3 p-4 bg-surface rounded-xl hover:bg-surface-dark transition-colors">
                <BookOpen size={20} className="text-primary shrink-0" />
                <div>
                  <p className="text-sm font-medium text-text">생성형 AI 활용 교육</p>
                  <p className="text-xs text-text-muted">AI·에듀테크</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
