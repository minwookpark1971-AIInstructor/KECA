import { getCurrentUser, getApplicationsByUser } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { ApplicationStatus } from "@/types";

export const metadata = { title: "지원이력" };

const statusLabels: Record<ApplicationStatus, { label: string; cls: string }> = {
  pending: { label: "대기중", cls: "bg-gray-100 text-gray-500" },
  deposit_pending: { label: "예치금 결제 대기", cls: "bg-yellow-100 text-yellow-600" },
  submitted: { label: "접수완료", cls: "bg-blue-100 text-blue-600" },
  selected: { label: "강사확정", cls: "bg-green-100 text-green-700" },
  standby: { label: "예비강사", cls: "bg-amber-100 text-amber-600" },
  rejected: { label: "미선발", cls: "bg-red-100 text-red-500" },
  cancelled: { label: "취소", cls: "bg-gray-100 text-gray-400" },
};

const resultMessages: Partial<Record<ApplicationStatus, { msg: string; cls: string }>> = {
  selected: {
    msg: "축하합니다! 강사로 선발되셨습니다. 담당자가 곧 연락드리겠습니다.",
    cls: "bg-green-50 border-green-200 text-green-700",
  },
  standby: {
    msg: "예비강사로 선정되었습니다. 강사 변동 시 우선 연락드리겠습니다.",
    cls: "bg-amber-50 border-amber-200 text-amber-700",
  },
  rejected: {
    msg: "",
    cls: "bg-gray-50 border-gray-200 text-gray-600",
  },
};

export default async function ApplicationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/mypage/applications");

  const applications = await getApplicationsByUser(user.id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">지원이력</h1>
        <Link href="/lectures" className="text-sm text-primary hover:underline">
          강의공고 보기 →
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-xl border border-border-light p-12 text-center">
          <p className="text-text-sub mb-4">아직 지원한 강의공고가 없습니다.</p>
          <Link
            href="/lectures"
            className="inline-block px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            강의공고 보러가기
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const statusInfo = statusLabels[app.status];
            const result = resultMessages[app.status];
            const rejectedMsg = app.status === "rejected"
              ? (app.admin_note || "이번 강의에 함께하지 못하게 되어 죄송합니다. 다음 기회에 꼭 함께하길 바랍니다.")
              : null;

            return (
              <div key={app.id} className="bg-white rounded-xl border border-border-light overflow-hidden">
                {/* 상단: 강의 정보 + 상태 */}
                <div className="p-4 sm:p-5 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {app.lecture ? (
                      <Link
                        href={`/lectures/${app.lecture_id}`}
                        className="text-base font-semibold text-text hover:text-primary transition-colors"
                      >
                        {app.lecture.title}
                      </Link>
                    ) : (
                      <span className="text-base font-semibold text-text">(삭제된 공고)</span>
                    )}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-text-sub">
                      {app.lecture?.lecture_date && (
                        <span>강의일: {app.lecture.lecture_date}</span>
                      )}
                      {app.lecture?.location && (
                        <span>장소: {app.lecture.location}</span>
                      )}
                      <span>지원일: {new Date(app.created_at).toLocaleDateString("ko-KR")}</span>
                    </div>
                  </div>
                  <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.cls}`}>
                    {statusInfo.label}
                  </span>
                </div>

                {/* 결과 메시지 (선발/예비/미선발 시) */}
                {result && (
                  <div className={`mx-4 sm:mx-5 mb-4 p-3 rounded-lg border text-sm ${result.cls}`}>
                    {app.status === "rejected" ? rejectedMsg : result.msg}
                  </div>
                )}

                {/* 예치금 결제 안내 */}
                {app.status === "deposit_pending" && (
                  <div className="mx-4 sm:mx-5 mb-4 p-3 rounded-lg border bg-yellow-50 border-yellow-200 text-sm text-yellow-700 flex items-center justify-between">
                    <span>예치금 결제가 필요합니다.</span>
                    <Link
                      href={`/lectures/${app.lecture_id}`}
                      className="text-xs font-medium text-primary underline"
                    >
                      결제하기 →
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
