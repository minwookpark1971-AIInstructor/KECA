import { getLectureById, getApplicationsByLecture, getStatusHistory } from "@/lib/supabase/queries";
import { getCurrentUser } from "@/lib/supabase/queries";
import { notFound } from "next/navigation";
import ApplicantsClient from "./ApplicantsClient";
import type { StatusHistory } from "@/types";

export const metadata = { title: "지원자 관리" };

export default async function ApplicantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [lecture, applications, user] = await Promise.all([
    getLectureById(id),
    getApplicationsByLecture(id),
    getCurrentUser(),
  ]);

  if (!lecture || !user) notFound();

  // 각 지원자의 상태 변경 이력 조회
  const historyEntries = await Promise.all(
    applications.map(async (app) => {
      const history = await getStatusHistory(app.id);
      return [app.id, history] as [string, StatusHistory[]];
    })
  );
  const statusHistories = Object.fromEntries(historyEntries);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text">{lecture.title}</h1>
        <p className="text-sm text-text-sub mt-1">
          필요 강사: {lecture.required_count}명 · 최대 접수: {lecture.max_applicants ?? "-"}명 ·
          지원자: {applications.length}명
        </p>
      </div>
      <ApplicantsClient
        lecture={lecture}
        applications={applications}
        adminId={user.id}
        statusHistories={statusHistories}
      />
    </div>
  );
}
