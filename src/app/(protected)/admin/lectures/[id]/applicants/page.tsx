import { getLectureById, getApplicationsByLecture } from "@/lib/supabase/queries";
import { notFound } from "next/navigation";
import ApplicantsClient from "./ApplicantsClient";

export const metadata = { title: "지원자 관리" };

export default async function ApplicantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [lecture, applications] = await Promise.all([
    getLectureById(id),
    getApplicationsByLecture(id),
  ]);

  if (!lecture) notFound();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text">{lecture.title}</h1>
        <p className="text-sm text-text-sub mt-1">
          필요 강사: {lecture.required_count}명 · 최대 접수: {lecture.max_applicants ?? "-"}명 ·
          지원자: {applications.length}명
        </p>
      </div>
      <ApplicantsClient lecture={lecture} applications={applications} />
    </div>
  );
}
