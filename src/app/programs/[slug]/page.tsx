import { notFound } from "next/navigation";
import Link from "next/link";
import { SubpageHero } from "@/components/layout/SubpageHero";
import { getProgramBySlug, getProgramInstructors, getProgramImages } from "@/lib/supabase/queries";
import ImageSlider from "@/components/programs/ImageSlider";
import { Clock, Users, BookOpen, ArrowRight, CheckCircle, ChevronDown } from "lucide-react";

export default async function ProgramDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);
  if (!program) notFound();

  const category = (program as unknown as Record<string, unknown>).categories as { id: string; name: string; slug: string } | null;
  const [instructors, images] = await Promise.all([
    getProgramInstructors(program.id),
    getProgramImages(program.id),
  ]);

  return (
    <>
      <SubpageHero
        title={program.title}
        subtitle={program.subtitle}
        breadcrumb={[
          { label: "교육프로그램", href: "/programs" },
          ...(category ? [{ label: category.name, href: `/programs?category=${category.slug}` }] : []),
          { label: program.title },
        ]}
      />

      <section className="py-16 lg:py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            {/* 과정 개요 */}
            <div className="grid sm:grid-cols-3 gap-4 mb-10">
              {program.target_audience && (
                <div className="flex items-center gap-3 bg-surface rounded-xl p-4">
                  <Users size={20} className="text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-text-muted">교육 대상</p>
                    <p className="text-sm font-medium text-text">{program.target_audience}</p>
                  </div>
                </div>
              )}
              {program.duration && (
                <div className="flex items-center gap-3 bg-surface rounded-xl p-4">
                  <Clock size={20} className="text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-text-muted">소요 시간</p>
                    <p className="text-sm font-medium text-text">{program.duration}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 bg-surface rounded-xl p-4">
                <BookOpen size={20} className="text-primary shrink-0" />
                <div>
                  <p className="text-xs text-text-muted">교육 방식</p>
                  <p className="text-sm font-medium text-text">대면/비대면</p>
                </div>
              </div>
            </div>

            {/* 과정소개 이미지 슬라이드 */}
            {images.length > 0 && (
              <div className="mb-10">
                <h2 className="text-xl font-bold text-text mb-4">과정 소개</h2>
                <ImageSlider images={images} />
              </div>
            )}

            {/* 과정 설명 */}
            {program.description && (
              <div className="mb-10">
                <h2 className="text-xl font-bold text-text mb-4">과정 개요</h2>
                <p className="text-text-sub leading-relaxed">{program.description}</p>
              </div>
            )}

            {/* 교육 특징 */}
            {program.features && program.features.length > 0 && (
              <div className="mb-10">
                <h2 className="text-xl font-bold text-text mb-4">교육 특징</h2>
                <div className="grid sm:grid-cols-3 gap-4">
                  {program.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-3 bg-accent/5 rounded-xl p-4">
                      <CheckCircle size={18} className="text-accent mt-0.5 shrink-0" />
                      <span className="text-sm text-text">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 커리큘럼 */}
            {program.curriculum && program.curriculum.length > 0 && (
              <div className="mb-10">
                <h2 className="text-xl font-bold text-text mb-4">커리큘럼</h2>
                <div className="space-y-3">
                  {program.curriculum.map((mod, i) => (
                    <div key={i} className="border border-border-light rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between p-4 bg-surface">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-accent">{mod.module}</span>
                          <span className="font-medium text-text text-sm">{mod.title}</span>
                        </div>
                        <span className="text-xs text-text-muted">{mod.hours}</span>
                      </div>
                      <div className="p-4 space-y-1.5">
                        {mod.topics.map((topic, j) => (
                          <div key={j} className="flex items-center gap-2 text-sm text-text-sub">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                            {topic}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 기대효과 */}
            {program.learning_outcomes && program.learning_outcomes.length > 0 && (
              <div className="mb-10">
                <h2 className="text-xl font-bold text-text mb-4">기대 효과</h2>
                <ul className="space-y-2">
                  {program.learning_outcomes.map((o, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-text-sub">
                      <CheckCircle size={16} className="text-success mt-0.5 shrink-0" />
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 담당 강사진 */}
            <div className="mb-10">
              <h2 className="text-xl font-bold text-text mb-4">담당 강사진</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {instructors.slice(0, 2).map((inst) => (
                  <Link key={inst.id} href={`/instructors/${inst.id}`} className="flex items-center gap-3 p-4 bg-surface rounded-xl hover:bg-surface-dark transition-colors">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {inst.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text">{inst.name}</p>
                      <p className="text-xs text-text-muted">{inst.specialties?.slice(0, 2).join(" · ")}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-primary rounded-xl p-8 text-center">
              <h3 className="text-lg font-bold text-white mb-2">이 교육이 필요하신가요?</h3>
              <p className="text-white/60 text-sm mb-5">맞춤 교육 프로그램을 제안해드립니다.</p>
              <Link
                href="/inquiry"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-white/90 text-primary font-semibold rounded-lg transition-colors"
              >
                교육 문의하기 <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
