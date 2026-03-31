import { getCurrentUser, getApplicationsByUser } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { ApplicationStatus } from "@/types";
import { CreditCard } from "lucide-react";

export const metadata = { title: "지원이력" };

const statusLabels: Record<ApplicationStatus, { label: string; cls: string }> = {
  pending: { label: "대기중", cls: "bg-gray-100 text-gray-500" },
  deposit_pending: { label: "보증금 결제 대기", cls: "bg-yellow-100 text-yellow-600" },
  submitted: { label: "접수완료", cls: "bg-blue-100 text-blue-600" },
  reviewing: { label: "심사중", cls: "bg-yellow-100 text-yellow-700" },
  selected: { label: "강사확정", cls: "bg-green-100 text-green-700" },
  confirmed: { label: "최종확정", cls: "bg-emerald-100 text-emerald-700" },
  standby: { label: "예비강사", cls: "bg-amber-100 text-amber-600" },
  rejected: { label: "미선발", cls: "bg-red-100 text-red-500" },
  cancelled: { label: "취소", cls: "bg-gray-100 text-gray-400" },
};

const resultMessages: Partial<Record<ApplicationStatus, { msg: string; cls: string }>> = {
  selected: {
    msg: "축하합니다! 강사로 선발되셨습니다. 보증금 결제를 완료하시면 최종 확정됩니다.",
    cls: "bg-green-50 border-green-200 text-green-700",
  },
  confirmed: {
    msg: "보증금 결제가 완료되어 최종 확정되었습니다. 담당자가 곧 연락드리겠습니다.",
    cls: "bg-emerald-50 border-emerald-200 text-emerald-700",
  },
  standby: {
    msg: "예비강사로 선정되었습니다. 강사 변동 시 우선 연락드리겠습니다.",
    cls: "bg-amber-50 border-amber-200 text-amber-700",
  },
  reviewing: {
    msg: "현재 심사가 진행 중입니다. 결과가 나오면 알려드리겠습니다.",
    cls: "bg-yellow-50 border-yellow-200 text-yellow-700",
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
              ? (app.rejection_reason || app.admin_note || "이번 강의에 함께하지 못하게 되어 죄송합니다. 다음 기회에 꼭 함께하길 바랍니다.")
              : null;
            const isUnread = app.is_result_read === false && ["selected", "confirmed", "standby", "rejected"].includes(app.status);

            return (
              <Link key={app.id} href={`/mypage/applications/${app.id}`} className="block">
                <div className="bg-white rounded-xl border border-border-light overflow-hidden hover:border-primary/30 hover:shadow-sm transition-all">
                  {/* 상단: 강의 정보 + 상태 */}
                  <div className="p-4 sm:p-5 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <span className="text-base font-semibold text-text">
                        {app.lecture?.title ?? "(삭제된 공고)"}
                      </span>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-text-sub">
                        {app.lecture?.lecture_date && <span>강의일: {app.lecture.lecture_date}</span>}
                        {app.lecture?.location && <span>장소: {app.lecture.location}</span>}
                        <span>지원일: {new Date(app.created_at).toLocaleDateString("ko-KR")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isUnread && (
                        <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded">NEW</span>
                      )}
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.cls}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* 결과 메시지 */}
                  {result && (
                    <div className={`mx-4 sm:mx-5 mb-4 p-3 rounded-lg border text-sm ${result.cls}`}>
                      {app.status === "rejected" ? rejectedMsg : result.msg}
                    </div>
                  )}

                  {/* 강사확정 → 보증금 결제 안내 */}
                  {app.status === "selected" && (
                    <div className="mx-4 sm:mx-5 mb-4">
                      <span className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white rounded-lg text-sm font-semibold">
                        <CreditCard size={16} />
                        상세 보기에서 보증금 결제하기 (30,000원)
                      </span>
                    </div>
                  )}

                  {/* 예비강사 순위 표시 */}
                  {app.status === "standby" && app.standby_rank && (
                    <div className="mx-4 sm:mx-5 mb-4 text-xs text-amber-600">
                      예비 순위: {app.standby_rank}순위
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
