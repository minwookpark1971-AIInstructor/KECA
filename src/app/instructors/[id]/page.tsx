import { notFound } from "next/navigation";
import Link from "next/link";
import { SubpageHero } from "@/components/layout/SubpageHero";
import { getInstructorById, getInstructorPrograms } from "@/lib/supabase/queries";
import { BookOpen } from "lucide-react";

export default async function InstructorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const instructor = await getInstructorById(id);
  if (!instructor) notFound();

  const instructorPrograms = await getInstructorPrograms(instructor.id);

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
              <div className="w-40 h-40 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden">
                {instructor.profile_image_url ? (
                  <img src={instructor.profile_image_url} alt={instructor.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-primary font-bold text-5xl">{instructor.name[0]}</span>
                )}
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

          {/* 강의 영상 */}
          {instructor.video_url && (() => {
            const match = instructor.video_url!.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
            const ytId = match ? match[1] : null;
            return (
              <div className="mb-10">
                <h3 className="text-lg font-bold text-text mb-3">강의 영상</h3>
                {ytId ? (
                  <div className="aspect-video rounded-xl overflow-hidden">
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}`}
                      className="w-full h-full"
                      allowFullScreen
                      title={`${instructor.name} 강의 영상`}
                    />
                  </div>
                ) : (
                  <a href={instructor.video_url!} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                    영상 보기 →
                  </a>
                )}
              </div>
            );
          })()}

          {/* 프로필 카드 이미지 */}
          {instructor.profile_card_url && (
            <div className="mb-10">
              <h3 className="text-lg font-bold text-text mb-3">프로필</h3>
              <div className="rounded-xl overflow-hidden border border-border-light">
                <img src={instructor.profile_card_url} alt={`${instructor.name} 프로필`} className="w-full object-contain" />
              </div>
            </div>
          )}

          {/* 담당 교육프로그램 */}
          {instructorPrograms.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-text mb-3">담당 교육프로그램</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {instructorPrograms.map((prog) => {
                  const cat = (prog as unknown as Record<string, unknown>).categories as { name: string } | null;
                  return (
                    <Link key={prog.id} href={`/programs/${prog.slug}`} className="flex items-center gap-3 p-4 bg-surface rounded-xl hover:bg-surface-dark transition-colors">
                      <BookOpen size={20} className="text-primary shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-text">{prog.title}</p>
                        {cat && <p className="text-xs text-text-muted">{cat.name}</p>}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
